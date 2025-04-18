/**
 * DisparoSeguro - Módulo de Manipulação de Chamadas
 * Versão 1.0
 */

class CallHandler {
    constructor(options = {}) {
        this.status = 'idle'; // idle, calling, connected, ended
        this.callStartTime = null;
        this.callEndTime = null;
        this.currentCallId = null;
        this.recordingEnabled = options.recordingEnabled !== undefined ? options.recordingEnabled : true;
        this.autoAnswerEnabled = options.autoAnswerEnabled !== undefined ? options.autoAnswerEnabled : false;
        this.voiceRecognition = options.voiceRecognition || null;
        this.textToSpeech = options.textToSpeech || null;
        
        this.onStatusChangeCallback = options.onStatusChange || null;
        this.onCallStartCallback = options.onCallStart || null;
        this.onCallEndCallback = options.onCallEnd || null;
        this.onRecordingStartCallback = options.onRecordingStart || null;
        this.onRecordingEndCallback = options.onRecordingEnd || null;
        
        this.recordings = [];
        this.currentRecording = null;
        this.callHistory = [];
        this.apiEndpoint = options.apiEndpoint || 'https://api.disparoseguro.shop/v1';
        
        // Verificar se o áudio está disponível
        this.audioContext = null;
        this.initAudio();
    }
    
    initAudio() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.error('Web Audio API não suportada neste navegador', e);
        }
    }
    
    async makeCall(phoneNumber, options = {}) {
        if (this.status !== 'idle') {
            console.error('Já existe uma chamada em andamento');
            return false;
        }
        
        // Criar ID único para a chamada
        this.currentCallId = Date.now().toString();
        this.callStartTime = new Date();
        
        // Atualizar status
        this.updateStatus('calling');
        
        // Registrar na API (simulado)
        console.log(`Iniciando chamada para ${phoneNumber}`);
        
        // Simulação de tempo de espera para conexão
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Atualizar status para conectado
        this.updateStatus('connected');
        
        // Iniciar gravação se habilitado
        if (this.recordingEnabled) {
            this.startRecording();
        }
        
        // Adicionar ao histórico
        const callData = {
            id: this.currentCallId,
            phoneNumber,
            startTime: this.callStartTime,
            status: 'connected',
            direction: 'outbound',
            metadata: options.metadata || {}
        };
        
        this.callHistory.push(callData);
        
        // Callback
        if (this.onCallStartCallback) {
            this.onCallStartCallback(callData);
        }
        
        return this.currentCallId;
    }
    
    async receiveCall(callData) {
        if (this.status !== 'idle') {
            console.error('Sistema ocupado, não pode receber chamadas');
            return false;
        }
        
        this.currentCallId = callData.id || Date.now().toString();
        this.callStartTime = new Date();
        
        // Atualizar status
        this.updateStatus('ringing');
        
        // Se auto-atendimento estiver ativado
        if (this.autoAnswerEnabled) {
            return this.answerCall();
        }
        
        return true;
    }
    
    async answerCall() {
        if (this.status !== 'ringing') {
            console.error('Nenhuma chamada para atender');
            return false;
        }
        
        // Atualizar status
        this.updateStatus('connected');
        
        // Iniciar gravação se habilitado
        if (this.recordingEnabled) {
            this.startRecording();
        }
        
        // Atualizar histórico
        const callIndex = this.callHistory.findIndex(call => call.id === this.currentCallId);
        if (callIndex >= 0) {
            this.callHistory[callIndex].status = 'connected';
            this.callHistory[callIndex].answeredAt = new Date();
        }
        
        return true;
    }
    
    async endCall() {
        if (this.status !== 'connected' && this.status !== 'calling' && this.status !== 'ringing') {
            console.error('Nenhuma chamada ativa para encerrar');
            return false;
        }
        
        // Parar gravação se estiver ativa
        if (this.currentRecording) {
            this.stopRecording();
        }
        
        this.callEndTime = new Date();
        
        // Atualizar status
        this.updateStatus('ended');
        
        // Calcular duração
        const duration = (this.callEndTime - this.callStartTime) / 1000; // em segundos
        
        // Atualizar histórico
        const callIndex = this.callHistory.findIndex(call => call.id === this.currentCallId);
        if (callIndex >= 0) {
            this.callHistory[callIndex].status = 'ended';
            this.callHistory[callIndex].endTime = this.callEndTime;
            this.callHistory[callIndex].duration = duration;
        }
        
        // Callback
        if (this.onCallEndCallback) {
            this.onCallEndCallback({
                id: this.currentCallId,
                startTime: this.callStartTime,
                endTime: this.callEndTime,
                duration
            });
        }
        
        // Limpar status atual
        setTimeout(() => {
            this.currentCallId = null;
            this.callStartTime = null;
            this.callEndTime = null;
            this.updateStatus('idle');
        }, 1000);
        
        return true;
    }
    
    updateStatus(newStatus) {
        const previousStatus = this.status;
        this.status = newStatus;
        
        // Callback
        if (this.onStatusChangeCallback) {
            this.onStatusChangeCallback({
                previous: previousStatus,
                current: newStatus,
                timestamp: new Date(),
                callId: this.currentCallId
            });
        }
    }
    
    startRecording() {
        // Verificar se já existe gravação
        if (this.currentRecording) {
            console.error('Já existe uma gravação em andamento');
            return false;
        }
        
        // Simular início de gravação
        this.currentRecording = {
            id: `rec_${Date.now()}`,
            callId: this.currentCallId,
            startTime: new Date(),
            status: 'recording'
        };
        
        // Callback
        if (this.onRecordingStartCallback) {
            this.onRecordingStartCallback(this.currentRecording);
        }
        
        console.log('Gravação iniciada', this.currentRecording);
        
        return this.currentRecording.id;
    }
    
    stopRecording() {
        if (!this.currentRecording) {
            console.error('Nenhuma gravação em andamento');
            return false;
        }
        
        this.currentRecording.endTime = new Date();
        this.currentRecording.status = 'completed';
        this.currentRecording.duration = (this.currentRecording.endTime - this.currentRecording.startTime) / 1000; // em segundos
        
        // Adicionar à lista de gravações
        this.recordings.push(this.currentRecording);
        
        // Callback
        if (this.onRecordingEndCallback) {
            this.onRecordingEndCallback(this.currentRecording);
        }
        
        console.log('Gravação finalizada', this.currentRecording);
        
        // Limpar gravação atual
        const recordingData = { ...this.currentRecording };
        this.currentRecording = null;
        
        return recordingData;
    }
    
    getCallHistory() {
        return [...this.callHistory];
    }
    
    getRecordings() {
        return [...this.recordings];
    }
    
    getCallDuration() {
        if (!this.callStartTime) {
            return 0;
        }
        
        const endTime = this.callEndTime || new Date();
        return (endTime - this.callStartTime) / 1000; // em segundos
    }
    
    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }
    
    // Métodos para integração com reconhecimento de voz
    connectVoiceRecognition(voiceRecognition) {
        this.voiceRecognition = voiceRecognition;
    }
    
    // Métodos para integração com TTS
    connectTextToSpeech(textToSpeech) {
        this.textToSpeech = textToSpeech;
    }
    
    // Método auxiliar para simular uma chamada completa
    async simulateCall(phoneNumber, options = {}) {
        // Simulação de etapas de uma chamada
        const callId = await this.makeCall(phoneNumber, options);
        
        if (!callId) {
            return false;
        }
        
        // Simulação de conversa
        console.log('Chamada conectada. Iniciando conversa...');
        
        // Se TextToSpeech estiver disponível, falar
        if (this.textToSpeech) {
            this.textToSpeech.speak('Olá, aqui é o assistente virtual da DisparoSeguro. Como posso ajudar?');
        }
        
        // Aguardar um tempo para simular conversa
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Finalizar chamada
        return this.endCall();
    }
}

// Exportar para uso
window.CallHandler = CallHandler;

// Exemplo de uso:
/*
const callHandler = new CallHandler({
    recordingEnabled: true,
    autoAnswerEnabled: false,
    onStatusChange: (status) => {
        console.log('Status da chamada alterado:', status);
    },
    onCallStart: (callData) => {
        console.log('Chamada iniciada:', callData);
    },
    onCallEnd: (callData) => {
        console.log('Chamada finalizada:', callData);
    }
});

// Iniciar uma chamada
callHandler.makeCall('5511987654321', {
    metadata: {
        leadId: 123,
        campaignId: 456
    }
});

// Após alguns segundos, encerrar a chamada
setTimeout(() => {
    callHandler.endCall();
}, 5000);
*/
