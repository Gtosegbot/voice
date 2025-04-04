"""
Mock Voice Analytics API endpoints for the VoiceAI platform (without database)
"""

import random
import json
from datetime import datetime
from flask import Blueprint, jsonify, request, current_app

# Create blueprint
voice_analytics_bp = Blueprint('voice_analytics', __name__)


@voice_analytics_bp.route('/api/analytics/voice/sentiment-trend', methods=['GET'])
def get_voice_sentiment_trend():
    """Get sentiment trend data"""
    period = request.args.get('period', 'weekly')
    if period not in ['daily', 'weekly', 'monthly']:
        return jsonify({'error': 'Invalid period parameter'}), 400
    
    segments = 8 if period == 'daily' else (4 if period == 'weekly' else 6)
    
    # Generate mock data
    if period == 'daily':
        labels = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm']
        positive_data = [0.70, 0.65, 0.68, 0.72, 0.74, 0.71, 0.69, 0.67, 0.70]
        neutral_data = [0.20, 0.25, 0.22, 0.18, 0.16, 0.19, 0.21, 0.23, 0.20]
        negative_data = [0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10]
    elif period == 'monthly':
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        positive_data = [0.62, 0.64, 0.68, 0.70, 0.72, 0.74]
        neutral_data = [0.28, 0.26, 0.22, 0.20, 0.18, 0.16]
        negative_data = [0.10, 0.10, 0.10, 0.10, 0.10, 0.10]
    else:  # weekly
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
        positive_data = [0.65, 0.68, 0.72, 0.70]
        neutral_data = [0.25, 0.22, 0.18, 0.20]
        negative_data = [0.10, 0.10, 0.10, 0.10]
    
    # Blend with some randomness
    positive_data = [max(0.6, min(0.8, p + random.uniform(-0.02, 0.02))) for p in positive_data]
    neutral_data = [max(0.1, min(0.3, n + random.uniform(-0.02, 0.02))) for n in neutral_data]
    negative_data = [max(0.05, min(0.15, n + random.uniform(-0.01, 0.01))) for n in negative_data]
    
    return jsonify({
        'labels': labels,
        'positive': positive_data,
        'neutral': neutral_data,
        'negative': negative_data
    })


@voice_analytics_bp.route('/api/analytics/voice/feedback-categories', methods=['GET'])
def get_voice_feedback_categories():
    """Get feedback categories distribution"""
    labels = ['Product Features', 'User Experience', 'Customer Service', 'Price', 'Technical Issues', 'Documentation']
    values = [45, 32, 28, 22, 18, 12]
    
    # Add some randomness
    values = [max(5, v + random.randint(-3, 3)) for v in values]
    
    return jsonify({
        'labels': labels,
        'values': values
    })


@voice_analytics_bp.route('/api/analytics/voice/pain-points', methods=['GET'])
def get_voice_pain_points():
    """Get top pain points with frequency, impact, and sentiment"""
    pain_points = [
        {
            'name': 'Dificuldade em configurar integrações',
            'frequency': 42,
            'impact': 0.85,
            'sentiment': -0.68,
            'trend': 0.15,
            'themes': ['Configuração', 'Integrações', 'Complexidade']
        },
        {
            'name': 'Interface do usuário confusa',
            'frequency': 38,
            'impact': 0.72,
            'sentiment': -0.55,
            'trend': -0.12,
            'themes': ['UI/UX', 'Usabilidade', 'Design']
        },
        {
            'name': 'Falta de tutoriais detalhados',
            'frequency': 35,
            'impact': 0.65,
            'sentiment': -0.42,
            'trend': 0.08,
            'themes': ['Documentação', 'Onboarding', 'Suporte']
        },
        {
            'name': 'Problemas de performance em chamadas longas',
            'frequency': 30,
            'impact': 0.78,
            'sentiment': -0.72,
            'trend': 0.22,
            'themes': ['Performance', 'Estabilidade', 'Recursos']
        },
        {
            'name': 'Preço elevado para pequenas empresas',
            'frequency': 28,
            'impact': 0.60,
            'sentiment': -0.48,
            'trend': -0.05,
            'themes': ['Preço', 'Planos', 'ROI']
        }
    ]
    
    # Add some randomness
    for point in pain_points:
        point['frequency'] = max(10, point['frequency'] + random.randint(-4, 4))
        point['impact'] = max(0.5, min(0.95, point['impact'] + random.uniform(-0.05, 0.05)))
        point['sentiment'] = max(-0.9, min(0.1, point['sentiment'] + random.uniform(-0.05, 0.05)))
        point['trend'] = max(-0.25, min(0.25, point['trend'] + random.uniform(-0.05, 0.05)))
    
    return jsonify(pain_points)


@voice_analytics_bp.route('/api/analytics/voice/improvement-opportunities', methods=['GET'])
def get_voice_improvement_opportunities():
    """Get improvement opportunities based on feedback analysis"""
    opportunities = [
        {
            'title': 'Simplificar processo de integração',
            'description': 'Desenvolver assistentes guiados para integração com CRMs e outras ferramentas populares.',
            'priority': 'high',
            'impact': 'Redução de 85% no tempo de setup',
            'benefit': 'Aumento de 30% na adoção'
        },
        {
            'title': 'Redesenhar interface de campanhas',
            'description': 'Simplificar e modernizar a interface de gerenciamento de campanhas para melhorar usabilidade.',
            'priority': 'high',
            'impact': 'Melhoria de 60% na eficiência',
            'benefit': 'Redução de 40% nas solicitações de suporte'
        },
        {
            'title': 'Expandir biblioteca de tutoriais',
            'description': 'Criar mais tutoriais em vídeo e documentação interativa para novos usuários.',
            'priority': 'medium',
            'impact': 'Aumento de 45% na autonomia do usuário',
            'benefit': 'Redução de 25% em tickets de suporte'
        },
        {
            'title': 'Otimizar performance para chamadas longas',
            'description': 'Implementar melhorias técnicas para chamadas com mais de 30 minutos.',
            'priority': 'medium',
            'impact': 'Redução de 90% em quedas de chamadas longas',
            'benefit': 'Aumento de 15% na satisfação'
        },
        {
            'title': 'Criar plano para pequenas empresas',
            'description': 'Desenvolver uma opção de preço mais acessível com recursos essenciais para pequenas empresas.',
            'priority': 'low',
            'impact': 'Acesso a novo segmento de mercado',
            'benefit': 'Aumento de 20% na base de clientes'
        }
    ]
    
    return jsonify(opportunities)


@voice_analytics_bp.route('/api/analytics/voice/emerging-themes', methods=['GET'])
def get_voice_emerging_themes():
    """Get emerging themes for the specified period"""
    period = request.args.get('period', 'weekly')
    if period not in ['weekly', 'monthly']:
        return jsonify({'error': 'Invalid period parameter'}), 400
    
    if period == 'monthly':
        data = {
            'new_themes': ['API Webhook', 'Integração com Teams', 'Voice Biometrics', 'GPT-4 Support', 'Speech Analytics'],
            'growing_themes': [
                {'theme': 'Mobile App', 'growth': 32},
                {'theme': 'Relatórios Personalizados', 'growth': 24},
                {'theme': 'Automação de Fluxos', 'growth': 18},
                {'theme': 'Multi-idioma', 'growth': 15},
                {'theme': 'Compliance', 'growth': 12}
            ]
        }
    else:  # weekly
        data = {
            'new_themes': ['API Webhook', 'Integração com Teams', 'Voice Biometrics'],
            'growing_themes': [
                {'theme': 'Mobile App', 'growth': 8},
                {'theme': 'Relatórios Personalizados', 'growth': 6},
                {'theme': 'Automação de Fluxos', 'growth': 5},
                {'theme': 'Multi-idioma', 'growth': 3}
            ]
        }
    
    # Add some randomness to growth numbers
    for theme in data['growing_themes']:
        theme['growth'] = max(1, theme['growth'] + random.randint(-1, 1))
    
    return jsonify(data)


def register_routes(app):
    """Register API routes with the app"""
    app.register_blueprint(voice_analytics_bp)