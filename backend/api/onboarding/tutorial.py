"""
Interactive Onboarding Tutorial API
Handles user onboarding progress and tutorial state
"""

from datetime import datetime
from flask import Blueprint, request, jsonify, current_app, g
from backend.models.db import db
from backend.utils.auth import token_required

# Create blueprint
tutorial_bp = Blueprint('tutorial', __name__)

# Tutorial progress model
class TutorialProgress(db.Model):
    """Model for tracking user tutorial progress"""
    __tablename__ = 'tutorial_progress'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    tutorial_type = db.Column(db.String(30), nullable=False)  # 'full', 'quick', 'feature-specific'
    feature_name = db.Column(db.String(50), nullable=True)    # Only for feature-specific tutorials
    current_step = db.Column(db.Integer, default=0)
    is_completed = db.Column(db.Boolean, default=False)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'tutorial_type': self.tutorial_type,
            'feature_name': self.feature_name,
            'current_step': self.current_step,
            'is_completed': self.is_completed,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# API endpoints
@tutorial_bp.route('/progress', methods=['GET'])
@token_required
def get_tutorial_progress():
    """Get the user's tutorial progress"""
    # Get latest tutorial progress for the current user
    progress = TutorialProgress.query.filter_by(
        user_id=g.user.id
    ).order_by(TutorialProgress.created_at.desc()).first()
    
    if not progress:
        return jsonify({
            'success': True,
            'hasStartedTutorial': False,
            'progress': None
        }), 200
    
    return jsonify({
        'success': True,
        'hasStartedTutorial': True,
        'progress': progress.to_dict()
    }), 200

@tutorial_bp.route('/start', methods=['POST'])
@token_required
def start_tutorial():
    """Start or restart a tutorial"""
    data = request.get_json()
    
    # Validate input
    if not data or 'tutorialType' not in data:
        return jsonify({
            'success': False,
            'message': 'Missing required field: tutorialType'
        }), 400
    
    tutorial_type = data.get('tutorialType')
    feature_name = data.get('featureName')
    
    # Mark any existing incomplete tutorials as abandoned
    incomplete_tutorials = TutorialProgress.query.filter_by(
        user_id=g.user.id,
        is_completed=False
    ).all()
    
    for tutorial in incomplete_tutorials:
        tutorial.is_completed = True
        tutorial.completed_at = datetime.utcnow()
    
    # Create new tutorial progress
    new_progress = TutorialProgress(
        user_id=g.user.id,
        tutorial_type=tutorial_type,
        feature_name=feature_name if tutorial_type == 'feature-specific' else None,
        current_step=0,
        is_completed=False
    )
    
    db.session.add(new_progress)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Tutorial started successfully',
        'progress': new_progress.to_dict()
    }), 201

@tutorial_bp.route('/update', methods=['PUT'])
@token_required
def update_tutorial_progress():
    """Update tutorial progress"""
    data = request.get_json()
    
    # Validate input
    if not data or 'tutorialId' not in data or 'currentStep' not in data:
        return jsonify({
            'success': False,
            'message': 'Missing required fields: tutorialId, currentStep'
        }), 400
    
    tutorial_id = data.get('tutorialId')
    current_step = data.get('currentStep')
    is_completed = data.get('isCompleted', False)
    
    # Find the tutorial progress
    progress = TutorialProgress.query.filter_by(
        id=tutorial_id,
        user_id=g.user.id
    ).first()
    
    if not progress:
        return jsonify({
            'success': False,
            'message': 'Tutorial progress not found'
        }), 404
    
    # Update progress
    progress.current_step = current_step
    
    if is_completed and not progress.is_completed:
        progress.is_completed = True
        progress.completed_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Tutorial progress updated successfully',
        'progress': progress.to_dict()
    }), 200

@tutorial_bp.route('/complete', methods=['PUT'])
@token_required
def complete_tutorial():
    """Mark a tutorial as completed"""
    data = request.get_json()
    
    # Validate input
    if not data or 'tutorialId' not in data:
        return jsonify({
            'success': False,
            'message': 'Missing required field: tutorialId'
        }), 400
    
    tutorial_id = data.get('tutorialId')
    
    # Find the tutorial progress
    progress = TutorialProgress.query.filter_by(
        id=tutorial_id,
        user_id=g.user.id
    ).first()
    
    if not progress:
        return jsonify({
            'success': False,
            'message': 'Tutorial progress not found'
        }), 404
    
    # Mark as completed
    progress.is_completed = True
    progress.completed_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Tutorial marked as completed',
        'progress': progress.to_dict()
    }), 200

@tutorial_bp.route('/steps', methods=['GET'])
def get_tutorial_steps():
    """Get tutorial steps based on type and feature"""
    tutorial_type = request.args.get('type', 'quick')
    feature_name = request.args.get('feature')
    
    # In a real application, these would be loaded from a database or config file
    # For this example, we'll return stub data
    
    if tutorial_type == 'feature-specific' and feature_name:
        steps = get_feature_specific_steps(feature_name)
    elif tutorial_type == 'full':
        steps = get_full_tutorial_steps()
    else:
        steps = get_quick_tutorial_steps()
    
    return jsonify({
        'success': True,
        'steps': steps
    }), 200

# Helper functions for tutorial steps
def get_quick_tutorial_steps():
    """Get quick tutorial steps"""
    return [
        {
            'id': 1,
            'page': '#dashboard',
            'selector': '#dashboard-overview',
            'position': 'bottom',
            'content': '<p>Bem-vindo à <strong>Plataforma de Prospecção por Voz</strong>!</p><p>Vamos fazer um tour rápido pelas funcionalidades essenciais.</p>'
        },
        # Additional steps would be defined here
        # This is simplified for the example
    ]

def get_full_tutorial_steps():
    """Get full tutorial steps"""
    return [
        {
            'id': 1,
            'page': '#dashboard',
            'selector': '#dashboard-overview',
            'position': 'bottom',
            'content': '<p>Bem-vindo ao <strong>Dashboard</strong>! Aqui você pode ver uma visão geral do seu desempenho e atividades recentes.</p><p>Vamos conhecer as principais funcionalidades da plataforma.</p>'
        },
        # Additional steps would be defined here
        # This is simplified for the example
    ]

def get_feature_specific_steps(feature):
    """Get feature-specific tutorial steps"""
    # In a real application, these would be loaded from a database
    # This is simplified for the example
    feature_steps = {
        'campaigns': [
            {
                'id': 1,
                'page': '#campaigns',
                'selector': '#campaigns-list',
                'position': 'bottom',
                'content': '<p>Esta é a página de <strong>Gerenciamento de Campanhas</strong>.</p><p>As campanhas organizam seus esforços de prospecção em grupos focados.</p>'
            },
            # Additional steps would be defined here
        ],
        'calls': [
            {
                'id': 1,
                'page': '#calls',
                'selector': '#calls-list',
                'position': 'bottom',
                'content': '<p>Esta é a página de <strong>Gerenciamento de Chamadas</strong>.</p><p>Aqui você vê o histórico de chamadas e pode iniciar novas conversas.</p>'
            },
            # Additional steps would be defined here
        ],
        # Other features would be defined here
    }
    
    return feature_steps.get(feature, [])