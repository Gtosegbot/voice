"""
VoiceAI Platform - Main application package
"""

from flask import Flask
from flask_cors import CORS
from backend.models.db import db
import os

def create_app():
    """Create Flask application"""
    app = Flask(__name__)
    
    # Configure the database
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Enable CORS
    CORS(app)
    
    # Initialize database
    db.init_app(app)
    
    # Register blueprints
    from backend.api.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # Create a route for testing
    @app.route('/api/health')
    def health_check():
        return {'status': 'ok', 'message': 'VoiceAI Platform API is running'}
    
    return app