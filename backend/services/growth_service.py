import math
from typing import List, Dict, Any

# Standard Sugarcane Sigmoid Height Benchmark (ICAR / IISR standard)
# Age in days -> expected height in cm
def get_ideal_height_for_age(age_days: int) -> float:
    """Sigmoidal growth curve for tropical sugarcane reaching ~320cm at 300 days."""
    if age_days <= 0:
        return 0.0
    # Logistic curve: L / (1 + exp(-k * (x - x0)))
    L = 330.0  # Max height in cm
    k = 0.024  # Steepness
    x0 = 150.0 # Midpoint day
    height = L / (1.0 + math.exp(-k * (age_days - x0)))
    return round(float(height), 1)

def analyze_growth_trend(observations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyzes list of crop observations sorted by observation_date / age.
    Compares observed height with ideal standard curve.
    """
    if not observations:
        return {
            "trend": "No Data",
            "growth_rate_cm_per_day": 0.0,
            "height_deviation_cm": 0.0,
            "vigor_status": "Awaiting Data",
            "historical_chart_data": []
        }

    # Sort by crop age
    sorted_obs = sorted(observations, key=lambda x: x["crop_age"])
    latest = sorted_obs[-1]
    ideal_latest = get_ideal_height_for_age(latest["crop_age"])
    deviation = latest["plant_height"] - ideal_latest

    # Growth rate
    if len(sorted_obs) >= 2:
        first = sorted_obs[0]
        days_span = latest["crop_age"] - first["crop_age"]
        height_diff = latest["plant_height"] - first["plant_height"]
        rate = round(height_diff / max(1, days_span), 2)
    else:
        rate = round(latest["plant_height"] / max(1, latest["crop_age"]), 2)

    if deviation >= 10.0:
        vigor = "Vigorous / Above Benchmark"
    elif deviation >= -15.0:
        vigor = "Optimal / On Track"
    else:
        vigor = "Stunted / Deficit"

    # Chart data points
    chart_points = []
    for obs in sorted_obs:
        age = obs["crop_age"]
        chart_points.append({
            "date": str(obs["observation_date"]),
            "crop_age": age,
            "actual_height": obs["plant_height"],
            "ideal_height": get_ideal_height_for_age(age),
            "growth_stage": obs["growth_stage"],
            "leaf_condition": obs["leaf_condition"]
        })

    return {
        "trend": "Positive" if rate > 0 else "Stagnant",
        "growth_rate_cm_per_day": rate,
        "height_deviation_cm": round(deviation, 1),
        "vigor_status": vigor,
        "historical_chart_data": chart_points
    }
