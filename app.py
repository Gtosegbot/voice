"""
VoiceAI Platform - Main application entry point
"""

from backend import create_app
from backend.models.db import db
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = create_app()

@app.before_first_request
def create_tables():
    """Create database tables before first request"""
    db.create_all()

if __name__ == '__main__':
    # Run the application
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    app.run(host=host, port=port, debug=debug)