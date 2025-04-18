/**
 * DisparoSeguro - Módulo de Text-to-Speech (TTS)
 * Versão 1.0
 */

class TextToSpeech {
    constructor(options = {}) {
        this.voice = options.voice || null;
        this.rate = options.rate || 1;
        this.pitch = options.pitch || 1;
        this.volume = options.volume || 1;
        this.language = options.language || 'pt-BR';
        
        this.voices = [];
        this.synthesis = window.speechSynthesis;
        this.currentUtterance = null;
        
        this.onStartCallback = options.onStart || null;
        this.onEndCallback = options.onEnd || null;
        this.onErrorCallback = options.onError || null;
        this.onPauseCallback = options.onPause || null;
        this.onResumeCallback = options.onResume || null;
        
        this.init();
    }
    
    init() {
        // Verificar se o navegador suporta a API de TTS
        if (!('speechSynthesis' in window)) {
            console.error('Text-to-Speech não é suportado neste navegador.');
            return;
        }
        
        // Carregar vozes disponíveis
        this.loadVoices();
        
        // Se as vozes não forem carregadas imediatamente, configurar um evento para quando estiverem disponíveis
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
        }
    }
    
    loadVoices() {
        this.voices = this.synthesis.getVoices();
        
        // Tentar encontrar uma voz em português por padrão
        if (!this.voice && this.voices.length > 0) {
            // Procurar por uma voz em português
            const portugueseVoice = this.voices.find(voice => 
                voice.lang.includes('pt') || 
                voice.name.toLowerCase().includes('português') || 
                voice.name.toLowerCase().includes('portuguese')
            );
            
            this.voice = portugueseVoice || this.voices[0];
        }
    }
    
    getVoices() {
        return this.voices;
    }
    
    setVoice(voiceURI) {
        const voice = this.voices.find(v => v.voiceURI === voiceURI);
        if (voice) {
            this.voice = voice;
            return true;
        }
        return false;
    }
    
    setLanguage(language) {
        this.language = language;
        
        // Tentar encontrar uma voz para o idioma selecionado
        const voiceForLanguage = this.voices.find(v => v.lang.includes(language));
        if (voiceForLanguage) {
            this.voice = voiceForLanguage;
            return true;
        }
        return false;
    }
    
    setRate(rate) {
        this.rate = Math.min(Math.max(rate, 0.1), 10);
    }
    
    setPitch(pitch) {
        this.pitch = Math.min(Math.max(pitch, 0.1), 2);
    }
    
    setVolume(volume) {
        this.volume = Math.min(Math.max(volume, 0), 1);
    }
    
    speak(text) {
        if (!this.synthesis) {
            return false;
        }
        
        // Cancelar qualquer fala em andamento
        this.stop();
        
        // Criar nova utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configurar parâmetros
        utterance.voice = this.voice;
        utterance.rate = this.rate;
        utterance.pitch = this.pitch;
        utterance.volume = this.volume;
        utterance.lang = this.language;
        
        // Configurar eventos
        utterance.onstart = () => {
            if (this.onStartCallback) {
                this.onStartCallback();
            }
        };
        
        utterance.onend = () => {
            this.currentUtterance = null;
            if (this.onEndCallback) {
                this.onEndCallback();
            }
        };
        
        utterance.onerror = (event) => {
            if (this.onErrorCallback) {
                this.onErrorCallback(event);
            }
        };
        
        utterance.onpause = () => {
            if (this.onPauseCallback) {
                this.onPauseCallback();
            }
        };
        
        utterance.onresume = () => {
            if (this.onResumeCallback) {
                this.onResumeCallback();
            }
        };
        
        // Armazenar a utterance atual para poder pausar/retomar mais tarde
        this.currentUtterance = utterance;
        
        // Iniciar a fala
        this.synthesis.speak(utterance);
        
        return true;
    }
    
    pause() {
        if (this.synthesis) {
            this.synthesis.pause();
            return true;
        }
        return false;
    }
    
    resume() {
        if (this.synthesis) {
            this.synthesis.resume();
            return true;
        }
        return false;
    }
    
    stop() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.currentUtterance = null;
            return true;
        }
        return false;
    }
    
    isSpeaking() {
        return this.synthesis && this.synthesis.speaking;
    }
    
    isPaused() {
        return this.synthesis && this.synthesis.paused;
    }
}

// Exportar para uso
window.TextToSpeech = TextToSpeech;

// Exemplo de uso:
/*
const tts = new TextToSpeech({
    language: 'pt-BR',
    rate: 1,
    pitch: 1,
    onStart: () => {
        console.log('Começou a falar');
    },
    onEnd: () => {
        console.log('Terminou de falar');
    },
    onError: (error) => {
        console.error('Erro ao falar:', error);
    }
});

// Falar um texto
tts.speak('Olá, bem-vindo ao DisparoSeguro!');

// Pausar
setTimeout(() => {
    tts.pause();
    console.log('Pausado');
    
    // Retomar após 2 segundos
    setTimeout(() => {
        tts.resume();
        console.log('Retomado');
    }, 2000);
}, 1000);
*/

