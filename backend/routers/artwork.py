from fastapi import APIRouter, HTTPException
from typing import List

try:
    from backend.database import get_connection
    from backend.models import ArtworkCreate, ArtworkResponse
except ImportError:
    from database import get_connection
    from models import ArtworkCreate, ArtworkResponse

router = APIRouter(prefix="/api/artworks", tags=["Artworks"])

@router.get("", response_model=List[ArtworkResponse])
def get_all_artworks():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM artworks ORDER BY created_at DESC;")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@router.post("", response_model=ArtworkResponse, status_code=201)
def save_artwork(payload: ArtworkCreate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO artworks (title, image_data, brush_mode)
    VALUES (?, ?, ?)
    """, (payload.title, payload.image_data, payload.brush_mode))
    conn.commit()
    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM artworks WHERE id = ?", (new_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row)

@router.delete("/{artwork_id}")
def delete_artwork(artwork_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM artworks WHERE id = ?", (artwork_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    if affected == 0:
        raise HTTPException(status_code=404, detail="Artwork not found")
    return {"message": "Artwork deleted successfully", "id": artwork_id}
