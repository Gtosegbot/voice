"""
Authentication service for the VoiceAI platform
"""

import os
import jwt
import bcrypt
from datetime import datetime, timedelta
from backend.models.db import User

# Get JWT secret from environment variables or use a default for development
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-for-development')
JWT_EXPIRATION = os.environ.get('JWT_EXPIRATION', 86400)  # 24 hours in seconds

def hash_password(password):
    """Hash password using bcrypt"""
    # Generate a salt and hash the password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def check_password(password, hashed_password):
    """Check if password matches the hashed password"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def generate_token(user):
    """Generate JWT token for a user"""
    payload = {
        'user_id': user.id,
        'email': user.email,
        'role': user.role,
        'exp': datetime.utcnow() + timedelta(seconds=int(JWT_EXPIRATION))
    }
    
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_token(token):
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise jwt.ExpiredSignatureError('Token expired')
    except jwt.InvalidTokenError:
        raise jwt.InvalidTokenError('Invalid token')

def get_user_from_token(token):
    """Get user from JWT token"""
    try:
        payload = verify_token(token)
        user_id = payload.get('user_id')
        
        if not user_id:
            return None
        
        user = User.query.get(user_id)
        return user
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        raise