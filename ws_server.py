#!/usr/bin/env python
"""
WebSocket server para comunicação em tempo real na plataforma DisparoSeguro

Este servidor fornece comunicação em tempo real entre os diferentes componentes
da plataforma DisparoSeguro, como:
- Aplicações cliente frontend
- Instâncias de servidor backend
- Integrações externas (Asterisk, WhatsApp, etc.)

Ele atua como um broker de mensagens para eventos e notificações em tempo real.
"""

import asyncio
import websockets
import json
import logging
import os
import jwt
from datetime import datetime
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuração
PORT = int(os.environ.get('WS_PORT', 8765))
JWT_SECRET = os.environ.get('JWT_SECRET', 'disparoseguro-default-key')

# Clientes conectados
clients = {}

async def authenticate(websocket, path):
    """Autenticar cliente usando token JWT"""
    # Aguardar mensagem de autenticação
    try:
        auth_msg = await asyncio.wait_for(websocket.recv(), timeout=10.0)
        auth_data = json.loads(auth_msg)
        
        if not auth_data.get('token'):
            await websocket.send(json.dumps({
                'type': 'error',
                'message': 'Autenticação falhou: Token ausente'
            }))
            return None
        
        # Verificar token - simplificado
        try:
            token = auth_data.get('token')
            
            # Decodificar nosso token base64 simples
            import base64
            try:
                # Decodificar o token base64
                decoded_token = base64.b64decode(token).decode()
                payload = json.loads(decoded_token)
                
                # Extrair ID do usuário
                user_id = payload.get('sub')
                
                # Verificar se o token expirou
                expiration = payload.get('exp')
                current_time = datetime.utcnow().timestamp()
                
                if expiration and current_time > expiration:
                    await websocket.send(json.dumps({
                        'type': 'error',
                        'message': 'Autenticação falhou: Token expirado'
                    }))
                    return None
                
                # Retornar ID do usuário se autenticação for bem-sucedida
                return user_id
                
            except Exception:
                # Tentar JWT normal se não for nosso token base64
                try:
                    payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
                    user_id = payload.get('sub')
                    return user_id
                except:
                    raise Exception("Formato de token inválido")
        
        except Exception as e:
            await websocket.send(json.dumps({
                'type': 'error',
                'message': f'Autenticação falhou: {str(e)}'
            }))
            return None
    except asyncio.TimeoutError:
        await websocket.send(json.dumps({
            'type': 'error',
            'message': 'Autenticação falhou: Timeout'
        }))
        return None
    except Exception as e:
        logger.error(f"Erro de autenticação: {str(e)}")
        await websocket.send(json.dumps({
            'type': 'error',
            'message': f'Autenticação falhou: {str(e)}'
        }))
        return None

async def handle_client(websocket, path):
    """Tratar conexão de cliente WebSocket"""
    # Autenticar cliente
    user_id = await authenticate(websocket, path)
    
    if not user_id:
        return
    
    # Armazenar conexão do cliente
    if user_id in clients:
        # Fechar conexão existente
        try:
            await clients[user_id].send(json.dumps({
                'type': 'disconnect',
                'message': 'Nova conexão estabelecida'
            }))
            await clients[user_id].close()
        except Exception:
            pass
    
    clients[user_id] = websocket
    
    # Enviar mensagem de boas-vindas
    await websocket.send(json.dumps({
        'type': 'connected',
        'message': 'Conectado à plataforma DisparoSeguro',
        'timestamp': datetime.utcnow().isoformat()
    }))
    
    logger.info(f"Cliente conectado: ID de usuário {user_id}")
    
    try:
        # Tratar mensagens
        async for message in websocket:
            try:
                data = json.loads(message)
                event_type = data.get('type')
                payload = data.get('payload')
                
                # Tratar diferentes tipos de eventos
                if event_type == 'ping':
                    await websocket.send(json.dumps({
                        'type': 'pong',
                        'timestamp': datetime.utcnow().isoformat()
                    }))
                else:
                    logger.info(f"Evento recebido: {event_type}")
                    # Processar outros eventos conforme necessário
            except json.JSONDecodeError:
                logger.error("JSON inválido recebido")
                await websocket.send(json.dumps({
                    'type': 'error',
                    'message': 'Formato JSON inválido'
                }))
    except websockets.exceptions.ConnectionClosed:
        logger.info(f"Conexão fechada: ID de usuário {user_id}")
    except Exception as e:
        logger.error(f"Erro ao tratar cliente: {str(e)}")
    finally:
        # Remover cliente ao desconectar
        if user_id in clients and clients[user_id] == websocket:
            del clients[user_id]
            logger.info(f"Cliente removido: ID de usuário {user_id}")

async def broadcast_message(event, payload):
    """Transmitir mensagem para todos os clientes conectados"""
    if not clients:
        return
    
    message = json.dumps({
        'type': event,
        'payload': payload,
        'timestamp': datetime.utcnow().isoformat()
    })
    
    # Enviar para todos os clientes conectados
    disconnected_clients = []
    for user_id, websocket in clients.items():
        try:
            await websocket.send(message)
        except websockets.exceptions.ConnectionClosed:
            disconnected_clients.append(user_id)
        except Exception as e:
            logger.error(f"Erro ao enviar mensagem para cliente {user_id}: {str(e)}")
            disconnected_clients.append(user_id)
    
    # Remover clientes desconectados
    for user_id in disconnected_clients:
        if user_id in clients:
            del clients[user_id]
            logger.info(f"Cliente removido: ID de usuário {user_id}")

async def send_to_user(user_id, event, payload):
    """Enviar mensagem para um usuário específico"""
    if user_id not in clients:
        logger.warning(f"Usuário não conectado: {user_id}")
        return False
    
    message = json.dumps({
        'type': event,
        'payload': payload,
        'timestamp': datetime.utcnow().isoformat()
    })
    
    try:
        await clients[user_id].send(message)
        return True
    except websockets.exceptions.ConnectionClosed:
        # Remover cliente se a conexão estiver fechada
        del clients[user_id]
        logger.info(f"Cliente removido: ID de usuário {user_id}")
        return False
    except Exception as e:
        logger.error(f"Erro ao enviar mensagem para cliente {user_id}: {str(e)}")
        return False

async def main():
    """Função principal para iniciar servidor WebSocket"""
    # Porta do servidor WebSocket
    port = int(os.environ.get('WS_PORT', 8765))
    
    # Iniciar servidor WebSocket
    async with websockets.serve(handle_client, '0.0.0.0', port):
        logger.info(f"Servidor WebSocket iniciado na porta {port}")
        await asyncio.Future()  # Executar para sempre

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Servidor parado")
