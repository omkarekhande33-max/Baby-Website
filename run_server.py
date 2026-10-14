import uvicorn
import os
import sys

if __name__ == "__main__":
    # Ensure current directory is in sys.path
    project_dir = os.path.dirname(os.path.abspath(__file__))
    if project_dir not in sys.path:
        sys.path.insert(0, project_dir)

    print("=" * 60)
    print("Starting Baby WonderLand Full-Stack Server...")
    print("Frontend Application:        http://localhost:8000")
    print("Backend API Swagger Docs:    http://localhost:8000/docs")
    print("ReDoc Documentation:         http://localhost:8000/redoc")
    print("=" * 60)

    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
