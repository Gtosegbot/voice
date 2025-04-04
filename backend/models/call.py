"""
Call model for the VoiceAI platform
"""
from datetime import datetime

from backend.models.db import db

class Call(db.Model):
    """
    Call model representing a voice call in the system
    """
    __tablename__ = 'calls'

    id = db.Column(db.Integer, primary_key=True)
    lead_id = db.Column(db.Integer, db.ForeignKey('leads.id'), nullable=False)
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'))
    status = db.Column(db.String(50), nullable=False, default='scheduled')
    direction = db.Column(db.String(20), nullable=False, default='outbound')
    scheduled_at = db.Column(db.DateTime)
    started_at = db.Column(db.DateTime)
    ended_at = db.Column(db.DateTime)
    duration = db.Column(db.Integer)  # in seconds
    recording_url = db.Column(db.String(500))
    transcript = db.Column(db.Text)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    # lead = db.relationship('Lead', backref='calls', lazy=True)
    # agent = db.relationship('User', backref='agent_calls', lazy=True)
    # campaign = db.relationship('Campaign', backref='calls', lazy=True)

    def to_dict(self):
        """Convert call instance to dictionary"""
        return {
            'id': self.id,
            'lead_id': self.lead_id,
            'agent_id': self.agent_id,
            'campaign_id': self.campaign_id,
            'status': self.status,
            'direction': self.direction,
            'scheduled_at': self.scheduled_at.isoformat() if self.scheduled_at else None,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'duration': self.duration,
            'recording_url': self.recording_url,
            'has_transcript': bool(self.transcript),
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }