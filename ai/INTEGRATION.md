# CivicLens — Autonomous Public Service Agent (AI module)

## 1. Install in the existing `ai/` virtual environment

```bash
pip install playwright
python -m playwright install chromium
```

`google-genai` and `pydantic` should already be installed by the existing CivicLens AI service.

## 2. Add `bureaucracy_agent.py` to `ai/`

Copy the provided file into the repository's `ai/` directory. It reuses `GEMINI_API_KEY` and `GEMINI_MODEL` from the existing environment. Optionally set `CIVICLENS_AGENT_MODEL` to override the model only for this module.

Add this to `ai/requirements.txt` if it is not already present:

```text
playwright
```

After installing Playwright, run `python -m playwright install chromium` once on the machine/container that runs the AI service.

## 3. Add this to `ai/app.py`

Add imports:

```python
from typing import Any
from pydantic import BaseModel, HttpUrl, Field
from fastapi import HTTPException
from bureaucracy_agent import run_bureaucracy_agent
```

Add the request model and route:

```python
class BureaucracyRequest(BaseModel):
    portal_url: HttpUrl
    service_request: str = Field(min_length=5, max_length=500)
    citizen_profile: dict[str, Any]
    max_steps: int = Field(default=5, ge=1, le=8)


@app.post("/bureaucracy/prepare")
async def prepare_public_service_application(request: BureaucracyRequest):
    try:
        return await run_bureaucracy_agent(
            portal_url=str(request.portal_url),
            service_request=request.service_request,
            citizen_profile=request.citizen_profile,
            max_steps=request.max_steps,
            headless=False,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Application preparation failed: {type(exc).__name__}")
```

If `app.py` already imports `BaseModel`, `Field`, or `HTTPException`, do not duplicate those imports.

## 4. Test request

Use a portal that you are authorized to access. For a buildathon demonstration, use dummy data and a safe demo form rather than a real citizen's account.

```bash
curl -X POST http://127.0.0.1:8000/bureaucracy/prepare ^
  -H "Content-Type: application/json" ^
  -d "{\"portal_url\":\"https://YOUR-DEMO-PORTAL/form\",\"service_request\":\"Prepare a student scholarship application\",\"citizen_profile\":{\"full_name\":\"Aarav Kumar\",\"date_of_birth\":\"2006-04-12\",\"email\":\"aarav.demo@example.com\",\"mobile_number\":\"9000000000\",\"college_name\":\"Demo Institute\",\"course\":\"BTech\",\"annual_family_income\":\"180000\",\"category\":\"General\"},\"max_steps\":5}"
```

For the live demo, set `headless=False` in the route so Chromium is visible. After the last screenshot, the agent keeps the browser open for 8 seconds so judges can inspect it, then closes it. The agent returns a `receipt_id`, pages visited, fields filled (without echoing personal values), fields requiring manual input, screenshots and a status.

## Safety / demo scope

- The agent never clicks final Submit / Apply / Pay / Confirm buttons.
- It does not handle or bypass passwords, OTPs, CAPTCHA, payment, declarations or consent.
- The AI sees profile key names and types, not the citizen's profile values. The actual values are filled locally by Playwright.
- Do not use real Aadhaar, PAN, bank, or other sensitive values for the demo. Use synthetic data.
- Store `ai/artifacts/` in `.gitignore`; screenshots can contain personal information.
- Real portals may have anti-automation controls, unusual widgets, file uploads or accessibility limitations. The agent stops and reports these cases rather than defeating controls.
