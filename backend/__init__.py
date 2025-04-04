"""
VoiceAI Platform - Main application package
"""

from flask import Flask, jsonify
from flask_cors import CORS
from backend.models.db import db
from backend.api.auth import auth_bp
from backend.api.leads import leads_bp
from backend.api.conversations import conversations_bp

def create_app():
    """Create Flask application"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_mapping(
        SECRET_KEY='voiceai-secret',
        SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URL'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False
    )
    
    # Initialize CORS
    CORS(app)
    
    # Initialize database
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(leads_bp, url_prefix='/api/leads')
    app.register_blueprint(conversations_bp, url_prefix='/api/conversations')
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({'status': 'healthy'}), 200
    
    return app

# Add missing import
import os
