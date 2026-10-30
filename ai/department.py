
from gemini_client import CivicAnalysis


DEPARTMENT_MAPPING = {
    "road_damage": {
        "department": "Roads and Public Works",
        "action": "Inspect damaged pavement and arrange road repairs."
    },
    "garbage": {
        "department": "Sanitation and Solid Waste Management",
        "action": "Arrange waste collection and inspect the affected area."
    },
    "water_leakage": {
        "department": "Water Supply Department",
        "action": "Inspect the water line and locate the leakage."
    },
    "drainage": {
        "department": "Drainage and Sewerage Department",
        "action": "Inspect and clear the affected drainage system."
    },
    "streetlight_damage": {
        "department": "Electrical and Street Lighting Department",
        "action": "Inspect the streetlight and arrange repairs."
    },
    "bridge_damage": {
        "department": "Roads and Bridges Department",
        "action": "Arrange a structural inspection."
    },
    "pollution": {
        "department": "Environmental and Pollution Control Department",
        "action": "Inspect the reported pollution source."
    },
    "other_civic_issue": {
        "department": "General Civic Services",
        "action": "Review the report and identify the responsible department."
    }
}


# Emergency indicators based on visual evidence
EMERGENCY_INDICATORS = [
    "structural collapse",
    "collapsed concrete slabs",
    "collapsed building",
    "collapsed bridge",
    "bridge span collapsed",
    "risk of further collapse",
    "unstable structure",
    "unstable debris",
    "potential entrapment",
    "massive concrete debris",
    "catastrophic structural failure",
    "further debris falling"
]


def recommend_department(analysis: CivicAnalysis):

    category = analysis.category

    if (
        category in ["uncertain", "not_civic_issue"]
        or analysis.confidence < 0.60
    ):
        return {
            "department": None,
            "recommended_action": "Send report for manual review.",
            "routing_status": "manual_review"
        }

    # Examine the entire AI assessment,
    # not just the predicted category.

    text = " ".join([
        analysis.issue_summary,
        *analysis.observations,
        *analysis.safety_concerns,
        analysis.recommended_action
    ]).lower()

    # Emergency conditions take precedence over
    # ordinary department classification.

    emergency_matches = [
        indicator
        for indicator in EMERGENCY_INDICATORS
        if indicator in text
    ]

    if emergency_matches:
        return {
            "department": "Emergency and Disaster Management",
            "recommended_action": (
                "Request urgent human assessment, site security "
                "and structural inspection. Trained emergency "
                "responders should assess whether rescue operations "
                "are necessary."
            ),
            "routing_status": "urgent_human_review",
            "manual_review_required": True,
            "evidence": emergency_matches
        }

    result = DEPARTMENT_MAPPING.get(category)

    if result is None:
        return {
            "department": None,
            "recommended_action": "Department mapping unavailable.",
            "routing_status": "manual_review"
        }

    return {
        "department": result["department"],
        "recommended_action": result["action"],
        "routing_status": "recommendation_only",
        "manual_review_required": False
    }
