
import math


ACTIVE_STATUSES = {
    "submitted",
    "under_review",
    "pending",
    "open"
}


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate geographical distance between two
    GPS coordinates in metres.
    """

    earth_radius = 6371000

    lat1, lon1, lat2, lon2 = map(
        math.radians,
        [lat1, lon1, lat2, lon2]
    )

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    return earth_radius * c


def valid_coordinates(latitude, longitude):
    return (
        isinstance(latitude, (int, float))
        and isinstance(longitude, (int, float))
        and math.isfinite(latitude)
        and math.isfinite(longitude)
        and -90 <= latitude <= 90
        and -180 <= longitude <= 180
    )


def find_possible_duplicates(
    latitude,
    longitude,
    category,
    existing_reports,
    radius_m=100
):
    """
    Find active reports with the same category
    within a specified geographical radius.

    existing_reports must contain real database records.
    """

    if not valid_coordinates(latitude, longitude):
        raise ValueError("Invalid submitted GPS coordinates.")

    if not isinstance(radius_m, (int, float)) or not (
        math.isfinite(radius_m) and 0 < radius_m <= 10000
    ):
        raise ValueError("Invalid search radius.")

    category = str(category).strip().lower()

    # Generic classifications are too broad for
    # automatic duplicate matching.
    if category in {
        "other_civic_issue",
        "uncertain",
        "not_civic_issue"
    }:
        return {
            "duplicate_found": False,
            "manual_review": True,
            "matches": [],
            "reason": "Category is too broad for reliable matching."
        }

    matches = []

    for report in existing_reports:

        if not isinstance(report, dict):
            continue

        existing_category = str(
            report.get("category", "")
        ).strip().lower()

        status = str(
            report.get("status", "")
        ).strip().lower()

        if existing_category != category:
            continue

        if status not in ACTIVE_STATUSES:
            continue

        old_lat = report.get("latitude")
        old_lon = report.get("longitude")

        if not valid_coordinates(old_lat, old_lon):
            continue

        distance = haversine_distance(
            latitude,
            longitude,
            old_lat,
            old_lon
        )

        if distance <= radius_m:
            matches.append({
                "report_id": report.get("id"),
                "category": existing_category,
                "distance_m": round(distance, 2),
                "status": status,
                "created_at": report.get("created_at")
            })

    matches.sort(
        key=lambda item: item["distance_m"]
    )

    return {
        "duplicate_found": len(matches) > 0,
        "manual_review": len(matches) > 0,
        "matches": matches,
        "radius_m": radius_m,
        "method": "haversine_category_v1"
    }
