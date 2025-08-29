
#!/usr/bin/env python3
"""
Startup script for DCAlytics ML Service
"""
import os
import sys
import subprocess
import signal
from pathlib import Path

def install_dependencies():
    """Install required Python packages"""
    print("Installing ML service dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def start_service():
    """Start the ML service"""
    print("Starting DCAlytics ML Service...")
    
    # Change to the ml-service directory
    os.chdir(Path(__file__).parent)
    
    # Start the FastAPI server
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8001",
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\nShutting down ML service...")
        sys.exit(0)

if __name__ == "__main__":
    if "--install" in sys.argv:
        install_dependencies()
    
    start_service()
