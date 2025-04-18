# backend/services/free_tts_service.py
import os
import subprocess
import tempfile
import hashlib
import requests
from gtts import gTTS
import torch
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FreeTTSService:
    def __init__(self, cache_dir=None):
        self.available_engines = ['gtts', 'espeak', 'mozilla_tts', 'huggingface', 'pyttsx3', 'coqui']
        self.cache_dir = cache_dir or os.path.join(tempfile.gettempdir(), 'tts_cache')
        self.hf_models = {
            'pt-BR': {
                'default': 'facebook/mms-tts-por',
                'high_quality': 'facebook/seamless-m4t-v2-large',
            },
            'en-US': {
                'default': 'microsoft/speecht5_tts',
                'high_quality': 'suno/bark-small'
            },
            'es-ES': {
                'default': 'facebook/mms-tts-spa',
            }
        }
        
        # Criar diretório de cache se não existir
        os.makedirs(self.cache_dir, exist_ok=True)
    
    def get_available_voices(self, engine=None):
        """Retorna as vozes disponíveis para um determinado engine"""
        if engine == 'gtts':
            return ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'it-IT', 'de-DE', 'ja-JP']
        elif engine == 'espeak':
            # Executar comando para listar vozes disponíveis
            try:
                output = subprocess.check_output(['espeak', '--voices']).decode('utf-8')
                voices = [line.split()[1] for line in output.split('\n')[1:] if line.strip()]
                return voices
            except:
                return ['default', 'pt-BR', 'en-US']
        elif engine == 'huggingface':
            return list(self.hf_models.keys())
        else:
            return ['default']
            
    def _cache_key(self, text, voice, engine):
        """Gera uma chave de cache única baseada no texto, voz e engine"""
        content = f"{text}_{voice}_{engine}".encode('utf-8')
        return hashlib.md5(content).hexdigest()
    
    def synthesize_speech(self, text, voice="pt-BR", engine="gtts", quality="default"):
        """Sintetiza fala a partir de texto usando o engine especificado"""
        cache_key = self._cache_key(text, voice, engine)
        cache_path = os.path.join(self.cache_dir, f"{cache_key}.mp3")
        
        # Verificar cache para evitar resintetização
        if os.path.exists(cache_path):
            logger.info(f"Áudio encontrado no cache: {cache_path}")
            return cache_path
        
        try:
            if engine == "gtts":
                result = self._gtts_synthesize(text, voice, cache_path)
            elif engine == "espeak":
                result = self._espeak_synthesize(text, voice, cache_path)
            elif engine == "mozilla_tts":
                result = self._mozilla_tts_synthesize(text, voice, cache_path)
            elif engine == "huggingface":
                result = self._huggingface_synthesize(text, voice, quality, cache_path)
            elif engine == "pyttsx3":
                result = self._pyttsx3_synthesize(text, voice, cache_path)
            elif engine == "coqui":
                result = self._coqui_synthesize(text, voice, cache_path)
            else:
                raise ValueError(f"Engine não suportado: {engine}")
            
            return result
            
        except Exception as e:
            logger.error(f"Erro ao sintetizar com {engine}: {str(e)}")
            # Fallback para gTTS em caso de erro
            if engine != "gtts":
                logger.info("Fazendo fallback para gTTS")
                return self._gtts_synthesize(text, voice, cache_path)
            else:
                raise
    
    def _gtts_synthesize(self, text, lang="pt-BR", output_file=None):
        """Google Text-to-Speech - gratuito com limites de uso"""
        try:
            if not output_file:
                output_file = os.path.join(self.cache_dir, f"gtts_{hash(text)}.mp3")
            
            tts = gTTS(text=text, lang=lang.split('-')[0])
            tts.save(output_file)
            return output_file
        except Exception as e:
            logger.error(f"Erro no gTTS: {str(e)}")
            raise
    
    def _espeak_synthesize(self, text, voice="pt-BR", output_file=None):
        """Espeak - engine TTS offline open-source"""
        try:
            if not output_file:
                output_file = os.path.join(self.cache_dir, f"espeak_{hash(text)}.wav")
            
            # Mapear código de idioma para formato espeak
            if '-' in voice:
                lang_code = voice.split('-')[0]
            else:
                lang_code = voice
                
            # Executar espeak para gerar o áudio
            subprocess.run([
                'espeak',
                '-v', lang_code,
                '-w', output_file,
                text
            ], check=True)
            
            return output_file
        except Exception as e:
            logger.error(f"Erro no espeak: {str(e)}")
            raise
    
    def _mozilla_tts_synthesize(self, text, voice="pt-BR", output_file=None):
        """Mozilla TTS - modelo de TTS gratuito de alta qualidade"""
        try:
            if not output_file:
                output_file = os.path.join(self.cache_dir, f"mozilla_{hash(text)}.wav")
            
            # Para usar o Mozilla TTS, precisamos ter instalado e configurado localmente
            # Este é um exemplo de como seria a chamada ao serviço
            import subprocess
            
            # Mapear voz para modelo correspondente
            model_name = "tts_models/pt/cv/vits"  # modelo padrão em português
            if voice == "en-US":
                model_name = "tts_models/en/ljspeech/tacotron2-DDC"
            
            # Chamar o TTS via linha de comando (pressupõe que o TTS esteja instalado)
            subprocess.run([
                'tts',
                '--text', text,
                '--model_name', model_name,
                '--out_path', output_file
            ], check=True)
            
            return output_file
        except Exception as e:
            logger.error(f"Erro no Mozilla TTS: {str(e)}")
            raise
    
    def _huggingface_synthesize(self, text, voice="pt-BR", quality="default", output_file=None):
        """Hugging Face TTS - modelos gratuitos da Hugging Face"""
        try:
            if not output_file:
                output_file = os.path.join(self.cache_dir, f"hf_{hash(text)}.wav")
            
            # Instalação sob demanda (apenas no primeiro uso)
            try:
                from transformers import pipeline
            except ImportError:
                logger.info("Instalando dependências do Hugging Face...")
                subprocess.check_call(["pip", "install", "transformers", "torch", "numpy"])
                from transformers import pipeline
            
            # Selecionar modelo apropriado
            if voice in self.hf_models:
                if quality in self.hf_models[voice]:
                    model_id = self.hf_models[voice][quality]
                else:
                    model_id = self.hf_models[voice]["default"]
            else:
                # Fallback para modelo em inglês
                model_id = "microsoft/speecht5_tts"
            
            # Carregar pipeline
            logger.info(f"Carregando modelo {model_id}...")
            synthesizer = pipeline("text-to-speech", model=model_id)
            
            # Gerar audio
            logger.info("Gerando áudio com modelo Hugging Face...")
            audio = synthesizer(text)
            
            # Salvar arquivo
            if model_id == "facebook/seamless-m4t-v2-large":
                import soundfile as sf
                sf.write(output_file, audio["audio"], audio["sampling_rate"])
            else:
                import scipy.io.wavfile as wav
                wav.write(output_file, rate=audio["sampling_rate"], data=audio["audio"])
            
            return output_file
        except Exception as e:
            logger.error(f"Erro no Hugging Face TTS: {str(e)}")
            raise
    
    def _pyttsx3_synthesize(self, text, voice=None, output_file=None):
        """pyttsx3 - engine TTS offline que usa sintetizadores do sistema"""
        try:
            if not output_file:
                output_file = os.path.join(self.cache_dir, f"pyttsx3_{hash(text)}.mp3")
            
            # Instalação sob demanda
            try:
                import pyttsx3
            except ImportError:
                logger.info("Instalando pyttsx3...")
                subprocess.check_call(["pip", "install", "pyttsx3"])
                import pyttsx3
                
            # Inicializar engine
            engine = pyttsx3.init()
            
            # Configurar voz se especificada
            if voice:
                voices = engine.getProperty('voices')
                for v in voices:
                    if voice.lower() in v.languages[0].lower():
                        engine.setProperty('voice', v.id)
                        break
            
            # Configurar saída de arquivo
            engine.save_to_file(text, output_file)
            engine.runAndWait()
            
            return output_file
        except Exception as e:
            logger.error(f"Erro no pyttsx3: {str(e)}")
            raise
    
    def _coqui_synthesize(self, text, voice="pt_br", output_file=None):
        """Coqui TTS - framework TTS open-source de alta qualidade"""
        try:
            if not output_file:
                output_file = os.path.join(self.cache_dir, f"coqui_{hash(text)}.wav")
            
            # Instalação sob demanda
            try:
                from TTS.api import TTS
            except ImportError:
                logger.info("Instalando Coqui TTS...")
                subprocess.check_call(["pip", "install", "TTS"])
                from TTS.api import TTS
            
            # Mapear voz para idioma Coqui
            if '-' in voice:
                lang = voice.split('-')[0].lower() + "_" + voice.split('-')[1].lower()
            else:
                lang = voice.lower()
            
            # Inicializar TTS
            tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", progress_bar=False)
            
            # Gerar áudio (XTTS suporta múltiplos idiomas)
            tts.tts_to_file(text=text, file_path=output_file, language=lang)
            
            return output_file
        except Exception as e:
            logger.error(f"Erro no Coqui TTS: {str(e)}")
            raise
