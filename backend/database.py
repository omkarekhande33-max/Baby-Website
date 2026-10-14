import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "baby_wonderland.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Baby Profile Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS baby_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        name TEXT DEFAULT 'Little Sunshine',
        age_months INTEGER DEFAULT 12,
        favorite_color TEXT DEFAULT '#FF6584',
        theme_pref TEXT DEFAULT 'day',
        sound_volume REAL DEFAULT 0.7,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Seed initial profile if not exists
    cursor.execute("""
    INSERT OR IGNORE INTO baby_profile (id, name, age_months, favorite_color, theme_pref, sound_volume)
    VALUES (1, 'Little Sunshine', 12, '#FF6584', 'day', 0.7);
    """)

    # Saved Artworks Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS artworks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        image_data TEXT NOT NULL,
        brush_mode TEXT DEFAULT 'glow',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Trike Scores & Stats Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trike_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stars_collected INTEGER DEFAULT 0,
        distance REAL DEFAULT 0,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Unlocked Stickers / Badges Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS stickers_unlocked (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sticker_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT NOT NULL,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Default unlocked starter stickers
    default_stickers = [
        ("starter_bear", "Pip's Best Friend", "Met Pip the Bear in the Wonder Garden!", "🧸"),
        ("first_stroke", "Rainbow Painter", "Made your very first finger painting!", "🎨")
    ]

    for sid, title, desc, icon in default_stickers:
        cursor.execute("""
        INSERT OR IGNORE INTO stickers_unlocked (sticker_id, title, description, icon)
        VALUES (?, ?, ?, ?);
        """, (sid, title, desc, icon))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)
