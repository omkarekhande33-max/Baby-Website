import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Ensure both project root and backend directory are in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)

for path in [PROJECT_ROOT, CURRENT_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

try:
    from backend.database import init_db
    from backend.routers import artwork, profile, games, audio
except ImportError:
    from database import init_db
    from routers import artwork, profile, games, audio

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database on startup
    init_db()
    yield

app = FastAPI(
    title="Baby WonderLand API",
    description="Sensory Web Playground & Future Expansion Backend for Baby WonderLand",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for future mobile apps, tablets, and microfrontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(artwork.router)
app.include_router(profile.router)
app.include_router(games.router)
app.include_router(audio.router)

# Mount Static Directories for Frontend Assets
css_dir = os.path.join(PROJECT_ROOT, "css")
js_dir = os.path.join(PROJECT_ROOT, "js")
assets_dir = os.path.join(PROJECT_ROOT, "assets")

if os.path.exists(css_dir):
    app.mount("/css", StaticFiles(directory=css_dir), name="css")
if os.path.exists(js_dir):
    app.mount("/js", StaticFiles(directory=js_dir), name="js")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

# Serve Main Frontend HTML
@app.get("/", include_in_schema=False)
async def serve_index():
    index_file = os.path.join(PROJECT_ROOT, "index.html")
    return FileResponse(index_file)

@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "app": "Baby WonderLand",
        "version": "2.0.0",
        "features": {
            "mascot_physics": True,
            "finger_paints": True,
            "lightning_trike": True,
            "toy_robot": True,
            "pure_web_audio": True,
            "baby_gallery": True,
            "sticker_book": True,
            "sqlite_persistence": True
        }
    }
