"""
Interactive Tutorial API for the VoiceAI platform
Handles tutorial tracking and progression
"""

from datetime import datetime
from flask import Blueprint, jsonify, request, current_app
from backend.utils.auth import token_required
from backend.models.db import db

# Create blueprint
tutorial_api = Blueprint('tutorial_api', __name__)

class TutorialProgress(db.Model):
    """Tutorial Progress model for tracking user tutorial completion"""
    __tablename__ = 'tutorial_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    tutorial_id = db.Column(db.String(50), nullable=False)  # E.g., 'full', 'campaign', 'aiModel'
    completed = db.Column(db.Boolean, default=False)
    last_step = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert instance to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'tutorial_id': self.tutorial_id,
            'completed': self.completed,
            'last_step': self.last_step,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Routes
@tutorial_api.route('/onboarding-status', methods=['GET'])
@token_required
def get_onboarding_status(current_user):
    """Get user's onboarding status"""
    # Check if user has completed any tutorials
    tutorials = TutorialProgress.query.filter_by(user_id=current_user.id).all()
    
    # Format response
    response = {
        'hasStartedOnboarding': len(tutorials) > 0,
        'hasCompletedOnboarding': any(t.completed and t.tutorial_id == 'full' for t in tutorials),
        'tutorials': [t.to_dict() for t in tutorials]
    }
    
    return jsonify(response), 200

@tutorial_api.route('/tutorial-progress', methods=['POST'])
@token_required
def update_tutorial_progress(current_user):
    """Update user's tutorial progress"""
    data = request.get_json()
    
    if not data or 'tutorial_id' not in data:
        return jsonify({'message': 'Missing tutorial ID'}), 400
    
    tutorial_id = data['tutorial_id']
    completed = data.get('completed', False)
    last_step = data.get('last_step', 0)
    
    # Find existing tutorial progress
    tutorial_progress = TutorialProgress.query.filter_by(
        user_id=current_user.id,
        tutorial_id=tutorial_id
    ).first()
    
    if tutorial_progress:
        # Update existing tutorial
        tutorial_progress.completed = completed
        tutorial_progress.last_step = last_step
        tutorial_progress.updated_at = datetime.utcnow()
    else:
        # Create new tutorial progress
        tutorial_progress = TutorialProgress(
            user_id=current_user.id,
            tutorial_id=tutorial_id,
            completed=completed,
            last_step=last_step
        )
        db.session.add(tutorial_progress)
    
    # Save changes
    db.session.commit()
    
    return jsonify(tutorial_progress.to_dict()), 200

@tutorial_api.route('/reset-tutorial', methods=['POST'])
@token_required
def reset_tutorial(current_user):
    """Reset user's tutorial progress"""
    data = request.get_json()
    
    if not data or 'tutorial_id' not in data:
        return jsonify({'message': 'Missing tutorial ID'}), 400
    
    tutorial_id = data['tutorial_id']
    
    # Find existing tutorial progress
    tutorial_progress = TutorialProgress.query.filter_by(
        user_id=current_user.id,
        tutorial_id=tutorial_id
    ).first()
    
    if tutorial_progress:
        # Reset tutorial progress
        tutorial_progress.completed = False
        tutorial_progress.last_step = 0
        tutorial_progress.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(tutorial_progress.to_dict()), 200
    else:
        return jsonify({'message': 'Tutorial not found'}), 404

@tutorial_api.route('/tutorial-content', methods=['GET'])
@token_required
def get_tutorial_content(current_user):
    """Get tutorial content for specified tutorial ID"""
    tutorial_id = request.args.get('tutorial_id', 'full')
    
    # Define tutorial content (in a real app, this might come from a database)
    tutorials = {
        'full': {
            'title': 'Tour Completo da Plataforma',
            'description': 'Conheça todas as funcionalidades da plataforma VoiceAI',
            'steps': [
                {
                    'title': 'Bem-vindo à Plataforma VoiceAI',
                    'content': 'Vamos conhecer as principais funcionalidades da nossa plataforma.',
                    'element': '.app-container',
                    'position': 'center'
                },
                {
                    'title': 'Menu de Navegação',
                    'content': 'Acesse facilmente todas as seções da plataforma.',
                    'element': '.sidebar',
                    'position': 'right'
                },
                # More steps would be included here
            ]
        },
        'campaign': {
            'title': 'Criação de Campanha',
            'description': 'Aprenda a criar e gerenciar campanhas de prospecção',
            'steps': [
                {
                    'title': 'Campanhas de Prospecção',
                    'content': 'Vamos aprender a criar uma nova campanha de prospecção.',
                    'element': '#sidebar-campaigns',
                    'position': 'right'
                },
                # More steps would be included here
            ]
        }
        # Other tutorials would be included here
    }
    
    if tutorial_id in tutorials:
        return jsonify(tutorials[tutorial_id]), 200
    else:
        return jsonify({'message': 'Tutorial not found'}), 404

def register_tutorial_api(app):
    """Register the tutorial API blueprint"""
    app.register_blueprint(tutorial_api, url_prefix='/api/onboarding')
    
    # Create tables
    with app.app_context():
        db.create_all()
        
    return app