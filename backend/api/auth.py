"""
Authentication API endpoints for the VoiceAI platform
"""

from flask import Blueprint, request, jsonify
from backend.models.db import db, User
from backend.services.auth_service import hash_password, check_password, generate_token, verify_token
import jwt
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    # Get request data
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password required'}), 400
    
    # Get user by email
    user = User.query.filter_by(email=data.get('email')).first()
    
    # If user not found or password is incorrect
    if not user or not check_password(data.get('password'), user.password):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    # Generate JWT token
    token = generate_token(user)
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
    }), 200


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    # Get request data
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Name, email and password required'}), 400
    
    # Check if email already exists
    existing_user = User.query.filter_by(email=data.get('email')).first()
    if existing_user:
        return jsonify({'message': 'Email already in use'}), 409
    
    # Create new user
    new_user = User(
        name=data.get('name'),
        email=data.get('email'),
        password=hash_password(data.get('password')),
        role=data.get('role', 'agent'),
        phone=data.get('phone', ''),
        job_title=data.get('jobTitle', '')
    )
    
    # Save to database
    db.session.add(new_user)
    db.session.commit()
    
    # Generate JWT token
    token = generate_token(new_user)
    
    return jsonify({
        'token': token,
        'user': {
            'id': new_user.id,
            'name': new_user.name,
            'email': new_user.email,
            'role': new_user.role
        }
    }), 201


@auth_bp.route('/me', methods=['GET'])
def get_me():
    """Get current user details from token"""
    # Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Missing or invalid token'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Verify token and get user ID
        payload = verify_token(token)
        user_id = payload.get('sub')
        
        # Get user from database
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'phone': user.phone,
                'jobTitle': user.job_title
            }
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@auth_bp.route('/password', methods=['PUT'])
def change_password():
    """Change user password"""
    # Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Missing or invalid token'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Verify token and get user ID
        payload = verify_token(token)
        user_id = payload.get('sub')
        
        # Get request data
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('currentPassword') or not data.get('newPassword'):
            return jsonify({'message': 'Current password and new password required'}), 400
        
        # Get user from database
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Check current password
        if not check_password(data.get('currentPassword'), user.password):
            return jsonify({'message': 'Current password is incorrect'}), 401
        
        # Update password
        user.password = hash_password(data.get('newPassword'))
        user.updated_at = datetime.utcnow()
        
        # Save to database
        db.session.commit()
        
        return jsonify({
            'message': 'Password updated successfully'
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user (client-side only)"""
    return jsonify({
        'message': 'Logged out successfully'
    }), 200
