"""
Callbacks API endpoints for the VoiceAI platform
Handles scheduling return calls and automatic reminders
"""

from datetime import datetime, timedelta
import json
from flask import Blueprint, request, jsonify, current_app
from backend.models.db import db, Lead, User, Callback, Reminder, Setting
from backend.services.auth_service import get_user_from_token
from backend.services.mcp_client import MCPClient
from backend.services.twilio_service import send_sms

# Create blueprint
callbacks_bp = Blueprint('callbacks', __name__)
mcp_client = MCPClient()

@callbacks_bp.route('/api/callbacks', methods=['GET'])
def get_callbacks():
    """Get all scheduled callbacks with pagination and filtering"""
    try:
        # Get current user from token
        user = get_user_from_token(request)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
            
        # Get query parameters
        status = request.args.get('status')
        lead_id = request.args.get('lead_id')
        agent_id = request.args.get('agent_id')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        # Build query
        query = Callback.query
        
        # Apply filters
        if status:
            query = query.filter(Callback.status == status)
        
        if lead_id:
            query = query.filter(Callback.lead_id == lead_id)
        
        if agent_id:
            query = query.filter(Callback.agent_id == agent_id)
        elif user.role != 'admin':
            # Regular agents can only see their own callbacks
            query = query.filter(Callback.agent_id == user.id)
        
        if date_from:
            date_from_obj = datetime.strptime(date_from, '%Y-%m-%d')
            query = query.filter(Callback.scheduled_at >= date_from_obj)
        
        if date_to:
            date_to_obj = datetime.strptime(date_to, '%Y-%m-%d')
            date_to_obj = date_to_obj + timedelta(days=1)  # Include the end date
            query = query.filter(Callback.scheduled_at < date_to_obj)
            
        # Order by scheduled time (ascending)
        query = query.order_by(Callback.scheduled_at.asc())
        
        # Paginate results
        callbacks_pagination = query.paginate(page=page, per_page=per_page)
        callbacks = callbacks_pagination.items
        
        # Format response
        result = {
            "callbacks": [callback.to_dict() for callback in callbacks],
            "pagination": {
                "total": callbacks_pagination.total,
                "pages": callbacks_pagination.pages,
                "page": page,
                "per_page": per_page
            }
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting callbacks: {str(e)}")
        return jsonify({"error": str(e)}), 500

@callbacks_bp.route('/api/callbacks/<int:callback_id>', methods=['GET'])
def get_callback(callback_id):
    """Get a specific callback by ID"""
    try:
        # Get current user from token
        user = get_user_from_token(request)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
            
        # Get callback
        callback = Callback.query.get(callback_id)
        if not callback:
            return jsonify({"error": "Callback not found"}), 404
            
        # Check if user has permission to view this callback
        if user.role != 'admin' and callback.agent_id != user.id:
            return jsonify({"error": "Unauthorized"}), 403
            
        return jsonify(callback.to_dict()), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting callback {callback_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@callbacks_bp.route('/api/callbacks', methods=['POST'])
def create_callback():
    """Create a new scheduled callback"""
    try:
        # Get current user from token
        user = get_user_from_token(request)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
            
        # Get request data
        data = request.json
        
        # Validate required fields
        if not data.get('lead_id') or not data.get('scheduled_at'):
            return jsonify({"error": "Missing required fields: lead_id, scheduled_at"}), 400
            
        # Check if lead exists
        lead = Lead.query.get(data['lead_id'])
        if not lead:
            return jsonify({"error": "Lead not found"}), 404
            
        # Create callback
        callback = Callback(
            lead_id=data['lead_id'],
            agent_id=user.id,
            scheduled_at=datetime.fromisoformat(data['scheduled_at']),
            notes=data.get('notes', ''),
            status='scheduled'
        )
        
        # Add to database
        db.session.add(callback)
        db.session.flush()  # Get ID before committing
        
        # Handle reminders if enabled
        if data.get('send_reminder', False):
            reminder_time = data.get('reminder_time', 30)  # Default 30 minutes before
            reminder_channel = data.get('reminder_channel', 'whatsapp')  # Default WhatsApp
            
            reminder_datetime = callback.scheduled_at - timedelta(minutes=int(reminder_time))
            
            reminder = Reminder(
                callback_id=callback.id,
                reminder_time=reminder_datetime,
                channel=reminder_channel,
                status='pending'
            )
            
            db.session.add(reminder)
            
        db.session.commit()
        
        # Return created callback
        return jsonify(callback.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating callback: {str(e)}")
        return jsonify({"error": str(e)}), 500

@callbacks_bp.route('/api/callbacks/<int:callback_id>', methods=['PUT'])
def update_callback(callback_id):
    """Update a scheduled callback"""
    try:
        # Get current user from token
        user = get_user_from_token(request)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
            
        # Get callback
        callback = Callback.query.get(callback_id)
        if not callback:
            return jsonify({"error": "Callback not found"}), 404
            
        # Check if user has permission to update this callback
        if user.role != 'admin' and callback.agent_id != user.id:
            return jsonify({"error": "Unauthorized"}), 403
            
        # Get request data
        data = request.json
        
        # Update callback fields
        if data.get('scheduled_at'):
            callback.scheduled_at = datetime.fromisoformat(data['scheduled_at'])
            
        if 'notes' in data:
            callback.notes = data['notes']
            
        if 'status' in data:
            callback.status = data['status']
            
        # Update reminders
        if 'send_reminder' in data:
            # Remove existing reminders if disabling
            if not data['send_reminder']:
                Reminder.query.filter_by(callback_id=callback.id).delete()
                
            # Update or create reminder
            else:
                reminder_time = data.get('reminder_time', 30)
                reminder_channel = data.get('reminder_channel', 'whatsapp')
                
                reminder_datetime = callback.scheduled_at - timedelta(minutes=int(reminder_time))
                
                # Check if reminder exists
                reminder = Reminder.query.filter_by(callback_id=callback.id).first()
                
                if reminder:
                    reminder.reminder_time = reminder_datetime
                    reminder.channel = reminder_channel
                    reminder.status = 'pending'
                else:
                    reminder = Reminder(
                        callback_id=callback.id,
                        reminder_time=reminder_datetime,
                        channel=reminder_channel,
                        status='pending'
                    )
                    db.session.add(reminder)
                    
        db.session.commit()
        
        # Return updated callback
        return jsonify(callback.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating callback {callback_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@callbacks_bp.route('/api/callbacks/<int:callback_id>', methods=['DELETE'])
def delete_callback(callback_id):
    """Delete a scheduled callback"""
    try:
        # Get current user from token
        user = get_user_from_token(request)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
            
        # Get callback
        callback = Callback.query.get(callback_id)
        if not callback:
            return jsonify({"error": "Callback not found"}), 404
            
        # Check if user has permission to delete this callback
        if user.role != 'admin' and callback.agent_id != user.id:
            return jsonify({"error": "Unauthorized"}), 403
            
        # Delete reminders first
        Reminder.query.filter_by(callback_id=callback.id).delete()
        
        # Delete callback
        db.session.delete(callback)
        db.session.commit()
        
        return jsonify({"message": "Callback deleted successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting callback {callback_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@callbacks_bp.route('/api/callbacks/<int:callback_id>/initiate', methods=['POST'])
def initiate_call(callback_id):
    """Initiate a call for a scheduled callback"""
    try:
        # Get current user from token
        user = get_user_from_token(request)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
            
        # Get callback
        callback = Callback.query.get(callback_id)
        if not callback:
            return jsonify({"error": "Callback not found"}), 404
            
        # Check if user has permission to initiate this call
        if user.role != 'admin' and callback.agent_id != user.id:
            return jsonify({"error": "Unauthorized"}), 403
            
        # Get lead phone number
        lead = Lead.query.get(callback.lead_id)
        if not lead or not lead.phone:
            return jsonify({"error": "Lead phone number not available"}), 400
            
        # Initiate call via MCP
        result = mcp_client.initiate_call(lead.id, lead.phone)
        
        # Update callback status
        callback.status = 'in_progress'
        db.session.commit()
        
        return jsonify({"message": "Call initiated", "call_data": result}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error initiating call for callback {callback_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@callbacks_bp.route('/api/callbacks/process-reminders', methods=['POST'])
def process_reminders():
    """
    Process pending reminders and send notifications
    This endpoint should be called by a scheduled task/cron job
    """
    try:
        # This endpoint should be protected with an API key for cron jobs
        api_key = request.headers.get('X-API-Key')
        if not api_key:
            return jsonify({"error": "Missing API key"}), 401
            
        # Validate API key
        setting = Setting.query.filter_by(category='system', key='cron_api_key').first()
        if not setting or setting.value != api_key:
            return jsonify({"error": "Invalid API key"}), 401
            
        # Get current time
        now = datetime.utcnow()
        
        # Find reminders that are due
        reminders = Reminder.query.filter(
            Reminder.reminder_time <= now,
            Reminder.status == 'pending'
        ).all()
        
        results = []
        
        # Process each reminder
        for reminder in reminders:
            try:
                # Get callback and lead
                callback = Callback.query.get(reminder.callback_id)
                if not callback or callback.status != 'scheduled':
                    # Skip if callback doesn't exist or is not scheduled
                    reminder.status = 'canceled'
                    results.append({
                        "reminder_id": reminder.id,
                        "status": "skipped",
                        "reason": "Callback not found or not scheduled"
                    })
                    continue
                    
                lead = Lead.query.get(callback.lead_id)
                if not lead:
                    # Skip if lead doesn't exist
                    reminder.status = 'failed'
                    results.append({
                        "reminder_id": reminder.id,
                        "status": "failed",
                        "reason": "Lead not found"
                    })
                    continue
                    
                # Format callback time
                callback_time = callback.scheduled_at.strftime('%d/%m/%Y às %H:%M')
                
                # Send reminder based on channel
                if reminder.channel == 'whatsapp' and lead.phone:
                    # Send WhatsApp message via MCP
                    message = f"Olá {lead.name}, este é um lembrete para o nosso retorno agendado para {callback_time}. Aguardamos seu contato!"
                    mcp_client.send_whatsapp_message(lead.phone, message)
                    reminder.status = 'sent'
                    
                elif reminder.channel == 'sms' and lead.phone:
                    # Send SMS via Twilio
                    message = f"Olá {lead.name}, este é um lembrete para o nosso retorno agendado para {callback_time}. Aguardamos seu contato!"
                    send_sms(lead.phone, message)
                    reminder.status = 'sent'
                    
                elif reminder.channel == 'email' and lead.email:
                    # Send email
                    # Implement email sending logic here
                    reminder.status = 'sent'
                    
                else:
                    reminder.status = 'failed'
                    results.append({
                        "reminder_id": reminder.id,
                        "status": "failed",
                        "reason": f"Invalid channel or missing contact info: {reminder.channel}"
                    })
                    continue
                    
                # Add to results
                results.append({
                    "reminder_id": reminder.id,
                    "lead_id": lead.id,
                    "lead_name": lead.name,
                    "channel": reminder.channel,
                    "callback_time": callback_time,
                    "status": "sent"
                })
                
            except Exception as e:
                # Log error and continue
                current_app.logger.error(f"Error processing reminder {reminder.id}: {str(e)}")
                reminder.status = 'failed'
                reminder.error = str(e)
                results.append({
                    "reminder_id": reminder.id,
                    "status": "error",
                    "error": str(e)
                })
                
        # Commit changes
        db.session.commit()
        
        return jsonify({
            "processed": len(reminders),
            "results": results
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error processing reminders: {str(e)}")
        return jsonify({"error": str(e)}), 500

def register_models():
    """Add Callback and Reminder models to the database"""
    # This function is called during application initialization
    
    class Callback(db.Model):
        """Callback model for scheduled return calls"""
        __tablename__ = 'callbacks'
        
        id = db.Column(db.Integer, primary_key=True)
        lead_id = db.Column(db.Integer, db.ForeignKey('leads.id'), nullable=False)
        agent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
        scheduled_at = db.Column(db.DateTime, nullable=False)
        notes = db.Column(db.Text)
        status = db.Column(db.String(50), default='scheduled')  # scheduled, completed, missed, canceled
        call_id = db.Column(db.Integer, db.ForeignKey('calls.id'))  # Associated call if any
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        
        # Relationships
        lead = db.relationship('Lead', backref='callbacks', lazy=True)
        agent = db.relationship('User', backref='callbacks', lazy=True)
        reminders = db.relationship('Reminder', backref='callback', lazy=True)
        
        def to_dict(self):
            """Convert instance to dictionary"""
            return {
                'id': self.id,
                'lead_id': self.lead_id,
                'lead': self.lead.to_dict() if self.lead else None,
                'agent_id': self.agent_id,
                'agent': {
                    'id': self.agent.id,
                    'name': self.agent.name,
                    'email': self.agent.email
                } if self.agent else None,
                'scheduled_at': self.scheduled_at.isoformat() if self.scheduled_at else None,
                'notes': self.notes,
                'status': self.status,
                'call_id': self.call_id,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None,
                'reminders': [r.to_dict() for r in self.reminders] if self.reminders else []
            }
    
    class Reminder(db.Model):
        """Reminder model for callback notifications"""
        __tablename__ = 'reminders'
        
        id = db.Column(db.Integer, primary_key=True)
        callback_id = db.Column(db.Integer, db.ForeignKey('callbacks.id'), nullable=False)
        reminder_time = db.Column(db.DateTime, nullable=False)
        channel = db.Column(db.String(50), nullable=False)  # whatsapp, sms, email
        status = db.Column(db.String(50), default='pending')  # pending, sent, failed, canceled
        error = db.Column(db.Text)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        
        def to_dict(self):
            """Convert instance to dictionary"""
            return {
                'id': self.id,
                'callback_id': self.callback_id,
                'reminder_time': self.reminder_time.isoformat() if self.reminder_time else None,
                'channel': self.channel,
                'status': self.status,
                'error': self.error,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            }
            
    # Return models so they can be imported elsewhere
    return Callback, Reminder