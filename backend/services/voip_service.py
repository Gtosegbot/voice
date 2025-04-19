# backend/services/voip_service.py
import os
import json
import logging
import threading
import time
from typing import Dict, List, Optional, Tuple, Union
import requests

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VoIPManager:
    """
    Gerenciador de conexões VoIP com suporte para vários provedores.
    Suporta Asterisk, Twilio, Plivo, e configurações SIP personalizadas.
    """
    
    def __init__(self, config: Dict):
        """
        Inicializa o gerenciador VoIP com a configuração fornecida.
        
        Args:
            config: Dicionário com configurações do serviço VoIP
        """
        self.voip_type = config.get('type', 'asterisk')
        self.config = config
        self.connection = None
        self.status = "disconnected"
        self.extensions = {}
        self.active_calls = {}
        self.call_callbacks = {}
        self.monitor_thread = None
        self.connected = False
        
        # Carregar adaptadores específicos
        if self.voip_type == 'asterisk':
            try:
                import asterisk.manager
                self.asterisk = asterisk.manager
            except ImportError:
                logger.warning("Módulo Asterisk não encontrado. Instalando...")
                try:
                    import subprocess
                    subprocess.check_call(["pip", "install", "pyst2"])
                    import asterisk.manager
                    self.asterisk = asterisk.manager
                except Exception as e:
                    logger.error(f"Falha ao instalar módulo Asterisk: {e}")
                    raise
        
    def initialize_connection(self) -> bool:
        """
        Inicializa a conexão com o servidor VoIP configurado.
        
        Returns:
            bool: True se a conexão for bem-sucedida, False caso contrário
        """
        if self.voip_type == 'asterisk':
            return self._connect_asterisk()
        elif self.voip_type == 'twilio':
            return self._connect_twilio()
        elif self.voip_type == 'plivo':
            return self._connect_plivo()
        elif self.voip_type == 'custom':
            return self._connect_custom_sip()
        else:
            logger.error(f"Tipo de VoIP não suportado: {self.voip_type}")
            return False
    
    def _connect_asterisk(self) -> bool:
        """Conecta ao servidor Asterisk"""
        try:
            # Parâmetros de conexão
            host = self.config.get('host', 'localhost')
            port = self.config.get('port', 5038)
            username = self.config.get('username', 'admin')
            password = self.config.get('password', 'admin')
            
            # Iniciar conexão
            logger.info(f"Conectando ao Asterisk em {host}:{port}...")
            manager = self.asterisk.Manager()
            manager.connect(host, port)
            manager.login(username, password)
            
            # Registrar evento de desconexão
            manager.register_event('Hangup', self._on_asterisk_hangup)
            manager.register_event('DialBegin', self._on_asterisk_dial_begin)
            manager.register_event('DialEnd', self._on_asterisk_dial_end)
            
            # Guardar conexão
            self.connection = manager
            self.status = "connected"
            self.connected = True
            
            # Iniciar monitoramento
            self._start_monitor()
            
            logger.info("Conexão com Asterisk estabelecida")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao conectar ao Asterisk: {e}")
            self.status = f"error: {str(e)}"
            return False
    
    def _connect_twilio(self) -> bool:
        """Configura conexão com API Twilio"""
        try:
            # Verificar se temos as credenciais
            account_sid = self.config.get('account_sid')
            auth_token = self.config.get('auth_token')
            
            if not account_sid or not auth_token:
                logger.error("Credenciais Twilio não configuradas")
                return False
            
            # Tentar importar biblioteca
            try:
                from twilio.rest import Client
            except ImportError:
                logger.warning("Módulo Twilio não encontrado. Instalando...")
                import subprocess
                subprocess.check_call(["pip", "install", "twilio"])
                from twilio.rest import Client
            
            # Iniciar cliente
            client = Client(account_sid, auth_token)
            
            # Testar conexão
            incoming_numbers = client.incoming_phone_numbers.list(limit=1)
            
            # Guardar conexão
            self.connection = client
            self.status = "connected"
            self.connected = True
            
            logger.info("Conexão com Twilio estabelecida")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao conectar ao Twilio: {e}")
            self.status = f"error: {str(e)}"
            return False
    
    def _connect_plivo(self) -> bool:
        """Configura conexão com API Plivo"""
        try:
            # Verificar se temos as credenciais
            auth_id = self.config.get('auth_id')
            auth_token = self.config.get('auth_token')
            
            if not auth_id or not auth_token:
                logger.error("Credenciais Plivo não configuradas")
                return False
            
            # Tentar importar biblioteca
            try:
                import plivo
            except ImportError:
                logger.warning("Módulo Plivo não encontrado. Instalando...")
                import subprocess
                subprocess.check_call(["pip", "install", "plivo"])
                import plivo
            
            # Iniciar cliente
            client = plivo.RestClient(auth_id=auth_id, auth_token=auth_token)
            
            # Testar conexão
            numbers = client.numbers.list()
            
            # Guardar conexão
            self.connection = client
            self.status = "connected"
            self.connected = True
            
            logger.info("Conexão com Plivo estabelecida")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao conectar ao Plivo: {e}")
            self.status = f"error: {str(e)}"
            return False
    
    def _connect_custom_sip(self) -> bool:
        """Configura conexão com servidor SIP personalizado"""
        try:
            # Verificar se temos os parâmetros mínimos
            sip_uri = self.config.get('sip_uri')
            username = self.config.get('username')
            password = self.config.get('password')
            
            if not all([sip_uri, username, password]):
                logger.error("Parâmetros SIP não configurados completamente")
                return False
            
            # Tentar importar biblioteca
            try:
                import pjsua2 as pj
            except ImportError:
                logger.warning("Módulo PJSUA2 não encontrado. É necessário instalação manual.")
                return False
            
            # Inicialização SIP será implementada baseada na biblioteca específica
            # Este é um placeholder para a implementação real
            
            self.status = "connected"
            self.connected = True
            
            logger.info("Conexão SIP personalizada estabelecida")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao conectar ao servidor SIP: {e}")
            self.status = f"error: {str(e)}"
            return False
    
    def create_extension(self, extension_number: str, name: str, context: str = "default") -> bool:
        """
        Cria um novo ramal no sistema VoIP.
        
        Args:
            extension_number: Número do ramal
            name: Nome associado ao ramal
            context: Contexto do ramal (para Asterisk)
            
        Returns:
            bool: True se criado com sucesso, False caso contrário
        """
        try:
            if not self.connected:
                logger.error("VoIP não conectado")
                return False
                
            if self.voip_type == 'asterisk':
                return self._create_asterisk_extension(extension_number, name, context)
            elif self.voip_type in ['twilio', 'plivo']:
                # Estes provedores não suportam criação de ramais da mesma forma
                logger.warning(f"Criação de ramais não suportada para {self.voip_type}")
                return False
            elif self.voip_type == 'custom':
                return self._create_custom_extension(extension_number, name)
            
            return False
            
        except Exception as e:
            logger.error(f"Erro ao criar ramal: {e}")
            return False
    
    def _create_asterisk_extension(self, extension: str, name: str, context: str) -> bool:
        """Cria ramal no Asterisk"""
        try:
            # No Asterisk, precisamos criar uma entrada no arquivo de configuração
            # Aqui vamos simular isso para propósitos de demonstração
            
            # Em um cenário real, você modificaria o arquivo sip.conf ou pjsip.conf
            # e aplicaria as mudanças com o comando 'reload'
            
            # Simulação de comando AMI para recarregar configuração
            if self.connection:
                self.connection.command(f'sip show peer {extension}')
                
                # Simulação de recarregamento
                self.connection.command('module reload')
                
                # Armazenar ramal na nossa lista interna
                self.extensions[extension] = {
                    'name': name,
                    'context': context,
                    'status': 'available'
                }
                
                logger.info(f"Ramal {extension} criado para {name}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Erro ao criar ramal no Asterisk: {e}")
            return False
    
    def _create_custom_extension(self, extension: str, name: str) -> bool:
        """Cria ramal em sistema SIP personalizado"""
        # Implementação específica para seu sistema SIP
        # Este é um placeholder
        
        # Armazenar ramal na nossa lista interna
        self.extensions[extension] = {
            'name': name,
            'status': 'available'
        }
        
        logger.info(f"Ramal {extension} criado para {name}")
        return True
    
    def make_call(self, from_number: str, to_number: str, 
                 callback_url: Optional[str] = None,
                 variables: Optional[Dict] = None) -> Tuple[bool, str]:
        """
        Inicia uma chamada telefônica.
        
        Args:
            from_number: Número de origem
            to_number: Número de destino
            callback_url: URL para receber eventos da chamada (webhook)
            variables: Variáveis adicionais para a chamada
            
        Returns:
            Tuple[bool, str]: (sucesso, id_da_chamada)
        """
        try:
            if not self.connected:
                logger.error("VoIP não conectado")
                return False, ""
                
            # Preparar variáveis
            call_vars = variables or {}
            call_id = f"call_{int(time.time())}_{hash(from_number + to_number) % 10000}"
            
            # Registrar callback se fornecido
            if callback_url:
                self.call_callbacks[call_id] = callback_url
            
            if self.voip_type == 'asterisk':
                return self._make_asterisk_call(call_id, from_number, to_number, call_vars)
            elif self.voip_type == 'twilio':
                return self._make_twilio_call(call_id, from_number, to_number, callback_url, call_vars)
            elif self.voip_type == 'plivo':
                return self._make_plivo_call(call_id, from_number, to_number, callback_url, call_vars)
            elif self.voip_type == 'custom':
                return self._make_custom_call(call_id, from_number, to_number, call_vars)
                
            return False, ""
            
        except Exception as e:
            logger.error(f"Erro ao fazer chamada: {e}")
            return False, ""
    
    def _make_asterisk_call(self, call_id: str, from_number: str, 
                           to_number: str, variables: Dict) -> Tuple[bool, str]:
        """Inicia chamada via Asterisk"""
        try:
            # Converter variáveis para formato Asterisk
            var_string = ""
            for key, value in variables.items():
                var_string += f"{key}={value},"
            
            # Remover última vírgula se houver variáveis
            if var_string:
                var_string = var_string[:-1]
            
            # Iniciar chamada via AMI
            channel = f"SIP/{from_number}"
            exten = to_number
            priority = 1
            timeout = 30000  # 30 segundos
            caller_id = variables.get('caller_id', from_number)
            
            # Preparar action de Originate
            action = {
                'Action': 'Originate',
                'Channel': channel,
                'Exten': exten,
                'Priority': priority,
                'Timeout': timeout,
                'CallerID': caller_id,
                'Variable': var_string,
                'Async': 'true'
            }
            
            # Adicionar contexto se fornecido
            context = variables.get('context')
            if context:
                action['Context'] = context
                
            # Enviar comando
            response = self.connection.send_action(action)
            
            if response.get('Response') == 'Success':
                # Guardar informações da chamada
                self.active_calls[call_id] = {
                    'from': from_number,
                    'to': to_number,
                    'status': 'dialing',
                    'start_time': time.time(),
                    'variables': variables,
                    'channel': channel
                }
                
                logger.info(f"Chamada {call_id} iniciada de {from_number} para {to_number}")
                return True, call_id
            else:
                logger.error(f"Falha ao iniciar chamada: {response.get('Message', 'Erro desconhecido')}")
                return False, ""
                
        except Exception as e:
            logger.error(f"Erro ao fazer chamada via Asterisk: {e}")
            return False, ""
    
    def _make_twilio_call(self, call_id: str, from_number: str, 
                         to_number: str, callback_url: str, 
                         variables: Dict) -> Tuple[bool, str]:
        """Inicia chamada via Twilio"""
        try:
            # Preparar cliente Twilio
            client = self.connection
            
            # Formatar números no padrão E.164
            if not from_number.startswith('+'):
                from_number = '+' + from_number
                
            if not to_number.startswith('+'):
                to_number = '+' + to_number
            
            # Iniciar chamada
            call = client.calls.create(
                to=to_number,
                from_=from_number,
                url=callback_url or self.config.get('default_twiml_url'),
                status_callback=callback_url,
                status_callback_event=['initiated', 'ringing', 'answered', 'completed'],
                status_callback_method='POST'
            )
            
            # Guardar informações da chamada
            self.active_calls[call_id] = {
                'from': from_number,
                'to': to_number,
                'status': 'dialing',
                'start_time': time.time(),
                'variables': variables,
                'provider_id': call.sid
            }
            
            logger.info(f"Chamada {call_id} iniciada via Twilio de {from_number} para {to_number}")
            return True, call_id
            
        except Exception as e:
            logger.error(f"Erro ao fazer chamada via Twilio: {e}")
            return False, ""
    
    def _make_plivo_call(self, call_id: str, from_number: str, 
                        to_number: str, callback_url: str, 
                        variables: Dict) -> Tuple[bool, str]:
        """Inicia chamada via Plivo"""
        try:
            # Preparar cliente Plivo
            client = self.connection
            
            # Iniciar chamada
            response = client.calls.create(
                from_=from_number,
                to_=to_number,
                answer_url=callback_url or self.config.get('default_answer_url'),
                answer_method='POST',
                callback_url=callback_url,
                callback_method='POST'
            )
            
            if response.get('message') == 'call fired':
                plivo_call_id = response.get('request_uuid')
                
                # Guardar informações da chamada
                self.active_calls[call_id] = {
                    'from': from_number,
                    'to': to_number,
                    'status': 'dialing',
                    'start_time': time.time(),
                    'variables': variables,
                    'provider_id': plivo_call_id
                }
                
                logger.info(f"Chamada {call_id} iniciada via Plivo de {from_number} para {to_number}")
                return True, call_id
            else:
                logger.error(f"Falha ao iniciar chamada Plivo: {response.get('error')}")
                return False, ""
                
        except Exception as e:
            logger.error(f"Erro ao fazer chamada via Plivo: {e}")
            return False, ""
    
    def _make_custom_call(self, call_id: str, from_number: str, 
                         to_number: str, variables: Dict) -> Tuple[bool, str]:
        """Inicia chamada via sistema SIP personalizado"""
        # Implementação específica para seu sistema SIP
        # Este é um placeholder
        
        # Guardar informações da chamada
        self.active_calls[call_id] = {
            'from': from_number,
            'to': to_number,
            'status': 'dialing',
            'start_time': time.time(),
            'variables': variables
        }
        
        logger.info(f"Chamada {call_id} iniciada via SIP de {from_number} para {to_number}")
        return True, call_id
    
    def handle_call_transfer(self, call_id: str, destination: str) -> bool:
        """
        Transfere uma chamada ativa para outro destino.
        
        Args:
            call_id: ID da chamada a ser transferida
            destination: Número/ramal de destino
            
        Returns:
            bool: True se transferida com sucesso, False caso contrário
        """
        try:
            if not self.connected:
                logger.error("VoIP não conectado")
                return False
                
            # Verificar se a chamada existe
            if call_id not in self.active_calls:
                logger.error(f"Chamada {call_id} não encontrada")
                return False
                
            call_info = self.active_calls[call_id]
            
            if self.voip_type == 'asterisk':
                return self._transfer_asterisk_call(call_id, destination)
            elif self.voip_type == 'twilio':
                return self._transfer_twilio_call(call_id, destination)
            elif self.voip_type == 'plivo':
                return self._transfer_plivo_call(call_id, destination)
            elif self.voip_type == 'custom':
                return self._transfer_custom_call(call_id, destination)
                
            return False
            
        except Exception as e:
            logger.error(f"Erro ao transferir chamada: {e}")
            return False
    
    def _transfer_asterisk_call(self, call_id: str, destination: str) -> bool:
        """Transfere chamada via Asterisk"""
        try:
            # Obter informações da chamada
            call_info = self.active_calls[call_id]
            channel = call_info.get('channel')
            
            if not channel:
                logger.error("Canal da chamada não encontrado")
                return False
            
            # Comando para transferir chamada
            action = {
                'Action': 'Redirect',
                'Channel': channel,
                'Exten': destination,
                'Priority': 1
            }
            
            # Adicionar contexto se disponível
            context = call_info.get('variables', {}).get('context')
            if context:
                action['Context'] = context
                
            # Enviar comando
            response = self.connection.send_action(action)
            
            if response.get('Response') == 'Success':
                # Atualizar informações da chamada
                self.active_calls[call_id]['status'] = 'transferred'
                self.active_calls[call_id]['transfer_destination'] = destination
                
                logger.info(f"Chamada {call_id} transferida para {destination}")
                return True
            else:
                logger.error(f"Falha ao transferir chamada: {response.get('Message', 'Erro desconhecido')}")
                return False
                
        except Exception as e:
            logger.error(f"Erro ao transferir chamada via Asterisk: {e}")
            return False
    
    def _transfer_twilio_call(self, call_id: str, destination: str) -> bool:
        """Transfere chamada via Twilio"""
        try:
            # Obter informações da chamada
            call_info = self.active_calls[call_id]
            provider_id = call_info.get('provider_id')
            
            if not provider_id:
                logger.error("ID da chamada Twilio não encontrado")
                return False
            
            # Preparar cliente Twilio
            client = self.connection
            
            # Preparar TwiML para transferência
            twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Dial>{destination}</Dial>
            </Response>
            """
            
            # Enviar atualização para chamada
            call = client.calls(provider_id).update(
                twiml=twiml
            )
            
            # Atualizar informações da chamada
            self.active_calls[call_id]['status'] = 'transferred'
            self.active_calls[call_id]['transfer_destination'] = destination
            
            logger.info(f"Chamada {call_id} transferida para {destination}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao transferir chamada via Twilio: {e}")
            return False
    
    def _transfer_plivo_call(self, call_id: str, destination: str) -> bool:
        """Transfere chamada via Plivo"""
        try:
            # Obter informações da chamada
            call_info = self.active_calls[call_id]
            provider_id = call_info.get('provider_id')
            
            if not provider_id:
                logger.error("ID da chamada Plivo não encontrado")
                return False
            
            # Preparar cliente Plivo
            client = self.connection
            
            # Iniciar transferência (via warm transfer)
            transfer_url = self.config.get('transfer_url', '')
            if not transfer_url:
                logger.error("URL de transferência não configurada para Plivo")
                return False
                
            # Adicionar parâmetros de destino à URL
            transfer_url = f"{transfer_url}?destination={destination}"
            
            # Atualizar chamada
            response = client.calls.transfer(
                call_uuid=provider_id,
                legs='aleg',
                aleg_url=transfer_url,
                aleg_method='POST'
            )
            
            # Atualizar informações da chamada
            self.active_calls[call_id]['status'] = 'transferred'
            self.active_calls[call_id]['transfer_destination'] = destination
            
            logger.info(f"Chamada {call_id} transferida para {destination}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao transferir chamada via Plivo: {e}")
            return False
    
    def _transfer_custom_call(self, call_id: str, destination: str) -> bool:
        """Transfere chamada via sistema SIP personalizado"""
        # Implementação específica para seu sistema SIP
        # Este é um placeholder
        
        # Atualizar informações da chamada
        self.active_calls[call_id]['status'] = 'transferred'
        self.active_calls[call_id]['transfer_destination'] = destination
        
        logger.info(f"Chamada {call_id} transferida para {destination}")
        return True
    
    def hangup_call(self, call_id: str) -> bool:
        """
        Encerra uma chamada ativa.
        
        Args:
            call_id: ID da chamada a ser encerrada
            
        Returns:
            bool: True se encerrada com sucesso, False caso contrário
        """
        try:
            if not self.connected:
                logger.error("VoIP não conectado")
                return False
                
            # Verificar se a chamada existe
            if call_id not in self.active_calls:
                logger.error(f"Chamada {call_id} não encontrada")
                return False
                
            call_info = self.active_calls[call_id]
            
            if self.voip_type == 'asterisk':
                return self._hangup_asterisk_call(call_id)
            elif self.voip_type == 'twilio':
                return self._hangup_twilio_call(call_id)
            elif self.voip_type == 'plivo':
                return self._hangup_plivo_call(call_id)
            elif self.voip_type == 'custom':
                return self._hangup_custom_call(call_id)
                
            return False
            
        except Exception as e:
            logger.error(f"Erro ao encerrar chamada: {e}")
            return False
    
    def _hangup_asterisk_call(self, call_id: str) -> bool:
        """Encerra chamada via Asterisk"""
        try:
            # Obter informações da chamada
            call_info = self.active_calls[call_id]
            channel = call_info.get('channel')
            
            if not channel:
                logger.error("Canal da chamada não encontrado")
                return False
            
            # Comando para encerrar chamada
            action = {
                'Action': 'Hangup',
                'Channel': channel
            }
                
            # Enviar comando
            response = self.connection.send_action(action)
            
            if response.get('Response') == 'Success':
                # Atualizar informações da chamada
                self.active_calls[call_id]['status'] = 'completed'
                self.active_calls[call_id]['end_time'] = time.time()
                
                logger.info(f"Chamada {call_id} encerrada")
                return True
            else:
                logger.error(f"Falha ao encerrar chamada: {response.get('Message', 'Erro desconhecido')}")
                return False
                
        except Exception as e:
            logger.error(f"Erro ao encerrar chamada via Asterisk: {e}")
            return False
    
    def _hangup_twilio_call(self, call_id: str) -> bool:
        """Encerra chamada via Twilio"""
        try:
            # Obter informações da chamada
            call_info = self.active_calls[call_id]
            provider_id = call_info.get('provider_id')
            
            if not provider_id:
                logger.error("ID da chamada Twilio não encontrado")
                return False
            
            # Preparar cliente Twilio
            client = self.connection
            
            # Encerrar chamada
            call = client.calls(provider_id).update(status='completed')
            
            # Atualizar informações da chamada
            self.active_calls[call_id]['status'] = 'completed'
            self.active_calls[call_id]['end_time'] = time.time()
            
            logger.info(f"Chamada {call_id} encerrada")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao encerrar chamada via Twilio: {e}")
            return False
    
    def _hangup_plivo_call(self, call_id: str) -> bool:
        """Encerra chamada via Plivo"""
        try:
            # Obter informações da chamada
            call_info = self.active_calls[call_id]
            provider_id = call_info.get('provider_id')
            
            if not provider_id:
                logger.error("ID da chamada Plivo não encontrado")
                return False
            
            # Preparar cliente Plivo
            client = self.connection
            
            # Encerrar chamada
            response = client.calls.hangup(call_uuid=provider_id)
            
            # Atualizar informações da chamada
            self.active_calls[call_id]['status'] = 'completed'
            self.active_calls[call_id]['end_time'] = time.time()
            
            logger.info(f"Chamada {call_id} encerrada")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao encerrar chamada via Plivo: {e}")
            return False
    
    def _hangup_custom_call(self, call_id: str) -> bool:
        """Encerra chamada via sistema SIP personalizado"""
        # Implementação específica para seu sistema SIP
        # Este é um placeholder
        
        # Atualizar informações da chamada
        self.active_calls[call_id]['status'] = 'completed'
        self.active_calls[call_id]['end_time'] = time.time()
        
        logger.info(f"Chamada {call_id} encerrada")
        return True
    
    def send_dtmf(self, call_id: str, digits: str) -> bool:
        """
        Envia dígitos DTMF para uma chamada ativa.
        
        Args:
            call_id: ID da chamada
            digits: Dígitos a serem enviados (0-9, *, #)
            
        Returns:
            bool: True se enviado com sucesso, False caso contrário
        """
        try:
            if not self.connected:
                logger.error("VoIP não conectado")
                return False
                
            # Verificar se a chamada existe
            if call_id not in self.active_calls:
                logger.error(f"Chamada {call_id} não encontrada")
                return False
                
            call_info = self.active_calls[call_id]
            
            if self.voip_type == 'asterisk':
                return self._send_asterisk_dtmf(call_id, digits)
            elif self.voip_type == 'twilio':
                return self._send_twilio_dtmf(call_id, digits)
            elif self.voip_type == 'plivo':
                return self._send_plivo_dtmf(call_id, digits)
            elif self.voip_type == 'custom':
                return self._send_custom_dtmf(call_id, digits)
                
            return False
            
        except Exception as e:
            logger.error(f"Erro ao enviar DTMF: {e}")
            return False
    
    def _send_asterisk_dtmf(self, call_id: str, digits: str) -> bool:
        """Envia DTMF via Asterisk"""
        try:
            # Obter informações da chamada
            call_info = self.active_calls[call_id]
            channel = call_info.get('channel')
            
            if not channel:
                logger.error("Canal da chamada não encontrado")
                return False
            
            # Enviar cada dígito separadamente
            for digit in digits:
                # Comando para enviar DTMF
                action = {
                    'Action': 'PlayDTMF',
                    'Channel': channel,
                    'Digit': digit,
                    'Duration': 100  # ms
                }
                    
                # Enviar comando
                response = self.connection.send_action(action)
                
                if response.get('Response') != 'Success':
                    logger.error(f"Falha ao enviar DTMF: {response.get('Message', 'Erro desconhecido')}")
                    return False
                    
                # Pequena pausa entre dígitos
                time.sleep(0.1)
            
            logger.info(f"DTMF '{digits}' enviado para chamada {call_id}")
            return True
                
        except Exception as e:
            logger.error(f"Erro ao enviar DTMF via Asterisk: {e}")
            return False
    
    def _send_twilio_dtmf(self, call_id: str, digits: str) -> bool:
        """Envia DTMF via Twilio"""
        try:
            # Obter informações da chamada
            call_info = self.active_calls[call_id]
            provider_id = call_info.get('provider_id')
            
            if not provider_id:
                logger.error("ID da chamada Twilio não encontrado")
                return False
            
            # Preparar cliente Twilio
            client = self.connection
            
            # Preparar TwiML para DTMF
            # Substitua caracteres especiais por entidades XML
            safe_digits = digits.replace('#', '%23')
            
            twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Play digits="{safe_digits}"/>
            </Response>
            """
            
            # Enviar atualização para chamada
            call = client.calls(provider_id).update(
                twiml=twiml
            )
            
            logger.info(f"DTMF '{digits}' enviado para chamada {call_id}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao enviar DTMF via Twilio: {e}")
            return False
    
    def _send_plivo_dtmf(self, call_id: str, digits: str) -> bool:
        """Envia DTMF via Plivo"""
        try:
            # Obter informações da chamada
            call_info = self.active_calls[call_id]
            provider_id = call_info.get('provider_id')
            
            if not provider_id:
                logger.error("ID da chamada Plivo não encontrado")
                return False
            
            # Preparar cliente Plivo
            client = self.connection
            
            # Enviar DTMF
            response = client.calls.send_digit(
                call_uuid=provider_id,
                digits=digits
            )
            
            logger.info(f"DTMF '{digits}' enviado para chamada {call_id}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao enviar DTMF via Plivo: {e}")
            return False
    
    def _send_custom_dtmf(self, call_id: str, digits: str) -> bool:
        """Envia DTMF via sistema SIP personalizado"""
        # Implementação específica para seu sistema SIP
        # Este é um placeholder
        
        logger.info(f"DTMF '{digits}' enviado para chamada {call_id}")
        return True
    
    def get_call_status(self, call_id: str) -> Dict:
        """
        Obtém o status atual de uma chamada.
        
        Args:
            call_id: ID da chamada
            
        Returns:
            Dict: Informações da chamada
        """
        try:
            if call_id not in self.active_calls:
                logger.error(f"Chamada {call_id} não encontrada")
                return {'status': 'unknown'}
                
            call_info = self.active_calls[call_id]
            
            # Tentar obter status atualizado do provedor
            if self.voip_type == 'asterisk':
                return self._get_asterisk_call_status(call_id)
            elif self.voip_type == 'twilio':
                return self._get_twilio_call_status(call_id)
            elif self.voip_type == 'plivo':
                return self._get_plivo_call_status(call_id)
            
            # Retornar informações locais
            return call_info
            
        except Exception as e:
            logger.error(f"Erro ao obter status da chamada: {e}")
            return {'status': 'error', 'error': str(e)}
    
    def _get_asterisk_call_status(self, call_id: str) -> Dict:
        """Obtém status da chamada via Asterisk"""
        try:
            # Obter informações da chamada
            call_info = self.active_calls[call_id]
            channel = call_info.get('channel')
            
            if not channel:
                logger.error("Canal da chamada não encontrado")
                return call_info
            
            # Comando para obter status
            action = {
                'Action': 'CoreShowChannel',
                'Channel': channel
            }
                
            # Enviar comando
            response = self.connection.send_action(action)
            
            if response.get('Response') == 'Success':
                # Atualizar informações da chamada
                call_info['channel_state'] = response.get('ChannelState')
                call_info['channel_state_desc'] = response.get('ChannelStateDesc')
                
                # Mapear estado do canal para status da chamada
                state_desc = response.get('ChannelStateDesc', '').lower()
                if 'up' in state_desc:
                    call_info['status'] = 'in-progress'
                elif 'ring' in state_desc:
                    call_info['status'] = 'ringing'
                elif 'down' in state_desc or not state_desc:
                    call_info['status'] = 'completed'
                    call_info['end_time'] = time.time()
            
            return call_info
                
        except Exception as e:
            logger.error(f"Erro ao obter status via Asterisk: {e}")
            return self.active_calls[call_id]
    
    def _get_twilio_call_status(self, call_id: str) -> Dict:
        """Obtém status da chamada via Twilio"""
        try:
            # Obter informações da chamada
            call_info = self.active_calls[call_id]
            provider_id = call_info.get('provider_id')
            
            if not provider_id:
                logger.error("ID da chamada Twilio não encontrado")
                return call_info
            
            # Preparar cliente Twilio
            client = self.connection
            
            # Obter status atual
            call = client.calls(provider_id).fetch()
            
            # Atualizar informações locais
            call_info['status'] = call.status
            
            if call.status in ['completed', 'failed', 'canceled', 'busy']:
                call_info['end_time'] = time.time()
                
            return call_info
            
        except Exception as e:
            logger.error(f"Erro ao obter status via Twilio: {e}")
            return self.active_calls[call_id]
    
    def _get_plivo_call_status(self, call_id: str) -> Dict:
        """Obtém status da chamada via Plivo"""
        try:
            # Obter informações da chamada
            call_info = self.active_calls[call_id]
            provider_id = call_info.get('provider_id')
            
            if not provider_id:
                logger.error("ID da chamada Plivo não encontrado")
                return call_info
            
            # Preparar cliente Plivo
            client = self.connection
            
            # Obter status atual
            response = client.calls.get(provider_id)
            
            # Atualizar informações locais
            call_info['status'] = response.get('status', call_info['status'])
            
            if response.get('status') in ['completed', 'failed', 'busy']:
                call_info['end_time'] = time.time()
                
            return call_info
            
        except Exception as e:
            logger.error(f"Erro ao obter status via Plivo: {e}")
            return self.active_calls[call_id]
    
    def play_audio(self, call_id: str, audio_file: str) -> bool:
        """
        Reproduz um arquivo de áudio durante uma chamada.
        
        Args:
            call_id: ID da chamada
            audio_file: Caminho para o arquivo de áudio
            
        Returns:
            bool: True se reproduzido com sucesso, False caso contrário
        """
        try:
            if not self.connected:
                logger.error("VoIP não conectado")
                return False
                
            # Verificar se a chamada existe
            if call_id not in self.active_calls:
                logger.error(f"Chamada {call_id} não encontrada")
                return False
                
            # Verificar se o arquivo existe
            if not os.path.exists(audio_file):
                logger.error(f"Arquivo de áudio não encontrado: {audio_file}")
                return False
                
            call_info = self.active_calls[call_id]
            
            if self.voip_type == 'asterisk':
                return self._play_asterisk_audio(call_id, audio_file)
            elif self.voip_type == 'twilio':
                return self._play_twilio_audio(call_id, audio_file)
            elif self.voip_type == 'plivo':
                return self._play_plivo_audio(call_id, audio_file)
            elif self.voip_type == 'custom':
                return self._play_custom_audio(call_id, audio_file)
                
            return False
            
        except Exception as e:
            logger.error(f"Erro ao reproduzir áudio: {e}")
            return False
    
    def _play_asterisk_audio(self, call_id: str, audio_file: str) -> bool:
        """Reproduz áudio via Asterisk"""
        try:
            # Obter informações da chamada
            call_info = self.active_calls[call_id]
            channel = call_info.get('channel')
            
            if not channel:
                logger.error("Canal da chamada não encontrado")
                return False
            
            # Comando para reproduzir áudio
            action = {
                'Action': 'Playback',
                'Channel': channel,
                'File': os.path.splitext(audio_file)[0]  # Remover extensão
            }
                
            # Enviar comando
            response = self.connection.send_action(action)
            
            if response.get('Response') == 'Success':
                logger.info(f"Reproduzindo áudio para chamada {call_id}")
                return True
            else:
                logger.error(f"Falha ao reproduzir áudio: {response.get('Message', 'Erro desconhecido')}")
                return False
                
        except Exception as e:
            logger.error(f"Erro ao reproduzir áudio via Asterisk: {e}")
            return False
    
    def _play_twilio_audio(self, call_id: str, audio_file: str) -> bool:
        """Reproduz áudio via Twilio"""
        try:
            # Obter informações da chamada
            call_info = self.active_calls[call_id]
            provider_id = call_info.get('provider_id')
            
            if not provider_id:
                logger.error("ID da chamada Twilio não encontrado")
                return False
            
            # Preparar cliente Twilio
            client = self.connection
            
            # Verificar se temos URL para o arquivo
            audio_url = self.config.get('media_base_url')
            if not audio_url:
                logger.error("URL base para mídia não configurada")
                return False
                
            # Construir URL completa
            file_name = os.path.basename(audio_file)
            audio_url = f"{audio_url}/{file_name}"
            
            # Preparar TwiML para reprodução
            twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Play>{audio_url}</Play>
            </Response>
            """
            
            # Enviar atualização para chamada
            call = client.calls(provider_id).update(
                twiml=twiml
            )
            
            logger.info(f"Reproduzindo áudio para chamada {call_id}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao reproduzir áudio via Twilio: {e}")
            return False
    
    def _play_plivo_audio(self, call_id: str, audio_file: str) -> bool:
        """Reproduz áudio via Plivo"""
        try:
            # Obter informações da chamada
            call_info = self.active_calls[call_id]
            provider_id = call_info.get('provider_id')
            
            if not provider_id:
                logger.error("ID da chamada Plivo não encontrado")
                return False
            
            # Preparar cliente Plivo
            client = self.connection
            
            # Verificar se temos URL para o arquivo
            audio_url = self.config.get('media_base_url')
            if not audio_url:
                logger.error("URL base para mídia não configurada")
                return False
                
            # Construir URL completa
            file_name = os.path.basename(audio_file)
            audio_url = f"{audio_url}/{file_name}"
            
            # Enviar comando de reprodução
            response = client.calls.play(
                call_uuid=provider_id,
                url=audio_url
            )
            
            logger.info(f"Reproduzindo áudio para chamada {call_id}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao reproduzir áudio via Plivo: {e}")
            return False
    
    def _play_custom_audio(self, call_id: str, audio_file: str) -> bool:
        """Reproduz áudio via sistema SIP personalizado"""
        # Implementação específica para seu sistema SIP
        # Este é um placeholder
        
        logger.info(f"Reproduzindo áudio para chamada {call_id}")
        return True
    
    def _on_asterisk_hangup(self, event):
        """Manipulador de evento de desligamento de chamada Asterisk"""
        try:
            # Procurar chamada pelo canal
            channel = event.get('Channel')
            if not channel:
                return
                
            # Encontrar chamada correspondente
            for call_id, call_info in self.active_calls.items():
                if call_info.get('channel') == channel:
                    # Atualizar status
                    call_info['status'] = 'completed'
                    call_info['end_time'] = time.time()
                    call_info['cause'] = event.get('Cause')
                    call_info['cause_txt'] = event.get('Cause-txt')
                    
                    # Enviar webhook se configurado
                    self._send_webhook(call_id, 'hangup', call_info)
                    
                    logger.info(f"Chamada {call_id} encerrada: {event.get('Cause-txt')}")
                    break
        except Exception as e:
            logger.error(f"Erro ao processar evento de desligamento: {e}")
    
    def _on_asterisk_dial_begin(self, event):
        """Manipulador de evento de início de discagem Asterisk"""
        pass
    
    def _on_asterisk_dial_end(self, event):
        """Manipulador de evento de fim de discagem Asterisk"""
        pass
    
    def _send_webhook(self, call_id: str, event_type: str, data: Dict):
        """Envia webhook para callback configurado"""
        try:
            # Verificar se temos URL de callback
            callback_url = self.call_callbacks.get(call_id)
            if not callback_url:
                return
                
            # Preparar payload
            payload = {
                'call_id': call_id,
                'event': event_type,
                'timestamp': time.time(),
                'data': data
            }
            
            # Enviar requisição
            requests.post(
                callback_url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            
        except Exception as e:
            logger.error(f"Erro ao enviar webhook: {e}")
    
    def _start_monitor(self):
        """Inicia thread de monitoramento de chamadas"""
        if self.monitor_thread and self.monitor_thread.is_alive():
            return
            
        self.monitor_thread = threading.Thread(
            target=self._monitor_loop,
            daemon=True
        )
        self.monitor_thread.start()
    
    def _monitor_loop(self):
        """Loop de monitoramento de chamadas"""
        while self.connected:
            try:
                # Verificar chamadas ativas
                current_time = time.time()
                calls_to_remove = []
                
                for call_id, call_info in self.active_calls.items():
                    # Verificar status para chamadas antigas
                    if call_info['status'] == 'completed' and \
                       current_time - call_info.get('end_time', 0) > 300:  # 5 minutos
                        calls_to_remove.append(call_id)
                        continue
                        
                    # Atualizar status de chamadas em andamento
                    if call_info['status'] not in ['completed', 'failed', 'busy']:
                        # Tentar atualizar status
                        self.get_call_status(call_id)
                
                # Remover chamadas antigas
                for call_id in calls_to_remove:
                    del self.active_calls[call_id]
                    
                # Dormir
                time.sleep(10)
                
            except Exception as e:
                logger.error(f"Erro no monitoramento: {e}")
                time.sleep(5)
    
    def close(self):
        """Encerra conexão com o servidor VoIP"""
        try:
            self.connected = False
            
            if self.voip_type == 'asterisk' and self.connection:
                self.connection.logoff()
                self.connection.close()
                
            self.connection = None
            self.status = "disconnected"
            
            logger.info("Conexão VoIP encerrada")
            
        except Exception as e:
            logger.error(f"Erro ao encerrar conexão: {e}")
