"""
Modelos para o sistema de gamificação de desempenho dos agentes
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Table, Boolean
from sqlalchemy.orm import relationship
from backend.models.db import db

# Define tabela de associação entre conquistas e usuários
user_achievements = Table(
    'user_achievements',
    db.Model.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('achievement_id', Integer, ForeignKey('achievements.id'), primary_key=True),
    Column('earned_at', DateTime, default=datetime.utcnow)
)

class PerformanceMetric(db.Model):
    """Modelo para métricas de desempenho dos agentes"""
    __tablename__ = 'performance_metrics'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    metric_type = Column(String(50), nullable=False)  # calls_made, conversion_rate, satisfaction_score, etc.
    metric_value = Column(Float, nullable=False)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    user = relationship('User', backref='performance_metrics')

    def to_dict(self):
        """Converte instância em dicionário"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'metric_type': self.metric_type,
            'metric_value': self.metric_value,
            'period_start': self.period_start.isoformat() if self.period_start else None,
            'period_end': self.period_end.isoformat() if self.period_end else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Achievement(db.Model):
    """Modelo para conquistas e metas disponíveis no sistema"""
    __tablename__ = 'achievements'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    icon = Column(String(100))  # Nome do ícone ou caminho para imagem
    points = Column(Integer, default=0)  # Pontos ganhos ao conquistar
    metric_type = Column(String(50))  # Tipo de métrica relacionada
    metric_threshold = Column(Float)  # Valor necessário para desbloquear
    is_active = Column(Boolean, default=True)  # Se a conquista está ativa
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    users = relationship('User', secondary=user_achievements, back_populates='achievements')

    def to_dict(self):
        """Converte instância em dicionário"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'points': self.points,
            'metric_type': self.metric_type,
            'metric_threshold': self.metric_threshold,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class UserLevel(db.Model):
    """Modelo para níveis dos usuários no sistema de gamificação"""
    __tablename__ = 'user_levels'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    current_level = Column(Integer, default=1)
    points = Column(Integer, default=0)  # Pontos acumulados pelo usuário
    next_level_points = Column(Integer, default=100)  # Pontos para alcançar próximo nível
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    user = relationship('User', backref='level_info', uselist=False)

    def to_dict(self):
        """Converte instância em dicionário"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'current_level': self.current_level,
            'points': self.points,
            'next_level_points': self.next_level_points,
            'progress_percentage': int((self.points / self.next_level_points) * 100) if self.next_level_points > 0 else 0,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Challenge(db.Model):
    """Modelo para desafios específicos dentro do sistema de gamificação"""
    __tablename__ = 'challenges'

    id = Column(Integer, primary_key=True)
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    reward_points = Column(Integer, default=0)
    target_value = Column(Float, nullable=False)  # Valor alvo para completar o desafio
    metric_type = Column(String(50), nullable=False)  # Tipo de métrica para este desafio
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    participants = relationship('ChallengeParticipant', back_populates='challenge')

    def to_dict(self):
        """Converte instância em dicionário"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'reward_points': self.reward_points,
            'target_value': self.target_value,
            'metric_type': self.metric_type,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'days_remaining': (self.end_date - datetime.utcnow()).days if self.end_date > datetime.utcnow() else 0
        }

class ChallengeParticipant(db.Model):
    """Modelo para participantes de desafios"""
    __tablename__ = 'challenge_participants'

    id = Column(Integer, primary_key=True)
    challenge_id = Column(Integer, ForeignKey('challenges.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    current_value = Column(Float, default=0.0)  # Valor atual alcançado
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime)
    joined_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    challenge = relationship('Challenge', back_populates='participants')
    user = relationship('User', backref='challenge_participations')

    def to_dict(self):
        """Converte instância em dicionário"""
        return {
            'id': self.id,
            'challenge_id': self.challenge_id,
            'user_id': self.user_id,
            'current_value': self.current_value,
            'progress_percentage': int((self.current_value / self.challenge.target_value) * 100) 
                                if self.challenge and self.challenge.target_value > 0 else 0,
            'completed': self.completed,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# Atualizar modelo User para incluir relacionamentos com gamificação
def update_user_model():
    """Atualiza o modelo User para incluir relacionamentos de gamificação"""
    from backend.models.user import User
    
    # Adicionar relacionamento com conquistas se ainda não existir
    if not hasattr(User, 'achievements'):
        User.achievements = relationship('Achievement', secondary=user_achievements, 
                                          back_populates='users')