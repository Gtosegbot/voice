"""
Authentication service for the VoiceAI platform
"""

import os
import jwt
import bcrypt
from datetime import datetime, timedelta
from backend.models.db import User

# Secret key for JWT
JWT_SECRET = os.environ.get('JWT_SECRET', 'voiceai-secret-key')
# JWT token expiration (default: 24 hours)
JWT_EXPIRATION = int(os.environ.get('JWT_EXPIRATION', 86400))

def hash_password(password):
    """Hash password using bcrypt"""
    # Generate salt
    salt = bcrypt.gensalt()
    # Hash password
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    # Return string representation
    return hashed.decode('utf-8')

def check_password(password, hashed_password):
    """Check if password matches the hashed password"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def generate_token(user):
    """Generate JWT token for a user"""
    payload = {
        'sub': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(seconds=JWT_EXPIRATION)
    }
    
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_token(token):
    """Verify JWT token and return payload"""
    return jwt.decode(token, JWT_SECRET, algorithms=['HS256'])

def get_user_from_token(token):
    """Get user from JWT token"""
    try:
        # Verify token and get user ID
        payload = verify_token(token)
        user_id = payload.get('sub')
        
        # Get user from database
        user = User.query.get(user_id)
        
        return user
    except Exception:
        return None
