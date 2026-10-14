from fastapi import APIRouter
from datetime import datetime

try:
    from backend.database import get_connection
    from backend.models import BabyProfileUpdate, BabyProfileResponse
except ImportError:
    from database import get_connection
    from models import BabyProfileUpdate, BabyProfileResponse

router = APIRouter(prefix="/api/profile", tags=["Baby Profile"])

@router.get("", response_model=BabyProfileResponse)
def get_profile():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM baby_profile WHERE id = 1;")
    row = cursor.fetchone()
    conn.close()
    return dict(row)

@router.put("", response_model=BabyProfileResponse)
def update_profile(payload: BabyProfileUpdate):
    conn = get_connection()
    cursor = conn.cursor()
    
    # Fetch current values
    cursor.execute("SELECT * FROM baby_profile WHERE id = 1;")
    curr = dict(cursor.fetchone())

    name = payload.name if payload.name is not None else curr["name"]
    age_months = payload.age_months if payload.age_months is not None else curr["age_months"]
    favorite_color = payload.favorite_color if payload.favorite_color is not None else curr["favorite_color"]
    theme_pref = payload.theme_pref if payload.theme_pref is not None else curr["theme_pref"]
    sound_volume = payload.sound_volume if payload.sound_volume is not None else curr["sound_volume"]

    cursor.execute("""
    UPDATE baby_profile
    SET name = ?, age_months = ?, favorite_color = ?, theme_pref = ?, sound_volume = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1;
    """, (name, age_months, favorite_color, theme_pref, sound_volume))
    conn.commit()

    cursor.execute("SELECT * FROM baby_profile WHERE id = 1;")
    updated = cursor.fetchone()
    conn.close()
    return dict(updated)
