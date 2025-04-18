/**
 * DisparoSeguro - Módulo de Reconhecimento de Voz
 * Versão 1.0
 */

class VoiceRecognition {
    constructor(options = {}) {
        this.language = options.language || 'pt-BR';
        this.continuous = options.continuous !== undefined ? options.continuous : true;
        this.interimResults = options.interimResults !== undefined ? options.interimResults : true;
        
        this.isRecording = false;
        this.recognition = null;
        this.transcript = '';
        this.onResultCallback = options.onResult || null;
        this.onErrorCallback = options.onError || null;
        this.onStartCallback = options.onStart || null;
        this.onEndCallback = options.onEnd || null;
        
        this.initRecognition();
    }
    
    initRecognition() {
        // Verificar se o navegador suporta reconhecimento de voz
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('Reconhecimento de voz não é suportado neste navegador.');
            return;
        }
        
        // Criar instância do reconhecimento de voz
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configurar
        this.recognition.lang = this.language;
        this.recognition.continuous = this.continuous;
        this.recognition.interimResults = this.interimResults;
        
        // Configurar eventos
        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            this.transcript = finalTranscript || interimTranscript;
            
            if (this.onResultCallback) {
                this.onResultCallback({
                    finalTranscript,
                    interimTranscript,
                    fullTranscript: this.transcript
                });
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Erro de reconhecimento de voz:', event.error);
            if (this.onErrorCallback) {
                this.onErrorCallback(event);
            }
        };
        
        this.recognition.onstart = () => {
            this.isRecording = true;
            if (this.onStartCallback) {
                this.onStartCallback();
            }
        };
        
        this.recognition.onend = () => {
            // Se ainda estiver em modo de gravação, reiniciar
            if (this.isRecording && this.continuous) {
                this.recognition.start();
            } else {
                this.isRecording = false;
                if (this.onEndCallback) {
                    this.onEndCallback();
                }
            }
        };
    }
    
    start() {
        if (!this.recognition) {
            this.initRecognition();
        }
        
        try {
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('Erro ao iniciar reconhecimento:', error);
            return false;
        }
    }
    
    stop() {
        if (this.recognition) {
            this.isRecording = false;
            this.recognition.stop();
        }
    }
    
    abort() {
        if (this.recognition) {
            this.isRecording = false;
            this.recognition.abort();
        }
    }
    
    setLanguage(language) {
        this.language = language;
        if (this.recognition) {
            this.recognition.lang = language;
        }
    }
    
    setContinuous(continuous) {
        this.continuous = continuous;
        if (this.recognition) {
            this.recognition.continuous = continuous;
        }
    }
    
    clearTranscript() {
        this.transcript = '';
    }
    
    getTranscript() {
        return this.transcript;
    }
}

// Exportar para uso
window.VoiceRecognition = VoiceRecognition;

// Exemplo de uso:
/*
const voiceRecognition = new VoiceRecognition({
    language: 'pt-BR',
    continuous: true,
    onResult: (result) => {
        console.log('Transcrição:', result.fullTranscript);
    },
    onStart: () => {
        console.log('Iniciou gravação');
    },
    onEnd: () => {
        console.log('Finalizou gravação');
    },
    onError: (error) => {
        console.error('Erro:', error);
    }
});

// Iniciar reconhecimento
voiceRecognition.start();

// Parar após 10 segundos
setTimeout(() => {
    voiceRecognition.stop();
}, 10000);
*/

