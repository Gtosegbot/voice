"""
Authentication utilities for the VoiceAI platform
"""

import jwt
from functools import wraps
from flask import request, jsonify, current_app, g
from backend.models.db import db

def token_required(f):
    """Decorator for requiring token authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check if token exists in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({'success': False, 'message': 'Token is missing or invalid'}), 401
        
        if not token:
            return jsonify({'success': False, 'message': 'Token is missing'}), 401
        
        try:
            # Decode token
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            
            # Get user from database
            from backend.models.user import User
            user = User.query.filter_by(id=payload['user_id']).first()
            
            if not user:
                return jsonify({'success': False, 'message': 'User not found'}), 401
            
            # Store user in flask g object for use in route
            g.user = user
            
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'message': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    
    return decorated