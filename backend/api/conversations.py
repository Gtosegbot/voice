"""
Conversation API endpoints for the VoiceAI platform
"""

from flask import Blueprint, request, jsonify
from backend.models.db import db, Conversation, Message, User, Lead
from backend.services.auth_service import get_user_from_token
import jwt
from datetime import datetime

conversations_bp = Blueprint('conversations', __name__)

@conversations_bp.route('', methods=['GET'])
def get_conversations():
    """Get all conversations with pagination and filtering"""
    # Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Missing or invalid token'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Verify token and get user
        user = get_user_from_token(token)
        if not user:
            return jsonify({'message': 'Invalid token'}), 401
        
        # Parse query parameters
        status = request.args.get('status')
        channel = request.args.get('channel')
        search = request.args.get('search', '')
        
        # Build query
        query = Conversation.query
        
        # Apply filters
        if status:
            query = query.filter(Conversation.status == status)
        
        if channel:
            query = query.filter(Conversation.channel == channel)
        
        if search:
            # Join to leads table to search by lead name
            query = query.join(Lead).filter(Lead.name.ilike(f'%{search}%'))
        
        # Order by last activity (newest first)
        query = query.order_by(Conversation.last_activity_at.desc())
        
        # Get conversations
        conversations = query.all()
        
        # Format conversation data
        conversation_list = [conversation.to_dict() for conversation in conversations]
        
        return jsonify({
            'conversations': conversation_list
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@conversations_bp.route('/<int:conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    """Get a specific conversation by ID"""
    # Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Missing or invalid token'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Verify token and get user
        user = get_user_from_token(token)
        if not user:
            return jsonify({'message': 'Invalid token'}), 401
        
        # Get conversation by ID
        conversation = Conversation.query.get(conversation_id)
        
        if not conversation:
            return jsonify({'message': 'Conversation not found'}), 404
        
        return jsonify(conversation.to_dict()), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@conversations_bp.route('', methods=['POST'])
def create_conversation():
    """Create a new conversation"""
    # Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Missing or invalid token'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Verify token and get user
        user = get_user_from_token(token)
        if not user:
            return jsonify({'message': 'Invalid token'}), 401
        
        # Get request data
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('leadId') or not data.get('channel'):
            return jsonify({'message': 'Missing required fields (leadId, channel)'}), 400
        
        # Check if lead exists
        lead = Lead.query.get(data.get('leadId'))
        if not lead:
            return jsonify({'message': 'Lead not found'}), 404
        
        # Create new conversation
        new_conversation = Conversation(
            lead_id=data.get('leadId'),
            channel=data.get('channel'),
            status='active',
            lead_score=lead.score,
            lead_status=lead.status,
            lead_source=lead.source
        )
        
        # Save to database
        db.session.add(new_conversation)
        db.session.commit()
        
        return jsonify(new_conversation.to_dict()), 201
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@conversations_bp.route('/with-new-lead', methods=['POST'])
def create_conversation_with_new_lead():
    """Create a new conversation with a new lead"""
    # Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Missing or invalid token'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Verify token and get user
        user = get_user_from_token(token)
        if not user:
            return jsonify({'message': 'Invalid token'}), 401
        
        # Get request data
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('lead') or not data.get('channel'):
            return jsonify({'message': 'Missing required fields (lead, channel)'}), 400
        
        lead_data = data.get('lead')
        
        if not lead_data.get('name'):
            return jsonify({'message': 'Lead name is required'}), 400
        
        # Create new lead
        new_lead = Lead(
            name=lead_data.get('name'),
            company=lead_data.get('company', ''),
            phone=lead_data.get('phone', ''),
            email=lead_data.get('email', ''),
            status='new',
            score=0,
            source=lead_data.get('source', 'manual'),
            agent_id=user.id  # Assign to current user
        )
        
        # Save lead to database
        db.session.add(new_lead)
        db.session.flush()  # Get ID without committing
        
        # Create new conversation
        new_conversation = Conversation(
            lead_id=new_lead.id,
            channel=data.get('channel'),
            status='active',
            lead_score=new_lead.score,
            lead_status=new_lead.status,
            lead_source=new_lead.source
        )
        
        # Save conversation to database
        db.session.add(new_conversation)
        db.session.commit()
        
        return jsonify(new_conversation.to_dict()), 201
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@conversations_bp.route('/<int:conversation_id>/messages', methods=['GET'])
def get_messages(conversation_id):
    """Get messages for a conversation"""
    # Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Missing or invalid token'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Verify token and get user
        user = get_user_from_token(token)
        if not user:
            return jsonify({'message': 'Invalid token'}), 401
        
        # Check if conversation exists
        conversation = Conversation.query.get(conversation_id)
        if not conversation:
            return jsonify({'message': 'Conversation not found'}), 404
        
        # Get messages
        messages = Message.query.filter_by(conversation_id=conversation_id).order_by(Message.created_at).all()
        
        # Format message data
        message_list = [message.to_dict() for message in messages]
        
        return jsonify({
            'messages': message_list
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@conversations_bp.route('/<int:conversation_id>/messages', methods=['POST'])
def create_message(conversation_id):
    """Add a message to a conversation"""
    # Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Missing or invalid token'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Verify token and get user
        user = get_user_from_token(token)
        if not user:
            return jsonify({'message': 'Invalid token'}), 401
        
        # Get request data
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('content'):
            return jsonify({'message': 'Message content is required'}), 400
        
        # Check if conversation exists
        conversation = Conversation.query.get(conversation_id)
        if not conversation:
            return jsonify({'message': 'Conversation not found'}), 404
        
        # Create new message
        new_message = Message(
            conversation_id=conversation_id,
            sender_type='agent',
            sender_id=user.id,
            content=data.get('content'),
            message_type=data.get('messageType', 'text')
        )
        
        # Update conversation last activity
        conversation.last_activity_at = datetime.utcnow()
        
        # Save to database
        db.session.add(new_message)
        db.session.commit()
        
        return jsonify({
            'message': new_message.to_dict()
        }), 201
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@conversations_bp.route('/<int:conversation_id>/status', methods=['PUT'])
def update_conversation_status(conversation_id):
    """Update conversation status"""
    # Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Missing or invalid token'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Verify token and get user
        user = get_user_from_token(token)
        if not user:
            return jsonify({'message': 'Invalid token'}), 401
        
        # Get request data
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('status'):
            return jsonify({'message': 'Status is required'}), 400
        
        # Check if conversation exists
        conversation = Conversation.query.get(conversation_id)
        if not conversation:
            return jsonify({'message': 'Conversation not found'}), 404
        
        # Update conversation status
        conversation.status = data.get('status')
        
        # Save to database
        db.session.commit()
        
        return jsonify({
            'message': 'Conversation status updated',
            'conversation': conversation.to_dict()
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500
