from fastapi import APIRouter
from typing import List

try:
    from backend.database import get_connection
    from backend.models import TrikeScoreCreate, TrikeScoreResponse, StickerUnlock, StickerResponse
except ImportError:
    from database import get_connection
    from models import TrikeScoreCreate, TrikeScoreResponse, StickerUnlock, StickerResponse

router = APIRouter(prefix="/api/games", tags=["Games & Stickers"])

@router.post("/trike/score", response_model=TrikeScoreResponse, status_code=201)
def record_trike_score(payload: TrikeScoreCreate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO trike_scores (stars_collected, distance)
    VALUES (?, ?)
    """, (payload.stars_collected, payload.distance))
    conn.commit()
    new_id = cursor.lastrowid

    # Check for achievement unlocks
    if payload.stars_collected >= 5:
        cursor.execute("""
        INSERT OR IGNORE INTO stickers_unlocked (sticker_id, title, description, icon)
        VALUES ('star_rider', 'Super Star Rider', 'Collected 5+ stars in Lightning Trike!', '⚡')
        """)
    if payload.stars_collected >= 15:
        cursor.execute("""
        INSERT OR IGNORE INTO stickers_unlocked (sticker_id, title, description, icon)
        VALUES ('galaxy_champion', 'Galaxy Champion', 'Collected 15+ stars like a champ!', '🚀')
        """)
    conn.commit()

    cursor.execute("SELECT * FROM trike_scores WHERE id = ?", (new_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row)

@router.get("/trike/stats")
def get_trike_stats():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT 
        COUNT(*) as total_rides,
        COALESCE(SUM(stars_collected), 0) as total_stars,
        COALESCE(MAX(stars_collected), 0) as best_stars_in_one_run
    FROM trike_scores;
    """)
    stats = dict(cursor.fetchone())
    conn.close()
    return stats

@router.get("/stickers", response_model=List[StickerResponse])
def get_stickers():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stickers_unlocked ORDER BY unlocked_at DESC;")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@router.post("/stickers/unlock", response_model=StickerResponse, status_code=201)
def unlock_sticker(payload: StickerUnlock):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR IGNORE INTO stickers_unlocked (sticker_id, title, description, icon)
    VALUES (?, ?, ?, ?)
    """, (payload.sticker_id, payload.title, payload.description, payload.icon))
    conn.commit()
    cursor.execute("SELECT * FROM stickers_unlocked WHERE sticker_id = ?", (payload.sticker_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row)
