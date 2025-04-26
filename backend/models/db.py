"""
Database models for the VoiceAI platform
"""

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime

# Criar engine e base
engine = create_engine('sqlite:///voiceai.db')
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define callback types for relationship references before class declaration
callbacks_backref = None


class User(Base):
    """User model for authentication and user management"""
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    password = Column(String(255), nullable=False)
    role = Column(String(50), default='agent')
    phone = Column(String(50))
    job_title = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    # Relationships
    leads = relationship('Lead', backref='assigned_agent', lazy=True)

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


class Lead(Base):
    """Lead model for lead management"""
    __tablename__ = 'leads'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    company = Column(String(100))
    phone = Column(String(50))
    email = Column(String(100))
    status = Column(String(50), default='new')
    score = Column(Integer, default=0)
    source = Column(String(50))
    agent_id = Column(Integer, ForeignKey('users.id'))
    campaign_id = Column(Integer, ForeignKey('campaigns.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)
    last_activity = Column(DateTime, default=datetime.utcnow)

    # Relationships
    conversations = relationship('Conversation', backref='lead', lazy=True)
    notes = relationship('Note', backref='lead', lazy=True)

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
            'agentId': self.agent_id,
            'campaignId': self.campaign_id,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'lastActivity': self.last_activity.isoformat() if self.last_activity else None
        }


class Campaign(Base):
    """Campaign model for marketing campaigns"""
    __tablename__ = 'campaigns'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    status = Column(String(50), default='draft')
    target_leads = Column(Integer, default=0)
    start_date = Column(Date)
    end_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    # Relationships
    leads = relationship('Lead', backref='campaign', lazy=True)
    flows = relationship('Flow', backref='campaign', lazy=True)

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
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }


class Conversation(Base):
    """Conversation model for tracking interactions with leads"""
    __tablename__ = 'conversations'

    id = Column(Integer, primary_key=True)
    lead_id = Column(Integer, ForeignKey('leads.id'), nullable=False)
    channel = Column(String(50), nullable=False)
    status = Column(String(50), default='active')
    lead_score = Column(Integer)
    lead_status = Column(String(50))
    lead_source = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)
    last_activity_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    messages = relationship('Message', backref='conversation', lazy=True)

    def to_dict(self):
        """Convert instance to dictionary"""
        return {
            'id': self.id,
            'leadId': self.lead_id,
            'channel': self.channel,
            'status': self.status,
            'leadScore': self.lead_score,
            'leadStatus': self.lead_status,
            'leadSource': self.lead_source,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'lastActivityAt': self.last_activity_at.isoformat() if self.last_activity_at else None
        }


class Message(Base):
    """Message model for storing conversation messages"""
    __tablename__ = 'messages'

    id = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, ForeignKey(
        'conversations.id'), nullable=False)
    # 'system', 'agent', 'lead', 'ai'
    sender_type = Column(String(50), nullable=False)
    sender_id = Column(Integer)  # User ID if sender_type is 'agent'
    content = Column(Text, nullable=False)
    # 'text', 'audio', 'image', 'file'
    message_type = Column(String(50), default='text')
    created_at = Column(DateTime, default=datetime.utcnow)

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


class Call(Base):
    """Call model for tracking voice calls"""
    __tablename__ = 'calls'

    id = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, ForeignKey('conversations.id'))
    lead_id = Column(Integer, ForeignKey('leads.id'))
    agent_id = Column(Integer, ForeignKey('users.id'))
    direction = Column(String(50), nullable=False)  # 'inbound', 'outbound'
    # 'ringing', 'in-progress', 'completed', 'missed', 'failed'
    status = Column(String(50), default='ringing')
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    duration = Column(Integer)  # in seconds
    recording_url = Column(String(255))
    transcript = Column(Text)
    call_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    lead = relationship('Lead', backref='calls', lazy=True)
    agent = relationship('User', backref='calls', lazy=True)

    def to_dict(self):
        """Convert instance to dictionary"""
        return {
            'id': self.id,
            'conversationId': self.conversation_id,
            'leadId': self.lead_id,
            'agentId': self.agent_id,
            'direction': self.direction,
            'status': self.status,
            'startTime': self.start_time.isoformat() if self.start_time else None,
            'endTime': self.end_time.isoformat() if self.end_time else None,
            'duration': self.duration,
            'recordingUrl': self.recording_url,
            'transcript': self.transcript,
            'callNotes': self.call_notes,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }


class Note(Base):
    """Note model for lead notes"""
    __tablename__ = 'notes'

    id = Column(Integer, primary_key=True)
    lead_id = Column(Integer, ForeignKey('leads.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    content = Column(Text, nullable=False)
    # 'general', 'call', 'meeting', 'task'
    note_type = Column(String(50), default='general')
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship('User', backref='notes', lazy=True)

    def to_dict(self):
        """Convert instance to dictionary"""
        return {
            'id': self.id,
            'leadId': self.lead_id,
            'userId': self.user_id,
            'content': self.content,
            'noteType': self.note_type,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'user': {
                'id': self.user.id,
                'name': self.user.name
            } if self.user else None
        }


class Flow(Base):
    """Flow model for conversation flows"""
    __tablename__ = 'flows'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    # 'inbound', 'outbound', 'message', 'webhook'
    trigger_type = Column(String(50), nullable=False)
    # 'draft', 'active', 'inactive'
    status = Column(String(50), default='draft')
    campaign_id = Column(Integer, ForeignKey('campaigns.id'))
    nodes = Column(Text)  # JSON string of nodes
    connections = Column(Text)  # JSON string of connections
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert instance to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'triggerType': self.trigger_type,
            'status': self.status,
            'campaignId': self.campaign_id,
            'nodes': self.nodes,
            'connections': self.connections,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }


class Setting(Base):
    """Settings model for system and user settings"""
    __tablename__ = 'settings'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id')
                     )  # NULL for system settings
    # 'system', 'user', 'telephony', 'ai', etc.
    category = Column(String(50), nullable=False)
    key = Column(String(100), nullable=False)
    value = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    # Unique constraint for user_id, category, key
    __table_args__ = (
        db.UniqueConstraint('user_id', 'category', 'key',
                            name='unique_setting'),
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


class Callback(Base):
    """Callback model for scheduled return calls"""
    __tablename__ = 'callbacks'

    id = Column(Integer, primary_key=True)
    lead_id = Column(Integer, ForeignKey('leads.id'), nullable=False)
    agent_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    scheduled_at = Column(DateTime, nullable=False)
    notes = Column(Text)
    # scheduled, completed, missed, canceled
    status = Column(String(50), default='scheduled')
    call_id = Column(Integer, ForeignKey('calls.id'))  # Associated call if any
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    # Relationships
    lead = relationship('Lead', backref='callbacks', lazy=True)
    agent = relationship('User', backref='callbacks', lazy=True)
    reminders = relationship('Reminder', backref='callback', lazy=True)

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


class Reminder(Base):
    """Reminder model for callback notifications"""
    __tablename__ = 'reminders'

    id = Column(Integer, primary_key=True)
    callback_id = Column(Integer, ForeignKey('callbacks.id'), nullable=False)
    reminder_time = Column(DateTime, nullable=False)
    channel = Column(String(50), nullable=False)  # whatsapp, sms, email
    # pending, sent, failed, canceled
    status = Column(String(50), default='pending')
    error = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

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
