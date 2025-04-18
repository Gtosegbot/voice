# backend/services/voicemail_detector.py
import os
import time
import tempfile
import logging
import threading
import numpy as np
from typing import Dict, List, Optional, Union
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VoicemailDetector:
    """
    Detector de caixa postal que utiliza reconhecimento de fala e
    análise de padrões para identificar mensagens de caixa postal.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        """
        Inicializa o detector de caixa postal.
        
        Args:
            config: Configurações opcionais
        """
        self.config = config or {}
        self.temp_dir = self.config.get('temp_dir', tempfile.gettempdir())
        
        # Frases comuns de caixa postal em diferentes idiomas
        self.voicemail_phrases = {
            'pt-BR': [
                "deixe seu recado",
                "após o sinal",
                "caixa postal",
                "não posso atender",
                "deixe uma mensagem",
                "grave sua mensagem",
                "no momento não posso",
                "sinal sonoro",
                "não estou disponível"
            ],
            'en-US': [
                "leave a message",
                "leave your message",
                "not available",
                "after the tone",
                "at the beep",
                "voicemail",
                "voice mailbox",
                "call you back",
                "unable to take your call"
            ],
            'es-ES': [
                "deje su mensaje",
                "no está disponible",
                "después del tono",
                "buzón de voz",
                "no puedo atender",
                "grabe su mensaje"
            ]
        }
        
        # Padrões de áudio típicos de caixa postal
        self.audio_patterns = {
            'beep': {
                'min_freq': 900,
                'max_freq': 1100,
                'min_duration': 0.5,
                'max_duration': 2.0
            },
            'silence_before_beep': {
                'min_duration': 0.8,
                'max_volume': 0.1
            }
        }
        
        # Modelo de machine learning (carregado sob demanda)
        self.ai_model = None
        self.use_ai = self.config.get('use_ai', True)
        self.ai_model_path = self.config.get('ai_model_path', '')
        self.ai_threshold = self.config.get('ai_threshold', 0.75)
        
        # Estatísticas e cache
        self.stats = {
            'total_analyzed': 0,
            'voicemail_detected': 0,
            'text_based_detection': 0,
            'audio_based_detection': 0,
            'ai_based_detection': 0
        }
        self.cache = {}
        
        # Thread para análise em segundo plano
        self.analysis_thread = None
        self.analysis_queue = []
        self.queue_lock = threading.Lock()
    
    def analyze_audio_stream(self, audio_stream: Union[str, bytes], 
                            language: str = "pt-BR",
                            callback: Optional[callable] = None) -> Dict:
        """
        Analisa um stream de áudio para detectar padrões de caixa postal.
        Pode ser executado de forma síncrona ou assíncrona com callback.
        
        Args:
            audio_stream: Arquivo de áudio ou dados de áudio em bytes
            language: Código do idioma para reconhecimento de fala
            callback: Função opcional para receber resultado de forma assíncrona
            
        Returns:
            Dict: Resultado da análise
        """
        # Se fornecido um callback, executar análise em background
        if callback:
            return self._queue_analysis(audio_stream, language, callback)
            
        # Análise síncrona
        result = {
            'is_voicemail': False,
            'confidence': 0.0,
            'method': None,
            'text': None,
            'analysis_time': 0
        }
        
        start_time = time.time()
        
        try:
            # Verificar cache
            if isinstance(audio_stream, str) and os.path.exists(audio_stream):
                file_hash = self._get_file_hash(audio_stream)
                if file_hash in self.cache:
                    result = self.cache[file_hash].copy()
                    result['from_cache'] = True
                    return result
            
            # Converter stream de áudio para formato adequado se necessário
            audio_file = self._prepare_audio_file(audio_stream)
            
            # Executar três métodos de detecção em paralelo para maior precisão
            text_result = self._analyze_text(audio_file, language)
            audio_result = self._analyze_audio_patterns(audio_file)
            ai_result = self._analyze_with_ai(audio_file, language) if self.use_ai else {'is_voicemail': False, 'confidence': 0.0}
            
            # Combinar resultados (estratégia de votação ponderada)
            is_voicemail = False
            confidence = 0.0
            method = None
            
            # Se qualquer método tiver alta confiança, considerar como caixa postal
            if text_result['is_voicemail'] and text_result['confidence'] > 0.8:
                is_voicemail = True
                confidence = text_result['confidence']
                method = 'text'
                self.stats['text_based_detection'] += 1
            elif audio_result['is_voicemail'] and audio_result['confidence'] > 0.85:
                is_voicemail = True
                confidence = audio_result['confidence']
                method = 'audio'
                self.stats['audio_based_detection'] += 1
            elif ai_result['is_voicemail'] and ai_result['confidence'] > self.ai_threshold:
                is_voicemail = True
                confidence = ai_result['confidence']
                method = 'ai'
                self.stats['ai_based_detection'] += 1
            else:
                # Combinar pontuações se nenhum método for altamente confiante
                weighted_sum = (
                    text_result['confidence'] * 0.3 + 
                    audio_result['confidence'] * 0.3 + 
                    ai_result['confidence'] * 0.4
                )
                
                if weighted_sum > 0.65:
                    is_voicemail = True
                    confidence = weighted_sum
                    method = 'combined'
                
            # Atualizar resultado
            result = {
                'is_voicemail': is_voicemail,
                'confidence': confidence,
                'method': method,
                'text': text_result.get('text'),
                'details': {
                    'text_analysis': text_result,
                    'audio_analysis': audio_result,
                    'ai_analysis': ai_result
                }
            }
            
            # Atualizar estatísticas
            self.stats['total_analyzed'] += 1
            if is_voicemail:
                self.stats['voicemail_detected'] += 1
            
            # Armazenar em cache se for arquivo
            if isinstance(audio_stream, str) and os.path.exists(audio_stream):
                file_hash = self._get_file_hash(audio_stream)
                self.cache[file_hash] = result.copy()
                
            # Limpar arquivos temporários
            self._cleanup_temp_files(audio_file)
            
        except Exception as e:
            logger.error(f"Erro na análise de caixa postal: {str(e)}")
            result['error'] = str(e)
        
        # Adicionar tempo de análise
        result['analysis_time'] = time.time() - start_time
        
        return result
    
    def _queue_analysis(self, audio_stream, language, callback):
        """Enfileira uma análise para processamento em background"""
        try:
            with self.queue_lock:
                # Criar ID para este trabalho
                job_id = f"job_{int(time.time())}_{hash(str(audio_stream)) % 10000}"
                
                # Adicionar à fila
                self.analysis_queue.append({
                    'id': job_id,
                    'audio_stream': audio_stream,
                    'language': language,
                    'callback': callback,
                    'queued_at': time.time()
                })
                
                # Iniciar thread de análise se não estiver em execução
                if not self.analysis_thread or not self.analysis_thread.is_alive():
                    self.analysis_thread = threading.Thread(
                        target=self._process_analysis_queue,
                        daemon=True
                    )
                    self.analysis_thread.start()
                
                return {
                    'status': 'queued',
                    'job_id': job_id,
                    'queue_position': len(self.analysis_queue)
                }
                
        except Exception as e:
            logger.error(f"Erro ao enfileirar análise: {str(e)}")
            # Tenta executar callback com erro
            if callback:
                try:
                    callback({
                        'is_voicemail': False,
                        'error': str(e),
                        'status': 'error'
                    })
                except:
                    pass
            
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def _process_analysis_queue(self):
        """Processa itens na fila de análise"""
        while True:
            try:
                # Obter próximo item da fila
                job = None
                with self.queue_lock:
                    if self.analysis_queue:
                        job = self.analysis_queue.pop(0)
                    
                if not job:
                    # Fila vazia, sair do loop
                    break
                
                # Processar item
                try:
                    result = self.analyze_audio_stream(
                        job['audio_stream'],
                        job['language']
                    )
                    
                    # Adicionar informações do trabalho
                    result['job_id'] = job['id']
                    result['queue_time'] = time.time() - job['queued_at']
                    result['status'] = 'completed'
                    
                    # Chamar callback
                    if job['callback']:
                        job['callback'](result)
                        
                except Exception as e:
                    logger.error(f"Erro ao processar job {job['id']}: {str(e)}")
                    if job['callback']:
                        job['callback']({
                            'is_voicemail': False,
                            'error': str(e),
                            'status': 'error',
                            'job_id': job['id']
                        })
                
            except Exception as e:
                logger.error(f"Erro na thread de análise: {str(e)}")
                time.sleep(1)
    
    def _prepare_audio_file(self, audio_stream):
        """Prepara o arquivo de áudio para análise"""
        try:
            # Se já for um caminho de arquivo, retornar diretamente
            if isinstance(audio_stream, str) and os.path.exists(audio_stream):
                return audio_stream
                
            # Se for bytes, salvar em arquivo temporário
            if isinstance(audio_stream, bytes):
                temp_file = os.path.join(self.temp_dir, f"temp_audio_{int(time.time())}.wav")
                with open(temp_file, 'wb') as f:
                    f.write(audio_stream)
                return temp_file
            
            # Verificar outros formatos
            raise ValueError("Formato de áudio não suportado")
            
        except Exception as e:
            logger.error(f"Erro ao preparar arquivo de áudio: {str(e)}")
            raise
    
    def _analyze_text(self, audio_file, language="pt-BR"):
        """Analisa o texto transcrito do áudio para detectar frases de caixa postal"""
        try:
            result = {
                'is_voicemail': False,
                'confidence': 0.0,
                'text': None,
                'matched_phrases': []
            }
            
            # Verificar se temos frases para este idioma
            if language not in self.voicemail_phrases:
                language = 'en-US'  # fallback para inglês
            
            phrases = self.voicemail_phrases[language]
            
            # Usar reconhecimento de fala para obter texto
            text = self._speech_to_text(audio_file, language)
            if not text:
                return result
                
            # Armazenar texto para debug
            result['text'] = text
            text = text.lower()
            
            # Verificar frases de caixa postal
            matches = []
            for phrase in phrases:
                if phrase.lower() in text:
                    matches.append(phrase)
            
            if matches:
                # Calcular confiança baseada no número de correspondências
                confidence = min(0.5 + (len(matches) * 0.15), 0.95)
                
                result['is_voicemail'] = True
                result['confidence'] = confidence
                result['matched_phrases'] = matches
            
            return result
            
        except Exception as e:
            logger.error(f"Erro na análise de texto: {str(e)}")
            return {
                'is_voicemail': False,
                'confidence': 0.0,
                'error': str(e)
            }
    
    def _analyze_audio_patterns(self, audio_file):
        """Analisa padrões de áudio para detectar características típicas de caixa postal"""
        try:
            result = {
                'is_voicemail': False,
                'confidence': 0.0,
                'patterns_found': []
            }
            
            # Carregar áudio para análise espectral
            audio_data = self._load_audio(audio_file)
            if audio_data is None:
                return result
                
            # Analisar para bipe característico
            beep_result = self._detect_beep(audio_data)
            
            # Analisar padrão de silêncio antes do bipe
            silence_result = self._detect_silence_pattern(audio_data)
            
            # Analisar ritmo da fala (caixa postal geralmente tem cadência específica)
            speech_rhythm = self._analyze_speech_rhythm(audio_data)
            
            # Analisar quantidade de locutor (caixa postal geralmente tem apenas um)
            speaker_count = self._estimate_speaker_count(audio_data)
            
            # Análise de repetições (mensagens de caixa postal geralmente são padronizadas)
            repetition_score = self._analyze_repetition_patterns(audio_data)
            
            # Combinar resultados
            patterns_found = []
            confidence_sum = 0.0
            
            if beep_result['found']:
                patterns_found.append('beep')
                confidence_sum += beep_result['confidence'] * 0.4  # peso alto
            
            if silence_result['found']:
                patterns_found.append('silence_pattern')
                confidence_sum += silence_result['confidence'] * 0.3
            
            if speech_rhythm['matches_voicemail']:
                patterns_found.append('speech_rhythm')
                confidence_sum += speech_rhythm['confidence'] * 0.1
            
            if speaker_count['count'] == 1:
                patterns_found.append('single_speaker')
                confidence_sum += 0.1
            
            if repetition_score > 0.6:
                patterns_found.append('repetition_patterns')
                confidence_sum += repetition_score * 0.1
                
            # Normalizar confiança
            confidence = min(confidence_sum, 0.95)
            
            # Atualizar resultado
            result['is_voicemail'] = confidence > 0.6
            result['confidence'] = confidence
            result['patterns_found'] = patterns_found
            result['details'] = {
                'beep': beep_result,
                'silence': silence_result,
                'rhythm': speech_rhythm,
                'speakers': speaker_count,
                'repetition': repetition_score
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Erro na análise de padrões de áudio: {str(e)}")
            return {
                'is_voicemail': False,
                'confidence': 0.0,
                'error': str(e)
            }
    
    def _analyze_with_ai(self, audio_file, language="pt-BR"):
        """Analisa o áudio usando modelo de IA para detecção de caixa postal"""
        try:
            result = {
                'is_voicemail': False,
                'confidence': 0.0
            }
            
            # Verificar se modelo está disponível
            model = self._load_ai_model()
            if not model:
                return result
                
            # Preparar características do áudio
            features = self._extract_audio_features(audio_file)
            if not features:
                return result
                
            # Fazer predição
            prediction = model.predict(features)
            
            # Interpretar resultado
            if hasattr(prediction, 'shape') and prediction.shape[1] > 1:
                # Modelo com múltiplas classes
                confidence = float(prediction[0][1])  # índice 1 para classe "voicemail"
            else:
                # Modelo binário
                confidence = float(prediction[0])
                
            result['is_voicemail'] = confidence > self.ai_threshold
            result['confidence'] = confidence
            
            return result
            
        except Exception as e:
            logger.error(f"Erro na análise com IA: {str(e)}")
            return {
                'is_voicemail': False,
                'confidence': 0.0,
                'error': str(e)
            }
    
    def _speech_to_text(self, audio_file, language="pt-BR"):
        """Converte áudio para texto usando reconhecimento de fala"""
        try:
            # Tentativa com Google Speech Recognition (online)
            try:
                import speech_recognition as sr
                recognizer = sr.Recognizer()
                
                with sr.AudioFile(audio_file) as source:
                    audio_data = recognizer.record(source)
                    text = recognizer.recognize_google(audio_data, language=language)
                    return text
            except Exception as e:
                logger.warning(f"Falha no Google Speech Recognition: {str(e)}")
            
            # Tentativa com Whisper (offline)
            try:
                # Importar sob demanda para não obrigar instalação se não usar
                import subprocess
                
                # Verificar se está instalado, se não, instalar
                try:
                    import whisper
                except ImportError:
                    logger.info("Instalando OpenAI Whisper para reconhecimento offline...")
                    subprocess.check_call(['pip', 'install', 'openai-whisper'])
                    import whisper
                
                # Carregar modelo pequeno para velocidade
                model = whisper.load_model("base")
                
                # Transcrever
                result = model.transcribe(audio_file, language=language.split('-')[0])
                return result["text"]
                
            except Exception as e:
                logger.warning(f"Falha no Whisper: {str(e)}")
            
            # Se todas as tentativas falharem
            logger.error("Todas as tentativas de reconhecimento de fala falharam")
            return None
            
        except Exception as e:
            logger.error(f"Erro no reconhecimento de fala: {str(e)}")
            return None
    
    def _load_audio(self, audio_file):
        """Carrega dados de áudio para análise"""
        try:
            # Tentar diferentes bibliotecas, dependendo do que está disponível
            
            # Tentativa com librosa (boa para análise)
            try:
                import librosa
                audio_data, sample_rate = librosa.load(audio_file, sr=None)
                return {
                    'data': audio_data,
                    'sample_rate': sample_rate,
                    'duration': librosa.get_duration(y=audio_data, sr=sample_rate)
                }
            except Exception as e:
                logger.warning(f"Falha ao carregar com librosa: {str(e)}")
            
            # Tentativa com scipy
            try:
                from scipy.io import wavfile
                sample_rate, audio_data = wavfile.read(audio_file)
                
                # Converter para float se for int
                if audio_data.dtype.kind == 'i':
                    audio_data = audio_data.astype(np.float32) / np.iinfo(audio_data.dtype).max
                
                return {
                    'data': audio_data,
                    'sample_rate': sample_rate,
                    'duration': len(audio_data) / sample_rate
                }
            except Exception as e:
                logger.warning(f"Falha ao carregar com scipy: {str(e)}")
            
            # Tentativa com pydub
            try:
                from pydub import AudioSegment
                
                audio = AudioSegment.from_file(audio_file)
                samples = np.array(audio.get_array_of_samples())
                
                # Converter para float
                samples = samples.astype(np.float32) / np.iinfo(samples.dtype).max
                
                # Se estéreo, converter para mono
                if audio.channels == 2:
                    samples = samples.reshape((-1, 2)).mean(axis=1)
                
                return {
                    'data': samples,
                    'sample_rate': audio.frame_rate,
                    'duration': audio.duration_seconds
                }
            except Exception as e:
                logger.warning(f"Falha ao carregar com pydub: {str(e)}")
            
            # Se todas as tentativas falharem
            logger.error("Todas as tentativas de carregar áudio falharam")
            return None
            
        except Exception as e:
            logger.error(f"Erro ao carregar áudio: {str(e)}")
            return None
    
    def _detect_beep(self, audio_data):
        """Detecta bipe característico de caixa postal"""
        try:
            result = {
                'found': False,
                'confidence': 0.0,
                'timestamp': None
            }
            
            if not audio_data or 'data' not in audio_data:
                return result
            
            # Analisar espectro de frequência
            try:
                import scipy.signal as signal
                import numpy as np
                
                # Parâmetros
                beep_min_freq = self.audio_patterns['beep']['min_freq']
                beep_max_freq = self.audio_patterns['beep']['max_freq']
                min_duration = self.audio_patterns['beep']['min_duration']
                max_duration = self.audio_patterns['beep']['max_duration']
                
                # Calcular espectrograma
                f, t, Sxx = signal.spectrogram(
                    audio_data['data'], 
                    audio_data['sample_rate'],
                    nperseg=1024
                )
                
                # Encontrar índices de frequência dentro da faixa do bipe
                freq_indices = np.where((f >= beep_min_freq) & (f <= beep_max_freq))[0]
                
                if len(freq_indices) == 0:
                    return result
                    
                # Extrair potência nesta faixa de frequência
                beep_power = np.sum(Sxx[freq_indices, :], axis=0)
                
                # Normalizar
                beep_power = beep_power / np.max(beep_power)
                
                # Encontrar regiões com alta energia nesta faixa
                threshold = 0.7
                above_threshold = beep_power > threshold
                
                # Encontrar regiões contínuas (possíveis bipes)
                from scipy.ndimage import label
                labeled_regions, num_regions = label(above_threshold)
                
                beep_found = False
                beep_time = None
                beep_conf = 0.0
                
                # Verificar cada região
                for region_idx in range(1, num_regions + 1):
                    region_indices = np.where(labeled_regions == region_idx)[0]
                    region_duration = (region_indices[-1] - region_indices[0]) * (t[1] - t[0])
                    
                    # Verificar se a duração está dentro dos limites esperados
                    if min_duration <= region_duration <= max_duration:
                        region_start_time = t[region_indices[0]]
                        region_max_power = np.max(beep_power[region_indices])
                        
                        # Calcular confiança baseada na potência e duração
                        duration_factor = 1.0 - abs((region_duration - 1.0) / max_duration)
                        power_factor = region_max_power
                        
                        confidence = 0.7 * power_factor + 0.3 * duration_factor
                        
                        if confidence > beep_conf:
                            beep_found = True
                            beep_time = region_start_time
                            beep_conf = confidence
                
                result['found'] = beep_found
                result['confidence'] = beep_conf
                result['timestamp'] = beep_time
                
                return result
                
            except Exception as e:
                logger.warning(f"Falha na análise espectral: {str(e)}")
                return result
                
        except Exception as e:
            logger.error(f"Erro ao detectar bipe: {str(e)}")
            return {
                'found': False,
                'confidence': 0.0,
                'error': str(e)
            }
    
    def _detect_silence_pattern(self, audio_data):
        """Detecta padrão de silêncio característico antes do bipe"""
        try:
            result = {
                'found': False,
                'confidence': 0.0,
                'timestamps': []
            }
            
            if not audio_data or 'data' not in audio_data:
                return result
                
            # Configurações
            min_silence_duration = self.audio_patterns['silence_before_beep']['min_duration']
            max_volume = self.audio_patterns['silence_before_beep']['max_volume']
            
            # Calcular envelope do sinal
            try:
                import numpy as np
                from scipy.signal import hilbert
                
                # Calcular envelope
                analytic_signal = hilbert(audio_data['data'])
                amplitude_envelope = np.abs(analytic_signal)
                
                # Normalizar
                amplitude_envelope = amplitude_envelope / np.max(amplitude_envelope)
                
                # Identificar regiões de silêncio
                silence_mask = amplitude_envelope < max_volume
                
                # Encontrar regiões contínuas
                from scipy.ndimage import label
                labeled_regions, num_regions = label(silence_mask)
                
                # Tempo por amostra
                time_per_sample = 1.0 / audio_data['sample_rate']
                
                # Verificar cada região
                silence_regions = []
                
                for region_idx in range(1, num_regions + 1):
                    region_indices = np.where(labeled_regions == region_idx)[0]
                    region_duration = len(region_indices) * time_per_sample
                    
                    # Verificar se a duração é suficiente
                    if region_duration >= min_silence_duration:
                        region_start = region_indices[0] * time_per_sample
                        region_end = region_indices[-1] * time_per_sample
                        
                        silence_regions.append({
                            'start': region_start,
                            'end': region_end,
                            'duration': region_duration
                        })
                
                # Avaliar se encontramos silêncios significativos
                if silence_regions:
                    # Ordenar por duração
                    silence_regions.sort(key=lambda x: x['duration'], reverse=True)
                    
                    # Calcular confiança baseada na duração do maior silêncio
                    best_duration = silence_regions[0]['duration']
                    confidence = min(0.5 + (best_duration - min_silence_duration) * 0.5, 0.9)
                    
                    result['found'] = True
                    result['confidence'] = confidence
                    result['timestamps'] = [(r['start'], r['end']) for r in silence_regions[:3]]
                
                return result
                
            except Exception as e:
                logger.warning(f"Falha na análise de silêncio: {str(e)}")
                return result
                
        except Exception as e:
            logger.error(f"Erro ao detectar padrão de silêncio: {str(e)}")
            return {
                'found': False,
                'confidence': 0.0,
                'error': str(e)
            }
    
    def _analyze_speech_rhythm(self, audio_data):
        """Analisa o ritmo da fala para características de mensagem automática"""
        # Esta é uma análise simplificada do ritmo
        try:
            result = {
                'matches_voicemail': False,
                'confidence': 0.0
            }
            
            if not audio_data or 'data' not in audio_data:
                return result
                
            # Implementação simplificada - em produção seria mais sofisticado
            confidence = 0.5  # valor neutro
            
            result['matches_voicemail'] = confidence > 0.6
            result['confidence'] = confidence
            
            return result
            
        except Exception as e:
            logger.error(f"Erro ao analisar ritmo da fala: {str(e)}")
            return {
                'matches_voicemail': False,
                'confidence': 0.0,
                'error': str(e)
            }
    
    def _estimate_speaker_count(self, audio_data):
        """Estima quantos locutores diferentes estão no áudio"""
        # Esta seria uma análise mais complexa em produção
        try:
            result = {
                'count': 1,
                'confidence': 0.5
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Erro ao estimar locutores: {str(e)}")
            return {
                'count': 0,
                'confidence': 0.0,
                'error': str(e)
            }
    
    def _analyze_repetition_patterns(self, audio_data):
        """Analisa padrões de repetição no áudio"""
        # Simplificado
        return 0.5  # valor neutro
    
    def _load_ai_model(self):
        """Carrega modelo de IA para detecção de caixa postal"""
        if not self.use_ai:
            return None
            
        # Se já carregado, retornar
        if self.ai_model:
            return self.ai_model
            
        try:
            # Tentar carregar modelo local se caminho fornecido
            if self.ai_model_path and os.path.exists(self.ai_model_path):
                import joblib
                self.ai_model = joblib.load(self.ai_model_path)
                return self.ai_model
                
            # Ou usar inferência com modelo remoto via API (Hugging Face)
            # Este é um placeholder para uma implementação real
            self.ai_model = self._create_huggingface_model()
            return self.ai_model
            
        except Exception as e:
            logger.error(f"Erro ao carregar modelo de IA: {str(e)}")
            return None
    
    def _create_huggingface_model(self):
        """Cria proxy para modelo Hugging Face"""
        # Placeholder para implementação real
        class HuggingFaceModelProxy:
            def __init__(self):
                self.api_token = os.environ.get('HUGGINGFACE_API_TOKEN', '')
                self.model_id = "your-username/voicemail-detector"  # modelo exemplo
                
            def predict(self, features):
                # Simulação - em produção, faria chamada real à API
                import numpy as np
                # Retornar valor aleatório entre 0.3 e 0.7
                return np.array([[np.random.uniform(0.3, 0.7)]])
        
        return HuggingFaceModelProxy()
    
    def _extract_audio_features(self, audio_file):
        """Extrai características do áudio para alimentar modelo de ML"""
        try:
            # Esta é uma implementação simplificada
            # Em produção, extrairia MFCCs, chroma, contraste espectral, etc.
            
            # Carregar áudio
            audio_data = self._load_audio(audio_file)
            if not audio_data:
                return None
                
            # Exemplo muito simplificado
            import numpy as np
            
            # Em produção, extrairia características mais sofisticadas
            return np.array([[
                audio_data['duration'],              # duração
                np.mean(np.abs(audio_data['data'])),  # volume médio
                np.std(audio_data['data']),          # desvio padrão
                np.max(np.abs(audio_data['data']))   # pico
            ]])
            
        except Exception as e:
            logger.error(f"Erro ao extrair características: {str(e)}")
            return None
    
    def _get_file_hash(self, file_path):
        """Calcula hash do arquivo para cache"""
        try:
            import hashlib
            
            # Calcular hash MD5 do arquivo
            hash_md5 = hashlib.md5()
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_md5.update(chunk)
                    
            return hash_md5.hexdigest()
            
        except Exception as e:
            logger.error(f"Erro ao calcular hash: {str(e)}")
            return str(hash(file_path))
    
    def _cleanup_temp_files(self, file_path):
        """Remove arquivos temporários"""
        try:
            # Verificar se é arquivo temporário (está no diretório temp)
            if file_path and isinstance(file_path, str) and os.path.exists(file_path):
                if os.path.dirname(file_path) == self.temp_dir:
                    os.remove(file_path)
                    
        except Exception as e:
            logger.warning(f"Erro ao limpar arquivo temporário: {str(e)}")
    
    def train_model(self, training_data, model_output_path=None):
        """
        Treina um modelo personalizado para detectar caixa postal.
        
        Args:
            training_data: Lista de dicionários com {'audio_file': path, 'is_voicemail': bool}
            model_output_path: Caminho para salvar o modelo treinado
            
        Returns:
            bool: True se treinado com sucesso
        """
        try:
            if not training_data:
                logger.error("Dados de treinamento vazios")
                return False
                
            logger.info(f"Iniciando treinamento com {len(training_data)} exemplos")
            
            # Extrair características
            X = []
            y = []
            
            for item in training_data:
                features = self._extract_audio_features(item['audio_file'])
                if features is not None:
                    X.append(features[0])  # Remover dimensão extra
                    y.append(1 if item['is_voicemail'] else 0)
            
            if not X:
                logger.error("Falha ao extrair características de treinamento")
                return False
                
            X = np.array(X)
            y = np.array(y)
            
            # Treinar modelo
            try:
                from sklearn.ensemble import RandomForestClassifier
                from sklearn.model_selection import train_test_split
                
                # Dividir dados
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.2, random_state=42
                )
                
                # Treinar
                model = RandomForestClassifier(n_estimators=100, random_state=42)
                model.fit(X_train, y_train)
                
                # Avaliar
                accuracy = model.score(X_test, y_test)
                logger.info(f"Modelo treinado com acurácia: {accuracy:.2f}")
                
                # Salvar modelo
                if model_output_path:
                    import joblib
                    joblib.dump(model, model_output_path)
                    logger.info(f"Modelo salvo em: {model_output_path}")
                
                # Atualizar modelo atual
                self.ai_model = model
                
                return True
                
            except Exception as e:
                logger.error(f"Erro no treinamento: {str(e)}")
                return False
                
        except Exception as e:
            logger.error(f"Erro ao treinar modelo: {str(e)}")
            return False
    
    def get_stats(self):
        """Retorna estatísticas do detector"""
        return self.stats.copy()
