"""
Database models for the VoiceAI platform
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    """User model for authentication and user management"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='agent')
    phone = db.Column(db.String(50))
    job_title = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    leads = db.relationship('Lead', backref='assigned_agent', lazy=True)
    
    def to_dict(self):
        """Convert instance to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'phone': self.phone,
            'jobTitle': self.job_title,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }


class Lead(db.Model):
    """Lead model for lead management"""
    __tablename__ = 'leads'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100))
    phone = db.Column(db.String(50))
    email = db.Column(db.String(100))
    status = db.Column(db.String(50), default='new')
    score = db.Column(db.Integer, default=0)
    source = db.Column(db.String(50))
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_activity = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    conversations = db.relationship('Conversation', backref='lead', lazy=True)
    notes = db.relationship('Note', backref='lead', lazy=True)
    
    def to_dict(self):
        """Convert instance to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'company': self.company,
            'phone': self.phone,
            'email': self.email,
            'status': self.status,
            'score': self.score,
            'source': self.source,
            'assignedTo': self.assigned_agent.name if self.assigned_agent else None,
            'campaign': self.campaign.name if self.campaign else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'lastActivity': self.last_activity.isoformat() if self.last_activity else None
        }


class Campaign(db.Model):
    """Campaign model for marketing campaigns"""
    __tablename__ = 'campaigns'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(50), default='draft')
    target_leads = db.Column(db.Integer, default=0)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    leads = db.relationship('Lead', backref='campaign', lazy=True)
    flows = db.relationship('Flow', backref='campaign', lazy=True)
    
    def to_dict(self):
        """Convert instance to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'status': self.status,
            'targetLeads': self.target_leads,
            'startDate': self.start_date.isoformat() if self.start_date else None,
            'endDate': self.end_date.isoformat() if self.end_date else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'contacted': len([lead for lead in self.leads if lead.status != 'new']),
            'qualified': len([lead for lead in self.leads if lead.status == 'qualified'])
        }


class Conversation(db.Model):
    """Conversation model for tracking interactions with leads"""
    __tablename__ = 'conversations'
    
    id = db.Column(db.Integer, primary_key=True)
    lead_id = db.Column(db.Integer, db.ForeignKey('leads.id'), nullable=False)
    channel = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), default='active')
    lead_score = db.Column(db.Integer)
    lead_status = db.Column(db.String(50))
    lead_source = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_activity_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    messages = db.relationship('Message', backref='conversation', lazy=True)
    
    def to_dict(self):
        """Convert instance to dictionary"""
        return {
            'id': self.id,
            'leadId': self.lead_id,
            'contactName': self.lead.name if self.lead else None,
            'channel': self.channel,
            'status': self.status,
            'leadScore': self.lead_score,
            'leadStatus': self.lead_status,
            'leadSource': self.lead_source,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'lastActivityAt': self.last_activity_at.isoformat() if self.last_activity_at else None,
            'lastMessage': self.messages[-1].content if self.messages else None,
            'isNew': (datetime.utcnow() - self.created_at).days < 1 if self.created_at else False
        }


class Message(db.Model):
    """Message model for storing conversation messages"""
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id'), nullable=False)
    sender_type = db.Column(db.String(50), nullable=False)  # 'system', 'agent', 'lead', 'ai'
    sender_id = db.Column(db.Integer)  # User ID if sender_type is 'agent'
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(50), default='text')  # 'text', 'audio', 'image', 'file'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert instance to dictionary"""
        return {
            'id': self.id,
            'conversationId': self.conversation_id,
            'senderType': self.sender_type,
            'senderId': self.sender_id,
            'content': self.content,
            'messageType': self.message_type,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }


class Call(db.Model):
    """Call model for tracking voice calls"""
    __tablename__ = 'calls'
    
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id'))
    lead_id = db.Column(db.Integer, db.ForeignKey('leads.id'))
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    direction = db.Column(db.String(50), nullable=False)  # 'inbound', 'outbound'
    status = db.Column(db.String(50), default='ringing')  # 'ringing', 'in-progress', 'completed', 'missed', 'failed'
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    duration = db.Column(db.Integer)  # in seconds
    recording_url = db.Column(db.String(255))
    transcript = db.Column(db.Text)
    call_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    lead = db.relationship('Lead', backref='calls', lazy=True)
    agent = db.relationship('User', backref='calls', lazy=True)
    
    def to_dict(self):
        """Convert instance to dictionary"""
        return {
            'id': self.id,
            'conversationId': self.conversation_id,
            'leadId': self.lead_id,
            'leadName': self.lead.name if self.lead else None,
            'agentId': self.agent_id,
            'agentName': self.agent.name if self.agent else None,
            'direction': self.direction,
            'status': self.status,
            'startTime': self.start_time.isoformat() if self.start_time else None,
            'endTime': self.end_time.isoformat() if self.end_time else None,
            'duration': self.duration,
            'recordingUrl': self.recording_url,
            'hasTranscript': bool(self.transcript),
            'callNotes': self.call_notes,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }


class Note(db.Model):
    """Note model for lead notes"""
    __tablename__ = 'notes'
    
    id = db.Column(db.Integer, primary_key=True)
    lead_id = db.Column(db.Integer, db.ForeignKey('leads.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    note_type = db.Column(db.String(50), default='general')  # 'general', 'call', 'meeting', 'task'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='notes', lazy=True)
    
    def to_dict(self):
        """Convert instance to dictionary"""
        return {
            'id': self.id,
            'leadId': self.lead_id,
            'userId': self.user_id,
            'userName': self.user.name if self.user else None,
            'content': self.content,
            'noteType': self.note_type,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }


class Flow(db.Model):
    """Flow model for conversation flows"""
    __tablename__ = 'flows'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    trigger_type = db.Column(db.String(50), nullable=False)  # 'inbound', 'outbound', 'message', 'webhook'
    status = db.Column(db.String(50), default='draft')  # 'draft', 'active', 'inactive'
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'))
    nodes = db.Column(db.Text)  # JSON string of nodes
    connections = db.Column(db.Text)  # JSON string of connections
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert instance to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'triggerType': self.trigger_type,
            'status': self.status,
            'campaignId': self.campaign_id,
            'nodes': json.loads(self.nodes) if self.nodes else [],
            'connections': json.loads(self.connections) if self.connections else [],
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }


class Setting(db.Model):
    """Settings model for system and user settings"""
    __tablename__ = 'settings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))  # NULL for system settings
    category = db.Column(db.String(50), nullable=False)  # 'system', 'user', 'telephony', 'ai', etc.
    key = db.Column(db.String(100), nullable=False)
    value = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Composite unique constraint
    __table_args__ = (
        db.UniqueConstraint('user_id', 'category', 'key', name='unique_setting'),
    )
    
    def to_dict(self):
        """Convert instance to dictionary"""
        return {
            'id': self.id,
            'userId': self.user_id,
            'category': self.category,
            'key': self.key,
            'value': self.value,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }