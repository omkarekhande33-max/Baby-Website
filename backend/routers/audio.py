from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/audio", tags=["Audio & Sensory"])

class SoundPreset(BaseModel):
    id: str
    name: str
    description: str
    scale: List[float]
    tempo_bpm: int

@router.get("/presets")
def get_audio_presets():
    return [
        {
            "id": "pentatonic_soothing",
            "name": "Gentle Celestial Chimes",
            "description": "Harmonic C-major pentatonic scale specifically designed for soothing baby sensory stimulation.",
            "frequencies": [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]
        },
        {
            "id": "lullaby_twinkle",
            "name": "Twinkle Twinkle Music Box",
            "description": "Hypnotic, gentle music box notes for relaxation and bedtime calmness.",
            "frequencies": [261.63, 392.00, 440.00, 523.25]
        },
        {
            "id": "playful_bubbles",
            "name": "Sunny Meadow Bells",
            "description": "Bubbly energetic pitches for daytime active finger play.",
            "frequencies": [329.63, 392.00, 493.88, 587.33, 659.25]
        }
    ]
