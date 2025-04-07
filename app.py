
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

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    if path == "":
        return send_from_directory('frontend', 'index.html')
    try:
        # Primeiro tenta servir do diretório frontend
        return send_from_directory('frontend', path)
    except:
        try:
            # Depois tenta do diretório frontend/js
            return send_from_directory('frontend/js', path)
        except:
            try:
                # Depois tenta do diretório frontend/css
                return send_from_directory('frontend/css', path)
            except:
                # Se nada for encontrado, retorna o index.html
                return send_from_directory('frontend', 'index.html')

@app.before_request
def create_tables():
    """Create database tables before first request"""
    try:
        db.create_all()
        app.logger.info("Database tables created successfully")
    except Exception as e:
        app.logger.error(f"Error creating database tables: {str(e)}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
