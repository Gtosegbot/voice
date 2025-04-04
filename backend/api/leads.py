"""
Lead management API endpoints for the VoiceAI platform
"""

from flask import Blueprint, request, jsonify, send_file
from backend.models.db import db, Lead, User, Note
from backend.services.auth_service import get_user_from_token
import jwt
from datetime import datetime
import csv
import io
import tempfile

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
        status = request.args.get('status')
        source = request.args.get('source')
        search = request.args.get('search', '')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('perPage', 10))
        
        # Build query
        query = Lead.query
        
        # Apply filters
        if status:
            query = query.filter(Lead.status == status)
        
        if source:
            query = query.filter(Lead.source == source)
        
        if search:
            query = query.filter(
                db.or_(
                    Lead.name.ilike(f'%{search}%'),
                    Lead.company.ilike(f'%{search}%'),
                    Lead.email.ilike(f'%{search}%')
                )
            )
        
        # If user is an agent (not admin), only show their leads
        if user.role == 'agent':
            query = query.filter(Lead.agent_id == user.id)
        
        # Count total
        total = query.count()
        
        # Paginate
        query = query.order_by(Lead.created_at.desc())
        leads = query.offset((page - 1) * per_page).limit(per_page).all()
        
        # Format lead data
        lead_list = [lead.to_dict() for lead in leads]
        
        return jsonify({
            'leads': lead_list,
            'pagination': {
                'total': total,
                'page': page,
                'perPage': per_page,
                'pages': (total + per_page - 1) // per_page
            }
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
        
        # If user is an agent (not admin), check if lead belongs to them
        if user.role == 'agent' and lead.agent_id != user.id:
            return jsonify({'message': 'Access denied'}), 403
        
        # Get notes for the lead
        notes = Note.query.filter_by(lead_id=lead_id).order_by(Note.created_at.desc()).all()
        notes_list = [note.to_dict() for note in notes]
        
        # Combine lead and notes
        lead_data = lead.to_dict()
        lead_data['notes'] = notes_list
        
        return jsonify(lead_data), 200
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
            return jsonify({'message': 'Lead name is required'}), 400
        
        # Create new lead
        new_lead = Lead(
            name=data.get('name'),
            company=data.get('company', ''),
            phone=data.get('phone', ''),
            email=data.get('email', ''),
            status=data.get('status', 'new'),
            score=data.get('score', 0),
            source=data.get('source', 'manual'),
            agent_id=data.get('agentId', user.id)  # Assign to specified agent or current user
        )
        
        # If campaign ID provided, associate with campaign
        if data.get('campaignId'):
            new_lead.campaign_id = data.get('campaignId')
        
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
        
        # If user is an agent (not admin), check if lead belongs to them
        if user.role == 'agent' and lead.agent_id != user.id:
            return jsonify({'message': 'Access denied'}), 403
        
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        # Update lead fields
        if 'name' in data:
            lead.name = data['name']
        
        if 'company' in data:
            lead.company = data['company']
        
        if 'phone' in data:
            lead.phone = data['phone']
        
        if 'email' in data:
            lead.email = data['email']
        
        if 'status' in data:
            lead.status = data['status']
        
        if 'score' in data:
            lead.score = data['score']
        
        if 'source' in data:
            lead.source = data['source']
        
        if 'agentId' in data and (user.role == 'admin' or user.id == lead.agent_id):
            lead.agent_id = data['agentId']
        
        if 'campaignId' in data and user.role == 'admin':
            lead.campaign_id = data['campaignId']
        
        # Update timestamp
        lead.updated_at = datetime.utcnow()
        
        # If status changed to 'contacted', update last activity
        if 'status' in data and data['status'] == 'contacted':
            lead.last_activity = datetime.utcnow()
        
        # Save to database
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
        
        # Only admins can delete leads
        if user.role != 'admin':
            return jsonify({'message': 'Access denied'}), 403
        
        # Get lead by ID
        lead = Lead.query.get(lead_id)
        
        if not lead:
            return jsonify({'message': 'Lead not found'}), 404
        
        # Delete from database
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
        
        # Parse query parameters for filtering
        status = request.args.get('status')
        source = request.args.get('source')
        
        # Build query
        query = Lead.query
        
        # Apply filters
        if status:
            query = query.filter(Lead.status == status)
        
        if source:
            query = query.filter(Lead.source == source)
        
        # If user is an agent (not admin), only export their leads
        if user.role == 'agent':
            query = query.filter(Lead.agent_id == user.id)
        
        # Get leads
        leads = query.all()
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['ID', 'Name', 'Company', 'Phone', 'Email', 'Status', 'Score', 'Source', 'Created At'])
        
        # Write data
        for lead in leads:
            writer.writerow([
                lead.id,
                lead.name,
                lead.company,
                lead.phone,
                lead.email,
                lead.status,
                lead.score,
                lead.source,
                lead.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.csv')
        temp_file.write(output.getvalue().encode('utf-8'))
        temp_file.close()
        
        # Send file
        return send_file(
            temp_file.name,
            mimetype='text/csv',
            as_attachment=True,
            download_name='leads_export.csv'
        )
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500
