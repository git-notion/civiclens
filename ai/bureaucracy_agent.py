"""CivicLens browser-based public-service application assistant.

MVP behavior:
- Opens a user-supplied public service portal with Playwright.
- Inspects visible form controls and their labels/options.
- Uses Gemini to map form fields to *profile key names only* (not profile values).
- Fills fields using the values held locally in the Python process.
- Moves through simple multi-step forms using Next/Continue buttons.
- Stops before final submission, payment, declarations, CAPTCHA, OTP, or login.
- Returns a draft receipt and screenshots for human review.

This module does not bypass access controls and does not submit applications.
"""

from __future__ import annotations

import asyncio
import json
import os
import re
import uuid
from pathlib import Path
from typing import Any, Literal
from urllib.parse import urlparse

from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError


BASE_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
ARTIFACTS_DIR.mkdir(exist_ok=True)


class FieldMapping(BaseModel):
    field_key: str
    profile_key: str
    confidence: float = Field(ge=0, le=1)
    reason: str = ""


class MappingResponse(BaseModel):
    mappings: list[FieldMapping] = Field(default_factory=list)


class BrowserAgentError(RuntimeError):
    pass


def _get_gemini_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise BrowserAgentError("GEMINI_API_KEY is missing from the AI service environment.")
    return genai.Client(api_key=api_key)


def _model_name() -> str:
    # Reuse the model configured for the existing CivicLens AI service.
    return (
        os.getenv("CIVICLENS_AGENT_MODEL")
        or os.getenv("GEMINI_MODEL")
        or "gemini-2.5-flash"
    )


def _flatten_profile(profile: dict[str, Any], prefix: str = "") -> dict[str, Any]:
    """Flatten nested profile fields into dotted keys while retaining values locally."""
    flattened: dict[str, Any] = {}
    for key, value in profile.items():
        dotted = f"{prefix}.{key}" if prefix else str(key)
        if isinstance(value, dict):
            flattened.update(_flatten_profile(value, dotted))
        else:
            flattened[dotted] = value
    return flattened


def _safe_profile_key_catalog(flat_profile: dict[str, Any]) -> list[dict[str, str]]:
    """Only field names and data types go to Gemini; actual citizen values stay local."""
    catalog = []
    for key, value in flat_profile.items():
        catalog.append({
            "key": key,
            "type": type(value).__name__,
        })
    return catalog


def _is_sensitive_control(field: dict[str, Any]) -> bool:
    text = " ".join([
        str(field.get("label", "")),
        str(field.get("name", "")),
        str(field.get("placeholder", "")),
    ]).lower()
    blocked = (
        "password", "passcode", "otp", "one time password", "verification code",
        "captcha", "security code", "cvv", "pin number",
    )
    return field.get("type") == "password" or any(term in text for term in blocked)


def _is_declaration_or_consent(field: dict[str, Any]) -> bool:
    text = " ".join([
        str(field.get("label", "")),
        str(field.get("name", "")),
    ]).lower()
    terms = (
        "i agree", "declaration", "undertaking", "consent", "authorize",
        "authorise", "terms and conditions", "true and correct", "i certify",
    )
    return any(term in text for term in terms)


def _map_fields_with_gemini(
    service_request: str,
    fields: list[dict[str, Any]],
    profile_key_catalog: list[dict[str, str]],
) -> MappingResponse:
    client = _get_gemini_client()
    prompt = f"""
You are mapping a citizen's existing profile fields to fields on a public-service web form.
Return only mappings that are strongly supported by the field label and profile key name.
Do not invent values or profile keys. Do not map passwords, OTPs, CAPTCHA, declarations,
consents, undertakings, or payment fields. Do not infer missing personal information.
Use the field_key exactly as supplied and profile_key exactly as supplied.
Only map fields with confidence >= 0.75.

Requested service: {service_request}

Visible form fields:
{json.dumps(fields, ensure_ascii=False)}

Available profile keys (values are intentionally not provided):
{json.dumps(profile_key_catalog, ensure_ascii=False)}
"""
    response = client.models.generate_content(
        model=_model_name(),
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=MappingResponse,
            temperature=0,
        ),
    )
    if getattr(response, "parsed", None) is not None:
        return MappingResponse.model_validate(response.parsed)
    if not response.text:
        raise BrowserAgentError("Gemini returned an empty field-mapping response.")
    return MappingResponse.model_validate_json(response.text)


async def _inspect_fields(page) -> list[dict[str, Any]]:
    """Read visible fields and assign stable per-page identifiers."""
    return await page.evaluate("""() => {
      const nodes = Array.from(document.querySelectorAll('input, textarea, select'));
      const visible = nodes.filter(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' &&
               rect.width > 0 && rect.height > 0 &&
               !['hidden','submit','button','reset','image'].includes((el.type || '').toLowerCase());
      });
      return visible.map((el, i) => {
        const key = `f${i}`;
        el.setAttribute('data-civiclens-field', key);
        const labels = el.labels ? Array.from(el.labels).map(x => x.innerText || x.textContent || '') : [];
        const ariaLabel = el.getAttribute('aria-label') || '';
        const labelledBy = el.getAttribute('aria-labelledby');
        const labelledText = labelledBy ? (document.getElementById(labelledBy)?.innerText || '') : '';
        const parentText = el.parentElement?.innerText || '';
        const label = (labels.join(' ') || ariaLabel || labelledText || el.getAttribute('placeholder') ||
                       el.getAttribute('name') || el.id || parentText).trim().slice(0, 220);
        const options = el.tagName === 'SELECT'
          ? Array.from(el.options).map(o => ({label: (o.label || o.textContent || '').trim(), value: o.value})).slice(0, 60)
          : [];
        return {
          field_key: key,
          label,
          name: el.getAttribute('name') || '',
          id: el.id || '',
          placeholder: el.getAttribute('placeholder') || '',
          tag: el.tagName.toLowerCase(),
          type: (el.getAttribute('type') || el.tagName).toLowerCase(),
          required: !!el.required || el.getAttribute('aria-required') === 'true',
          options
        };
      });
    }""")


async def _fill_one_field(page, field: dict[str, Any], value: Any) -> tuple[bool, str]:
    key = field["field_key"]
    locator = page.locator(f'[data-civiclens-field="{key}"]')
    field_type = str(field.get("type", "")).lower()
    tag = str(field.get("tag", "")).lower()

    if value is None or isinstance(value, (dict, list)):
        return False, "Profile value is empty or unsupported."
    if _is_sensitive_control(field) or _is_declaration_or_consent(field):
        return False, "Sensitive credential or declaration requires direct citizen action."

    try:
        if tag == "select":
            raw = str(value).strip()
            try:
                await locator.select_option(label=raw, timeout=4000)
            except Exception:
                await locator.select_option(value=raw, timeout=4000)
        elif field_type == "checkbox":
            if not isinstance(value, bool):
                return False, "Checkbox requires an explicit true/false profile value."
            if value:
                await locator.check(timeout=4000)
            else:
                await locator.uncheck(timeout=4000)
        elif field_type == "radio":
            # Only select if the value exactly matches this radio's value or label.
            radio_value = await locator.get_attribute("value")
            radio_label = str(field.get("label", "")).strip()
            if str(value).strip().casefold() not in {
                str(radio_value or "").strip().casefold(), radio_label.casefold()
            }:
                return False, "Radio option does not exactly match the profile value."
            await locator.check(timeout=4000)
        else:
            await locator.fill(str(value), timeout=5000)
        return True, "Filled from citizen profile."
    except Exception as exc:
        return False, f"Could not fill this control: {type(exc).__name__}."


async def _find_next_button(page):
    pattern = re.compile(r"^(next|next step|continue|save and continue)$", re.I)
    buttons = page.get_by_role("button", name=pattern)
    if await buttons.count():
        return buttons.first
    links = page.get_by_role("link", name=pattern)
    if await links.count():
        return links.first
    return None


async def _page_requires_human_access(page, fields: list[dict[str, Any]]) -> str | None:
    body_text = (await page.locator("body").inner_text(timeout=3000)).lower()
    if any(str(f.get("type", "")).lower() == "password" for f in fields):
        return "Login or password field detected; complete authentication manually."
    if "captcha" in body_text or "i'm not a robot" in body_text or "verify you are human" in body_text:
        return "CAPTCHA or human-verification challenge detected; solve it manually."
    if any(term in body_text for term in ("one-time password", "enter otp", "verification code")):
        return "OTP or verification challenge detected; complete it manually."
    return None


async def run_bureaucracy_agent(
    portal_url: str,
    service_request: str,
    citizen_profile: dict[str, Any],
    *,
    max_steps: int = 5,
    headless: bool = True,
) -> dict[str, Any]:
    """Prepare a government-service application draft; never perform final submission."""
    parsed = urlparse(portal_url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("portal_url must be a valid http:// or https:// URL.")
    if not service_request.strip():
        raise ValueError("service_request cannot be empty.")
    if not isinstance(citizen_profile, dict) or not citizen_profile:
        raise ValueError("citizen_profile must be a non-empty JSON object.")
    if len(json.dumps(citizen_profile, ensure_ascii=False)) > 20_000:
        raise ValueError("citizen_profile is too large (maximum 20 KB).")

    flat_profile = _flatten_profile(citizen_profile)
    profile_catalog = _safe_profile_key_catalog(flat_profile)
    receipt_id = f"CIV-{uuid.uuid4().hex[:10].upper()}"
    filled_fields: list[dict[str, str]] = []
    missing_fields: list[dict[str, str]] = []
    page_history: list[dict[str, str]] = []
    screenshot_paths: list[str] = []
    status = "draft_ready_for_review"
    stop_reason = "Reached the review stage. Final submission is disabled in this MVP."

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=headless)
        context = await browser.new_context(
            viewport={"width": 1440, "height": 1000},
            accept_downloads=False,
        )
        page = await context.new_page()
        page.set_default_timeout(8000)

        try:
            await page.goto(portal_url, wait_until="domcontentloaded", timeout=30000)
            for step in range(1, max_steps + 1):
                try:
                    await page.wait_for_load_state("domcontentloaded", timeout=8000)
                except PlaywrightTimeoutError:
                    pass

                title = await page.title()
                current_url = page.url
                page_history.append({"step": str(step), "title": title, "url": current_url})
                fields = await _inspect_fields(page)

                access_block = await _page_requires_human_access(page, fields)
                if access_block:
                    status = "needs_human_action"
                    stop_reason = access_block
                    break

                if not fields:
                    status = "no_form_detected"
                    stop_reason = "No visible application form fields were detected on this page."
                    break

                safe_fields = [
                    field for field in fields
                    if not _is_sensitive_control(field) and not _is_declaration_or_consent(field)
                ]
                mapping_response = _map_fields_with_gemini(
                    service_request, safe_fields, profile_catalog
                )
                field_by_key = {f["field_key"]: f for f in fields}
                used_keys: set[str] = set()

                for mapping in mapping_response.mappings:
                    field = field_by_key.get(mapping.field_key)
                    if not field or mapping.profile_key not in flat_profile:
                        continue
                    if mapping.confidence < 0.75:
                        continue
                    if mapping.field_key in used_keys:
                        continue
                    success, detail = await _fill_one_field(
                        page, field, flat_profile[mapping.profile_key]
                    )
                    used_keys.add(mapping.field_key)
                    if success:
                        filled_fields.append({
                            "step": str(step),
                            "field": str(field.get("label") or mapping.field_key),
                            "profile_key": mapping.profile_key,
                        })
                    elif field.get("required"):
                        missing_fields.append({
                            "step": str(step),
                            "field": str(field.get("label") or mapping.field_key),
                            "reason": detail,
                        })

                # Required fields with no safe mapping stay for citizen review.
                for field in fields:
                    if field.get("required") and field["field_key"] not in used_keys:
                        reason = (
                            "Declaration/consent must be confirmed by the citizen."
                            if _is_declaration_or_consent(field)
                            else "No confident matching value exists in the supplied profile."
                        )
                        item = {
                            "step": str(step),
                            "field": str(field.get("label") or field["field_key"]),
                            "reason": reason,
                        }
                        if item not in missing_fields:
                            missing_fields.append(item)

                screenshot_path = ARTIFACTS_DIR / f"{receipt_id.lower()}_step_{step}.png"
                await page.screenshot(path=str(screenshot_path), full_page=True)
                screenshot_paths.append(str(screenshot_path))

                # Do not advance while required fields need citizen input.
                if any(item["step"] == str(step) for item in missing_fields):
                    status = "needs_user_input"
                    stop_reason = "Some required fields need citizen input or confirmation."
                    break

                # Continue through ordinary multi-step forms only. Never click Submit/Pay/Confirm.
                next_button = await _find_next_button(page)
                if next_button is None:
                    submit_buttons = page.get_by_role(
                        "button", name=re.compile(r"(submit|apply|pay|confirm|final|send)", re.I)
                    )
                    if await submit_buttons.count():
                        status = "draft_ready_for_review"
                        stop_reason = "Application fields are filled. Review the page and submit manually."
                    else:
                        status = "draft_ready_for_review"
                        stop_reason = "No safe Next/Continue control found; review the current page manually."
                    break

                if step == max_steps:
                    status = "max_steps_reached"
                    stop_reason = f"Stopped after the configured limit of {max_steps} pages."
                    break

                await next_button.click()
                try:
                    await page.wait_for_load_state("domcontentloaded", timeout=8000)
                except PlaywrightTimeoutError:
                    await page.wait_for_timeout(1200)

        except PlaywrightTimeoutError as exc:
            status = "navigation_timeout"
            stop_reason = f"The portal did not respond in time ({type(exc).__name__})."
        except Exception as exc:
            status = "agent_error"
            stop_reason = f"Browser agent stopped safely ({type(exc).__name__})."
        finally:
            # Keep the visible browser open briefly so a human can inspect the
            # completed draft before the session is closed.
            if not headless and screenshot_paths:
                try:
                    await page.wait_for_timeout(8000)
                except Exception:
                    pass
            await context.close()
            await browser.close()

    return {
        "receipt_id": receipt_id,
        "status": status,
        "service_request": service_request,
        "portal_url": portal_url,
        "final_url": page_history[-1]["url"] if page_history else portal_url,
        "pages_visited": page_history,
        "filled_fields": filled_fields,
        "missing_or_manual_fields": missing_fields,
        "screenshots": screenshot_paths,
        "stop_reason": stop_reason,
        "submitted": False,
        "message": "Draft only. Verify every field and complete final submission yourself on the official portal.",
    }
