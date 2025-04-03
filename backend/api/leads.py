"""
Lead management API endpoints for the VoiceAI platform
"""

from flask import Blueprint, request, jsonify
from backend.models.db import db, Lead, User, Campaign
from backend.services.auth_service import get_user_from_token
import jwt

leads_bp = Blueprint('leads', __name__)

@leads_bp.route('', methods=['GET'])
def get_leads():
    """Get all leads with pagination and filtering"""
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
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        status = request.args.get('status')
        agent_id = request.args.get('agentId', type=int)
        campaign_id = request.args.get('campaignId', type=int)
        search = request.args.get('search', '')
        sort_by = request.args.get('sortBy', 'createdAt')
        sort_order = request.args.get('sortOrder', 'desc')
        
        # Build query
        query = Lead.query
        
        # Apply filters
        if status:
            query = query.filter(Lead.status == status)
        
        if agent_id:
            query = query.filter(Lead.agent_id == agent_id)
        
        if campaign_id:
            query = query.filter(Lead.campaign_id == campaign_id)
        
        if search:
            search_term = f'%{search}%'
            query = query.filter(
                (Lead.name.ilike(search_term)) |
                (Lead.company.ilike(search_term)) |
                (Lead.email.ilike(search_term)) |
                (Lead.phone.ilike(search_term))
            )
        
        # Apply sorting
        sort_column = getattr(Lead, sort_by.replace('createdAt', 'created_at'), Lead.created_at)
        if sort_order == 'desc':
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        query = query.offset((page - 1) * limit).limit(limit)
        
        # Get leads
        leads = query.all()
        
        # Format lead data
        lead_list = [lead.to_dict() for lead in leads]
        
        return jsonify({
            'leads': lead_list,
            'total': total,
            'page': page,
            'limit': limit
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@leads_bp.route('/<int:lead_id>', methods=['GET'])
def get_lead(lead_id):
    """Get a specific lead by ID"""
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
        
        # Get lead by ID
        lead = Lead.query.get(lead_id)
        
        if not lead:
            return jsonify({'message': 'Lead not found'}), 404
        
        return jsonify(lead.to_dict()), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@leads_bp.route('', methods=['POST'])
def create_lead():
    """Create a new lead"""
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
        if not data or not data.get('name'):
            return jsonify({'message': 'Name is required'}), 400
        
        # Create new lead
        new_lead = Lead(
            name=data.get('name'),
            company=data.get('company', ''),
            phone=data.get('phone', ''),
            email=data.get('email', ''),
            status=data.get('status', 'new'),
            score=data.get('score', 0),
            source=data.get('source', ''),
            agent_id=data.get('agentId'),
            campaign_id=data.get('campaignId')
        )
        
        # Save to database
        db.session.add(new_lead)
        db.session.commit()
        
        return jsonify(new_lead.to_dict()), 201
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@leads_bp.route('/<int:lead_id>', methods=['PUT'])
def update_lead(lead_id):
    """Update an existing lead"""
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
        
        # Get lead by ID
        lead = Lead.query.get(lead_id)
        
        if not lead:
            return jsonify({'message': 'Lead not found'}), 404
        
        # Get request data
        data = request.get_json()
        
        # Update lead fields
        if data.get('name'):
            lead.name = data.get('name')
        
        if 'company' in data:
            lead.company = data.get('company', '')
        
        if 'phone' in data:
            lead.phone = data.get('phone', '')
        
        if 'email' in data:
            lead.email = data.get('email', '')
        
        if data.get('status'):
            lead.status = data.get('status')
        
        if 'score' in data:
            lead.score = data.get('score', 0)
        
        if 'source' in data:
            lead.source = data.get('source', '')
        
        if 'agentId' in data:
            lead.agent_id = data.get('agentId')
        
        if 'campaignId' in data:
            lead.campaign_id = data.get('campaignId')
        
        # Save changes
        db.session.commit()
        
        return jsonify(lead.to_dict()), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@leads_bp.route('/<int:lead_id>', methods=['DELETE'])
def delete_lead(lead_id):
    """Delete a lead"""
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
        
        # Check user role
        if user.role not in ['admin', 'manager']:
            return jsonify({'message': 'Unauthorized: Insufficient permissions'}), 403
        
        # Get lead by ID
        lead = Lead.query.get(lead_id)
        
        if not lead:
            return jsonify({'message': 'Lead not found'}), 404
        
        # Delete lead
        db.session.delete(lead)
        db.session.commit()
        
        return jsonify({'message': 'Lead deleted successfully'}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@leads_bp.route('/export', methods=['GET'])
def export_leads():
    """Export leads to CSV"""
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
        agent_id = request.args.get('agentId', type=int)
        campaign_id = request.args.get('campaignId', type=int)
        search = request.args.get('search', '')
        
        # Build query
        query = Lead.query
        
        # Apply filters
        if status:
            query = query.filter(Lead.status == status)
        
        if agent_id:
            query = query.filter(Lead.agent_id == agent_id)
        
        if campaign_id:
            query = query.filter(Lead.campaign_id == campaign_id)
        
        if search:
            search_term = f'%{search}%'
            query = query.filter(
                (Lead.name.ilike(search_term)) |
                (Lead.company.ilike(search_term)) |
                (Lead.email.ilike(search_term)) |
                (Lead.phone.ilike(search_term))
            )
        
        # Get leads
        leads = query.all()
        
        # Format lead data for CSV
        csv_data = 'Name,Company,Email,Phone,Status,Score,Source,Agent,Campaign,Created At\n'
        
        for lead in leads:
            agent_name = lead.assigned_agent.name if lead.assigned_agent else ''
            campaign_name = lead.campaign.name if lead.campaign else ''
            
            csv_data += f'"{lead.name}","{lead.company or ""}","{lead.email or ""}","{lead.phone or ""}",' \
                        f'"{lead.status}",{lead.score},"{lead.source or ""}","{agent_name}","{campaign_name}",' \
                        f'"{lead.created_at.isoformat() if lead.created_at else ""}"\n'
        
        # Return CSV file
        return csv_data, 200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=leads_export.csv'
        }
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500
