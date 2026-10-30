
from gemini_client import CivicAnalysis


CRITICAL_INDICATORS = [
    "bridge collapse",
    "collapsed bridge",
    "bridge span collapsed",
    "span section collapsed",
    "structural collapse",
    "catastrophic structural failure",
    "collapsed section",
    "separated from its supporting",
    "abutment failure",
    "pier failure",
    "unstable structure",
    "unstable sections",
    "further debris falling",
    "extreme risk",
    "sinkhole",
    "exposed live wire",
    "live electrical wire",
    "road completely blocked",
    "major structural failure",
    "close all access points",
]

HIGH_INDICATORS = [
    "deep pothole",
    "large pothole",
    "severe cracking",
    "severe crack",
    "road submerged",
    "loss of control",
    "high risk",
    "major flooding",
    "displaced and broken",
    "major road damage",
    "serious structural damage",
    "falling debris",
    "unstable support",
]

MODERATE_INDICATORS = [
    "pothole",
    "cracking",
    "crack",
    "leakage",
    "overflow",
    "blocked drain",
    "broken streetlight",
    "garbage accumulation",
    "damaged pavement",
    "exposed sub-base",
    "damaged railing",
    "minor structural damage",
]

SAFETY_INDICATORS = [
    "pedestrian",
    "cyclist",
    "bicycle",
    "motorcycle",
    "vehicle",
    "traffic",
    "fall",
    "injury",
    "slip",
    "debris",
    "electrocution",
]

EXTENT_INDICATORS = [
    "extensive",
    "numerous",
    "multiple",
    "widespread",
    "majority",
    "large",
    "severe",
    "deep",
    "catastrophic",
]


def calculate_severity(analysis: CivicAnalysis):

    if analysis.category == "not_civic_issue":
        return {
            "severity": None,
            "priority": "not_applicable",
            "reasons": ["Image does not show a civic issue."],
            "manual_review": False,
            "method": "rule_based_v2"
        }

    if (
        analysis.category == "uncertain"
        or analysis.confidence < 0.60
        or not analysis.observations
    ):
        return {
            "severity": None,
            "priority": "manual_review",
            "reasons": [
                "Insufficient confidence or visual evidence."
            ],
            "manual_review": True,
            "method": "rule_based_v2"
        }

    # Include the summary as well as observations.
    # Previously, important information in the summary
    # was being ignored.

    text = " ".join([
        analysis.issue_summary,
        *analysis.observations,
        *analysis.safety_concerns,
        analysis.recommended_action
    ]).lower()

    critical = [
        word for word in CRITICAL_INDICATORS
        if word in text
    ]

    high = [
        word for word in HIGH_INDICATORS
        if word in text
    ]

    moderate = [
        word for word in MODERATE_INDICATORS
        if word in text
    ]

    safety = [
        word for word in SAFETY_INDICATORS
        if word in text
    ]

    extent = [
        word for word in EXTENT_INDICATORS
        if word in text
    ]

    reasons = []

    # Critical hazards take precedence.
    if critical:
        score = 5
        reasons.append(
            "Critical hazard evidence: " + ", ".join(critical)
        )

    elif high:
        score = 4
        reasons.append(
            "High-severity evidence: " + ", ".join(high)
        )

    elif moderate:
        score = 3
        reasons.append(
            "Moderate-severity evidence: " + ", ".join(moderate)
        )

    else:
        score = 2
        reasons.append(
            "Civic issue detected without sufficient "
            "severity indicators."
        )

    if safety:
        reasons.append(
            "Potential safety exposure: " + ", ".join(safety)
        )

    # Increase priority only up to high.
    # Explicit critical hazards are already handled above.
    if not critical and safety and extent and score >= 3:
        score = min(4, score + 1)

        reasons.append(
            "Widespread damage and safety exposure "
            "increase priority."
        )

    priorities = {
        1: "low",
        2: "low",
        3: "moderate",
        4: "high",
        5: "critical"
    }

    # High and critical findings need human verification.
    manual_review = score >= 4

    return {
        "severity": score,
        "priority": priorities[score],
        "reasons": reasons,
        "manual_review": manual_review,
        "method": "rule_based_v2"
    }
