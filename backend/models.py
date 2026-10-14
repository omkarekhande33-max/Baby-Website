from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BabyProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)
    age_months: Optional[int] = Field(None, ge=0, le=72)
    favorite_color: Optional[str] = Field(None, max_length=20)
    theme_pref: Optional[str] = Field(None, pattern="^(day|night)$")
    sound_volume: Optional[float] = Field(None, ge=0.0, le=1.0)

class BabyProfileResponse(BaseModel):
    id: int
    name: str
    age_months: int
    favorite_color: str
    theme_pref: str
    sound_volume: float
    updated_at: str

class ArtworkCreate(BaseModel):
    title: Optional[str] = "Baby Masterpiece"
    image_data: str # Base64 data URL
    brush_mode: Optional[str] = "glow"

class ArtworkResponse(BaseModel):
    id: int
    title: str
    image_data: str
    brush_mode: str
    created_at: str

class TrikeScoreCreate(BaseModel):
    stars_collected: int = Field(..., ge=0)
    distance: float = Field(0.0, ge=0.0)

class TrikeScoreResponse(BaseModel):
    id: int
    stars_collected: int
    distance: float
    played_at: str

class StickerUnlock(BaseModel):
    sticker_id: str
    title: str
    description: Optional[str] = ""
    icon: str

class StickerResponse(BaseModel):
    id: int
    sticker_id: str
    title: str
    description: Optional[str]
    icon: str
    unlocked_at: str
