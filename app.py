
"""
VoiceAI Platform - Main application entry point
"""

from flask import Flask, send_from_directory, send_file
from backend import create_app
from backend.models.db import db
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = create_app()

@app.route('/')
def serve_index():
    try:
        return send_from_directory('frontend', 'index.html')
    except:
        return send_from_directory('.', 'index.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('frontend', path)

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
    # Get port from environment or use default (5000)
    port = int(os.environ.get('PORT', 5000))
    
    # Run the application
    app.run(host='0.0.0.0', port=port, debug=True)
