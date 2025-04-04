"""
VoiceAI Platform - Main application entry point
"""

from backend import create_app
from backend.models.db import db
import os

app = create_app()

# Use app.before_request instead of before_first_request in newer Flask versions
@app.before_request
def create_tables():
    """Create database tables before first request"""
    try:
        db.create_all()
        app.logger.info("Database tables created successfully")
    except Exception as e:
        app.logger.error(f"Error creating database tables: {str(e)}")

if __name__ == '__main__':
    # Get port from environment or use default (5001)
    port = int(os.environ.get('PORT', 5001))
    # Run the application
    app.run(host='0.0.0.0', port=port, debug=True)
