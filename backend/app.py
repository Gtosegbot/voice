#!/usr/bin/env python
"""
Servidor API para DisparoSeguro
"""

import os
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuração da aplicação
app = Flask(__name__)
CORS(app)  # Permitir CORS para todas as rotas

# Porta da aplicação
PORT = int(os.environ.get('PORT', 5001))
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

# Dados simulados
SAMPLE_DATA = {
    'stats': {
        'total_calls': 15432,
        'conversion_rate': 23.4,
        'leads_generated': 3687,
        'avg_duration': '2m 45s'
    },
    'recent_activities': [
        {
            'id': 1,
            'date': '2025-04-04 14:30',
            'agent': 'Ana Silva',
            'lead': 'João Pereira',
            'type': 'Chamada de Qualificação',
            'duration': '3m 22s',
            'status': 'Concluída'
        },
        {
            'id': 2,
            'date': '2025-04-04 13:15',
            'agent': 'Carlos Santos',
            'lead': 'Maria Oliveira',
            'type': 'Apresentação de Produto',
            'duration': '5m 45s',
            'status': 'Concluída'
        },
        {
            'id': 3,
            'date': '2025-04-04 11:50',
            'agent': 'Ana Silva',
            'lead': 'Pedro Santos',
            'type': 'Chamada de Follow-up',
            'duration': '2m 12s',
            'status': 'Não Atendida'
        }
    ]
}

# Rota principal - Redireciona para o frontend
@app.route('/')
def index():
    return jsonify({
        'service': 'DisparoSeguro API',
        'status': 'running',
        'version': '1.0.0',
        'documentation': '/docs'
    })

# Rota para estatísticas
@app.route('/api/stats')
def get_stats():
    logger.info("Solicitação de estatísticas recebida")
    return jsonify(SAMPLE_DATA['stats'])

# Rota para atividades recentes
@app.route('/api/activities')
def get_activities():
    limit = request.args.get('limit', default=10, type=int)
    logger.info(f"Solicitação de atividades recentes recebida. Limite: {limit}")
    
    # Limitar a quantidade de atividades retornadas
    activities = SAMPLE_DATA['recent_activities'][:limit]
    
    return jsonify(activities)

# Endpoint para dados do usuário
@app.route('/api/user')
def get_user():
    # Simulação de usuário autenticado
    return jsonify({
        'id': 1,
        'username': 'admin',
        'email': 'admin@disparoseguro.shop',
        'name': 'Administrador',
        'role': 'admin',
        'avatar': None,
        'last_login': datetime.now().isoformat()
    })

# Rota para geração de token para WebSocket (simulada)
@app.route('/api/ws-token', methods=['POST'])
def get_ws_token():
    # Em produção, seria validado com autenticação real
    username = request.json.get('username', 'anonymous')
    
    # Gerar token simulado (não seguro para produção)
    import base64
    from datetime import datetime, timedelta
    
    token_data = {
        'sub': username,
        'exp': (datetime.utcnow() + timedelta(hours=1)).timestamp(),
        'iat': datetime.utcnow().timestamp()
    }
    
    # Token base64 simples - NÃO usar em produção
    token = base64.b64encode(json.dumps(token_data).encode()).decode()
    
    return jsonify({
        'token': token,
        'expires_in': 3600  # 1 hora em segundos
    })

# Rota para documentação da API
@app.route('/docs')
def api_docs():
    return jsonify({
        'api_version': '1.0.0',
        'endpoints': [
            {'path': '/api/stats', 'method': 'GET', 'description': 'Retorna estatísticas do dashboard'},
            {'path': '/api/activities', 'method': 'GET', 'description': 'Retorna atividades recentes'},
            {'path': '/api/user', 'method': 'GET', 'description': 'Retorna dados do usuário atual'},
            {'path': '/api/ws-token', 'method': 'POST', 'description': 'Gera token para WebSocket'}
        ]
    })

# Manipulador de erros 404
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Recurso não encontrado'}), 404

# Manipulador de erros 500
@app.errorhandler(500)
def server_error(e):
    logger.error(f"Erro interno do servidor: {str(e)}")
    return jsonify({'error': 'Erro interno do servidor'}), 500

if __name__ == '__main__':
    logger.info(f"Iniciando servidor API na porta {PORT}")
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)
