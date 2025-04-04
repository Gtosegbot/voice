"""
Analytics models for the VoiceAI platform
"""
from datetime import datetime

from sqlalchemy.dialects.postgresql import JSON

from backend.models.db import db


class VoiceInsight(db.Model):
    """Voice insight model for storing analyzed customer feedback"""
    __tablename__ = 'voice_insights'

    id = db.Column(db.Integer, primary_key=True)
    call_id = db.Column(db.Integer, db.ForeignKey('calls.id'), nullable=False)
    lead_id = db.Column(db.Integer, db.ForeignKey('leads.id'), nullable=False)
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    sentiment_score = db.Column(db.Float)  # Range -1 to 1
    sentiment_magnitude = db.Column(db.Float)  # Intensity of sentiment

    themes = db.Column(JSON)  # JSON array of identified themes

    pain_points = db.Column(JSON)  # JSON array of pain points
    feedback_categories = db.Column(JSON)  # Product, service, UI/UX, pricing, etc.

    customer_intent = db.Column(db.String(100))  # e.g., complaint, inquiry, feedback

    improvement_suggestions = db.Column(JSON)  # Extracted improvement suggestions

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    # call = db.relationship('Call', backref='voice_insights', lazy=True)
    # lead = db.relationship('Lead', backref='voice_insights', lazy=True)
    # agent = db.relationship('User', backref='voice_insights', lazy=True)

    def to_dict(self):
        """Convert instance to dictionary"""
        return {
            'id': self.id,
            'call_id': self.call_id,
            'lead_id': self.lead_id,
            'agent_id': self.agent_id,
            'sentiment_score': self.sentiment_score,
            'sentiment_magnitude': self.sentiment_magnitude,
            'themes': self.themes,
            'pain_points': self.pain_points,
            'feedback_categories': self.feedback_categories,
            'customer_intent': self.customer_intent,
            'improvement_suggestions': self.improvement_suggestions,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class ProductFeedbackSummary(db.Model):
    """Aggregated product feedback summary model"""
    __tablename__ = 'product_feedback_summaries'

    id = db.Column(db.Integer, primary_key=True)
    period = db.Column(db.String(50))  # daily, weekly, monthly
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)

    total_calls = db.Column(db.Integer, default=0)
    total_feedback_points = db.Column(db.Integer, default=0)
    avg_sentiment_score = db.Column(db.Float)

    top_themes = db.Column(JSON)  # Ordered by frequency
    top_pain_points = db.Column(JSON)  # Ordered by frequency
    top_improvement_areas = db.Column(JSON)  # Ordered by impact

    sentiment_trend = db.Column(db.Float)  # Change in sentiment
    themes_trend = db.Column(JSON)  # New/emerging themes

    category_breakdown = db.Column(JSON)  # Stats by feedback category

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert instance to dictionary"""
        return {
            'id': self.id,
            'period': self.period,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'total_calls': self.total_calls,
            'total_feedback_points': self.total_feedback_points,
            'avg_sentiment_score': self.avg_sentiment_score,
            'top_themes': self.top_themes,
            'top_pain_points': self.top_pain_points,
            'top_improvement_areas': self.top_improvement_areas,
            'sentiment_trend': self.sentiment_trend,
            'themes_trend': self.themes_trend,
            'category_breakdown': self.category_breakdown,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }