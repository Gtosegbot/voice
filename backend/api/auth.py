"""
Authentication API endpoints for the VoiceAI platform
"""

from flask import Blueprint, request, jsonify
from backend.models.db import db, User
from backend.services.auth_service import (
    hash_password, 
    check_password, 
    generate_token, 
    get_user_from_token
)
import os
import jwt
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    data = request.get_json()
    
    # Validate request
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
    
    # Find user
    user = User.query.filter_by(email=data['email']).first()
    
    # Check if user exists and password is correct
    if not user or not check_password(data['password'], user.password):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    # Generate token
    token = generate_token(user)
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate request
    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'message': 'User with this email already exists'}), 409
    
    # Create new user
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hash_password(data['password']),
        role=data.get('role', 'agent'),
        phone=data.get('phone', ''),
        job_title=data.get('job_title', '')
    )
    
    # Save to database
    db.session.add(new_user)
    db.session.commit()
    
    # Generate token
    token = generate_token(new_user)
    
    return jsonify({
        'message': 'User registered successfully',
        'token': token,
        'user': new_user.to_dict()
    }), 201


@auth_bp.route('/me', methods=['GET'])
def get_me():
    """Get current user details from token"""
    # Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Missing or invalid token'}), 401
    
    token = auth_header.split(' ')[1]
    
    # Verify token and get user
    try:
        user = get_user_from_token(token)
        if not user:
            return jsonify({'message': 'Invalid token'}), 401
        
        return jsonify(user.to_dict()), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401


@auth_bp.route('/change-password', methods=['PUT'])
def change_password():
    """Change user password"""
    # Get user from token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Missing or invalid token'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        user = get_user_from_token(token)
        if not user:
            return jsonify({'message': 'Invalid token'}), 401
        
        # Get request data
        data = request.get_json()
        if not data or not data.get('currentPassword') or not data.get('newPassword'):
            return jsonify({'message': 'Missing current or new password'}), 400
        
        # Verify current password
        if not check_password(data['currentPassword'], user.password):
            return jsonify({'message': 'Current password is incorrect'}), 401
        
        # Update password
        user.password = hash_password(data['newPassword'])
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user (client-side only)"""
    return jsonify({'message': 'Logged out successfully'}), 200