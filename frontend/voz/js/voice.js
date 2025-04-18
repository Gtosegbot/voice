document.addEventListener('DOMContentLoaded', function() {
    // Elementos da interface
    const btnRecord = document.getElementById('btn-record');
    const btnSave = document.getElementById('btn-save');
    const btnClear = document.getElementById('btn-clear');
    const status = document.getElementById('status');
    const transcript = document.getElementById('transcript');
    const voiceRecognition = document.getElementById('voice-recognition');
    
    const textToSpeak = document.getElementById('text-to-speak');
    const voiceSelect = document.getElementById('voice-select');
    const rateRange = document.getElementById('rate-range');
    const rateValue = document.getElementById('rate-value');
    const btnSpeak = document.getElementById('btn-speak');
    const btnStop = document.getElementById('btn-stop');
    
    let isRecording = false;
    let recognition = null;
    let synth = window.speechSynthesis;
    let currentUtterance = null;
    
    // Verificar suporte ao reconhecimento de voz
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';
        
        // Configurar eventos para o reconhecimento de fala
        recognition.onstart = function() {
            status.textContent = 'Ouvindo...';
            voiceRecognition.classList.add('recording');
            btnRecord.innerHTML = '<i class="fas fa-stop"></i>';
            isRecording = true;
            
            // Desabilitar botões enquanto grava
            btnSave.disabled = true;
            btnClear.disabled = true;
        };
        
        recognition.onresult = function(event) {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const text = result[0].transcript;
                
                if (result.isFinal) {
                    finalTranscript += text;
                } else {
                    interimTranscript += text;
                }
            }
            
            // Atualizar a área de transcrição
            if (finalTranscript || interimTranscript) {
                transcript.innerHTML = `
                    <p>${finalTranscript}</p>
                    <p class="text-muted">${interimTranscript}</p>
                `;
            }
        };
        
        recognition.onend = function() {
            if (isRecording) {
                // Se terminou naturalmente, mas estávamos gravando
                recognition.start();
                return;
            }
            
            status.textContent = 'Gravação finalizada';
            voiceRecognition.classList.remove('recording');
            btnRecord.innerHTML = '<i class="fas fa-microphone"></i>';
            
            // Habilitar botões de salvar e limpar
            btnSave.disabled = false;
            btnClear.disabled = false;
        };
        
        recognition.onerror = function(event) {
            status.textContent = 'Erro: ' + event.error;
            voiceRecognition.classList.remove('recording');
            btnRecord.innerHTML = '<i class="fas fa-microphone"></i>';
            isRecording = false;
        };
    } else {
        // Navegador não suporta reconhecimento de voz
        btnRecord.disabled = true;
        status.textContent = 'Seu navegador não suporta reconhecimento de voz.';
        status.classList.add('text-danger');
    }
    
    // Verificar suporte à síntese de voz
    if ('speechSynthesis' in window) {
        // Atualizar o valor da velocidade ao mover o slider
        rateRange.addEventListener('input', function() {
            rateValue.textContent = this.value;
        });
    } else {
        // Navegador não suporta síntese de voz
        btnSpeak.disabled = true;
        textToSpeak.disabled = true;
        voiceSelect.disabled = true;
        rateRange.disabled = true;
        
        const synthesisContainer = btnSpeak.closest('.voice-card');
        synthesisContainer.querySelector('.voice-card-body').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> Seu navegador não suporta síntese de voz.
            </div>
        `;
    }
    
    // Event Listeners
    
    // Botão de gravar
    btnRecord.addEventListener('click', function() {
        if (!recognition) return;
        
        if (isRecording) {
            // Parar de gravar
            recognition.stop();
            isRecording = false;
        } else {
            // Começar a gravar
            transcript.innerHTML = '<p class="text-muted">Ouvindo...</p>';
            recognition.start();
        }
    });
    
    // Botão de limpar
    btnClear.addEventListener('click', function() {
        transcript.innerHTML = '<p class="text-muted">Sua transcrição aparecerá aqui...</p>';
        btnSave.disabled = true;
        btnClear.disabled = true;
    });
    
    // Botão de salvar
    btnSave.addEventListener('click', function() {
        const text = transcript.textContent.trim();
        if (!text || text === 'Sua transcrição aparecerá aqui...') {
            alert('Não há texto para salvar.');
            return;
        }
        
        // Simulação de salvamento
        alert('Texto salvo com sucesso!');
        console.log('Texto salvo:', text);
    });
    
    // Botão de falar
    btnSpeak.addEventListener('click', function() {
        if (!synth) return;
        
        const text = textToSpeak.value.trim();
        if (!text) {
            alert('Por favor, digite um texto para falar.');
            return;
        }
        
        // Parar qualquer fala anterior
        if (synth.speaking) {
            synth.cancel();
        }
        
        // Criar nova "fala"
        currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Configurar voz
        const voiceType = voiceSelect.value;
        // Simulação - normalmente buscaríamos a lista de vozes reais
        currentUtterance.lang = voiceType.substring(0, 5); // pt-BR ou en-US
        
        // Configurar velocidade
        currentUtterance.rate = parseFloat(rateRange.value);
        
        // Eventos da fala
        currentUtterance.onstart = function() {
            btnSpeak.disabled = true;
            btnStop.disabled = false;
        };
        
        currentUtterance.onend = function() {
            btnSpeak.disabled = false;
            btnStop.disabled = true;
        };
        
        currentUtterance.onerror = function(event) {
            console.error('Erro na síntese de voz:', event);
            btnSpeak.disabled = false;
            btnStop.disabled = true;
        };
        
        // Iniciar a fala
        synth.speak(currentUtterance);
    });
    
    // Botão de parar
    btnStop.addEventListener('click', function() {
        if (synth.speaking) {
            synth.cancel();
        }
    });
    
    // Mostrar mensagem de boas-vindas
    setTimeout(() => {
        alert('Bem-vindo à Interface de Voz DisparoSeguro!\n\nEsta é uma demonstração das capacidades de voz da plataforma.');
    }, 1000);
});
