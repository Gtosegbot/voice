"""
Voice Analytics API endpoints for the VoiceAI platform
"""

from datetime import datetime
import json
from flask import Blueprint, jsonify, request, current_app
from werkzeug.exceptions import BadRequest, NotFound

from backend.models.analytics import VoiceInsight, ProductFeedbackSummary
from backend.models.db import db
from backend.services.voice_analytics_service import (
    get_sentiment_trend,
    get_feedback_categories,
    get_pain_points,
    get_improvement_opportunities,
    get_emerging_themes,
    analyze_call_feedback,
    generate_feedback_summary
)
from backend.utils.auth import token_required, admin_required

# Create blueprint
voice_analytics_bp = Blueprint('voice_analytics', __name__)


@voice_analytics_bp.route('/api/analytics/voice/sentiment-trend', methods=['GET'])
@token_required
def get_voice_sentiment_trend():
    """Get sentiment trend data"""
    period = request.args.get('period', 'weekly')
    if period not in ['daily', 'weekly', 'monthly']:
        return jsonify({'error': 'Invalid period parameter'}), 400
    
    data = get_sentiment_trend(period)
    return jsonify(data)


@voice_analytics_bp.route('/api/analytics/voice/feedback-categories', methods=['GET'])
@token_required
def get_voice_feedback_categories():
    """Get feedback categories distribution"""
    data = get_feedback_categories()
    return jsonify(data)


@voice_analytics_bp.route('/api/analytics/voice/pain-points', methods=['GET'])
@token_required
def get_voice_pain_points():
    """Get top pain points with frequency, impact, and sentiment"""
    data = get_pain_points()
    return jsonify(data)


@voice_analytics_bp.route('/api/analytics/voice/improvement-opportunities', methods=['GET'])
@token_required
def get_voice_improvement_opportunities():
    """Get improvement opportunities based on feedback analysis"""
    data = get_improvement_opportunities()
    return jsonify(data)


@voice_analytics_bp.route('/api/analytics/voice/emerging-themes', methods=['GET'])
@token_required
def get_voice_emerging_themes():
    """Get emerging themes for the specified period"""
    period = request.args.get('period', 'weekly')
    if period not in ['weekly', 'monthly']:
        return jsonify({'error': 'Invalid period parameter'}), 400
    
    data = get_emerging_themes(period)
    return jsonify(data)


@voice_analytics_bp.route('/api/analytics/voice/insights', methods=['GET'])
@token_required
def get_voice_insights():
    """Get voice insights with pagination and filtering"""
    # Parse pagination parameters
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    
    # Parse filters
    lead_id = request.args.get('lead_id')
    agent_id = request.args.get('agent_id')
    call_id = request.args.get('call_id')
    sentiment = request.args.get('sentiment')
    theme = request.args.get('theme')
    pain_point = request.args.get('pain_point')
    date_from = request.args.get('from')
    date_to = request.args.get('to')
    
    # Build query
    query = VoiceInsight.query
    
    if lead_id:
        query = query.filter(VoiceInsight.lead_id == lead_id)
    
    if agent_id:
        query = query.filter(VoiceInsight.agent_id == agent_id)
    
    if call_id:
        query = query.filter(VoiceInsight.call_id == call_id)
    
    if sentiment:
        if sentiment == 'positive':
            query = query.filter(VoiceInsight.sentiment_score >= 0.5)
        elif sentiment == 'neutral':
            query = query.filter(VoiceInsight.sentiment_score > -0.5, VoiceInsight.sentiment_score < 0.5)
        elif sentiment == 'negative':
            query = query.filter(VoiceInsight.sentiment_score <= -0.5)
    
    if theme:
        # Filter by theme (requires custom SQL for JSON array contains)
        query = query.filter(VoiceInsight.themes.contains([theme]))
    
    if pain_point:
        # Filter by pain point (requires custom SQL for JSON array contains)
        query = query.filter(VoiceInsight.pain_points.contains([pain_point]))
    
    if date_from:
        try:
            date_from = datetime.strptime(date_from, '%Y-%m-%d')
            query = query.filter(VoiceInsight.created_at >= date_from)
        except ValueError:
            pass
    
    if date_to:
        try:
            date_to = datetime.strptime(date_to, '%Y-%m-%d')
            query = query.filter(VoiceInsight.created_at <= date_to)
        except ValueError:
            pass
    
    # Sort by date (newest first)
    query = query.order_by(VoiceInsight.created_at.desc())
    
    # Paginate results
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Format response
    result = {
        'items': [insight.to_dict() for insight in paginated.items],
        'total': paginated.total,
        'page': page,
        'per_page': per_page,
        'pages': paginated.pages
    }
    
    return jsonify(result)


@voice_analytics_bp.route('/api/analytics/voice/insights/<int:insight_id>', methods=['GET'])
@token_required
def get_voice_insight(insight_id):
    """Get a specific voice insight by ID"""
    insight = VoiceInsight.query.get(insight_id)
    
    if not insight:
        return jsonify({'error': 'Voice insight not found'}), 404
    
    return jsonify(insight.to_dict())


@voice_analytics_bp.route('/api/analytics/voice/analyze-call/<int:call_id>', methods=['POST'])
@token_required
def analyze_call(call_id):
    """Analyze a call transcript to extract insights"""
    result = analyze_call_feedback(call_id)
    
    if not result.get('success'):
        return jsonify({'error': result.get('message', 'Unknown error')}), 400
    
    return jsonify(result)


@voice_analytics_bp.route('/api/analytics/voice/feedback-summaries', methods=['GET'])
@token_required
def get_feedback_summaries():
    """Get feedback summaries with pagination"""
    # Parse pagination parameters
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    
    # Build query
    query = ProductFeedbackSummary.query
    
    # Sort by date (newest first)
    query = query.order_by(ProductFeedbackSummary.created_at.desc())
    
    # Paginate results
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Format response
    result = {
        'items': [summary.to_dict() for summary in paginated.items],
        'total': paginated.total,
        'page': page,
        'per_page': per_page,
        'pages': paginated.pages
    }
    
    return jsonify(result)


@voice_analytics_bp.route('/api/analytics/voice/latest-summary', methods=['GET'])
@token_required
def get_latest_summary():
    """Get the latest feedback summary by period"""
    period = request.args.get('period', 'weekly')
    if period not in ['daily', 'weekly', 'monthly']:
        return jsonify({'error': 'Invalid period parameter'}), 400
    
    # Get the latest summary for the requested period
    summary = ProductFeedbackSummary.query.filter_by(period=period).order_by(
        ProductFeedbackSummary.created_at.desc()
    ).first()
    
    if not summary:
        return jsonify({'error': 'No summary found for the requested period'}), 404
    
    return jsonify(summary.to_dict())


@voice_analytics_bp.route('/api/analytics/voice/generate-summary', methods=['POST'])
@admin_required
def generate_summary():
    """Generate a new feedback summary"""
    # Get period from request data
    data = request.get_json()
    period = data.get('period', 'weekly')
    
    if period not in ['daily', 'weekly', 'monthly']:
        return jsonify({'error': 'Invalid period parameter'}), 400
    
    result = generate_feedback_summary(period)
    
    if not result.get('success'):
        return jsonify({'error': result.get('message', 'Unknown error')}), 400
    
    return jsonify(result)


def register_routes(app):
    """Register API routes with the app"""
    app.register_blueprint(voice_analytics_bp)