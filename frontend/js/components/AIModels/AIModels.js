/**
 * AI Models Component
 * This component renders the AI Models page with ElevenLabs integration
 */

/**
 * Initialize the AI Models page
 */
function initAIModels() {
    renderAIModelsPage();
    setupAIModelsEvents();
    loadElevenLabsModels();
}

/**
 * Render the AI Models page
 */
function renderAIModelsPage() {
    const aiModelsPage = document.getElementById('ai-models-page');
    
    aiModelsPage.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="page-title">Modelos de IA</h1>
            <button class="btn btn-primary" id="ai-settings-btn">
                <i class="fas fa-cog"></i> Configurações de IA
            </button>
        </div>
        
        <!-- ElevenLabs Section -->
        <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">ElevenLabs - Síntese de Voz</h5>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="elevenlabs-active" checked>
                    <label class="form-check-label" for="elevenlabs-active">Ativo</label>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="elevenlabs-api-key" class="form-label">Chave API</label>
                            <div class="input-group">
                                <input type="password" class="form-control" id="elevenlabs-api-key" placeholder="Insira sua chave API do ElevenLabs">
                                <button class="btn btn-outline-secondary" type="button" id="toggle-api-key">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-outline-primary" type="button" id="save-api-key">
                                    <i class="fas fa-save"></i> Salvar
                                </button>
                            </div>
                            <div class="form-text">Obtenha sua chave API em <a href="https://elevenlabs.io/app" target="_blank">elevenlabs.io</a></div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="elevenlabs-voice" class="form-label">Voz Padrão</label>
                            <select class="form-select" id="elevenlabs-voice">
                                <option value="">-- Selecione uma voz --</option>
                                <!-- Will be populated dynamically -->
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label for="elevenlabs-model" class="form-label">Modelo</label>
                            <select class="form-select" id="elevenlabs-model">
                                <option value="eleven_multilingual_v2" selected>Multilingual v2 (Recomendado)</option>
                                <option value="eleven_monolingual_v1">Monolingual v1</option>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label for="test-voice-text" class="form-label">Testar Voz</label>
                            <textarea class="form-control" id="test-voice-text" rows="2" placeholder="Digite um texto para testar a voz escolhida">Olá, sou um assistente virtual e estou ligando para falar sobre uma oportunidade especial.</textarea>
                        </div>
                        
                        <button class="btn btn-primary" id="test-voice-btn">
                            <i class="fas fa-play"></i> Testar Voz
                        </button>
                        
                        <div class="mt-3" id="voice-test-result" style="display: none;">
                            <div class="alert alert-info">
                                <p><strong>Resultado do teste:</strong></p>
                                <audio id="test-audio" controls></audio>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="mb-0">Vozes Disponíveis</h6>
                            </div>
                            <div class="card-body p-0">
                                <div class="list-group list-group-flush" id="voices-list" style="max-height: 400px; overflow-y: auto;">
                                    <!-- Will be populated dynamically -->
                                    <div class="text-center py-4">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Carregando...</span>
                                        </div>
                                        <p class="mt-2">Carregando vozes...</p>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-outline-primary btn-sm w-100" id="add-custom-voice-btn">
                                    <i class="fas fa-plus"></i> Adicionar Voz Personalizada
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- OpenAI Section -->
        <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">OpenAI - LLM e Transcrição</h5>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="openai-active" checked>
                    <label class="form-check-label" for="openai-active">Ativo</label>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="openai-api-key" class="form-label">Chave API</label>
                            <div class="input-group">
                                <input type="password" class="form-control" id="openai-api-key" placeholder="Insira sua chave API da OpenAI">
                                <button class="btn btn-outline-secondary" type="button" id="toggle-openai-key">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-outline-primary" type="button" id="save-openai-key">
                                    <i class="fas fa-save"></i> Salvar
                                </button>
                            </div>
                            <div class="form-text">Obtenha sua chave API em <a href="https://platform.openai.com/" target="_blank">platform.openai.com</a></div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="openai-model" class="form-label">Modelo LLM</label>
                            <select class="form-select" id="openai-model">
                                <option value="gpt-4o" selected>GPT-4o (Recomendado)</option>
                                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label for="whisper-model" class="form-label">Modelo de Transcrição</label>
                            <select class="form-select" id="whisper-model">
                                <option value="whisper-1" selected>Whisper-1</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h6 class="mb-0">Opções de Conversação</h6>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label for="system-prompt" class="form-label">Prompt de Sistema</label>
                                    <textarea class="form-control" id="system-prompt" rows="4">Você é um assistente virtual profissional que está ligando em nome de nossa empresa. Seja cortês, profissional e direto. Seu objetivo é qualificar o lead e agendar uma conversa com um de nossos consultores.</textarea>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Parâmetros</label>
                                    <div class="input-group mb-2">
                                        <span class="input-group-text">Temperatura</span>
                                        <input type="range" class="form-range form-control" id="temperature" min="0" max="1" step="0.1" value="0.7">
                                        <span class="input-group-text" id="temperature-value">0.7</span>
                                    </div>
                                    
                                    <div class="input-group">
                                        <span class="input-group-text">Max Tokens</span>
                                        <input type="number" class="form-control" id="max-tokens" value="150">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Add Custom Voice Modal -->
        <div class="modal fade" id="add-voice-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Adicionar Voz Personalizada</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="add-voice-form">
                            <div class="mb-3">
                                <label for="voice-name" class="form-label">Nome da Voz</label>
                                <input type="text" class="form-control" id="voice-name" required>
                            </div>
                            <div class="mb-3">
                                <label for="voice-description" class="form-label">Descrição</label>
                                <textarea class="form-control" id="voice-description" rows="2"></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="voice-sample" class="form-label">Amostra de Áudio</label>
                                <input type="file" class="form-control" id="voice-sample" accept="audio/*" required>
                                <div class="form-text">Envie um arquivo de áudio de 1-2 minutos com a voz que deseja clonar.</div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="submit-voice-btn">Adicionar</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- AI Settings Modal -->
        <div class="modal fade" id="ai-settings-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Configurações de IA</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-4">
                            <h6>Configuração de Integração</h6>
                            <div class="mb-3">
                                <label for="ai-integration-type" class="form-label">Tipo de Integração</label>
                                <select class="form-select" id="ai-integration-type">
                                    <option value="full" selected>Completa (Transcrição, LLM e TTS)</option>
                                    <option value="tts-only">Somente TTS</option>
                                    <option value="transcription-only">Somente Transcrição</option>
                                    <option value="off">Desativada</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <h6>Limites de Uso</h6>
                            <div class="form-check form-switch mb-2">
                                <input class="form-check-input" type="checkbox" id="enable-usage-limits" checked>
                                <label class="form-check-label" for="enable-usage-limits">Ativar limites de uso</label>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="elevenlabs-daily-limit" class="form-label">Limite diário ElevenLabs (caracteres)</label>
                                        <input type="number" class="form-control" id="elevenlabs-daily-limit" value="10000">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="openai-daily-limit" class="form-label">Limite diário OpenAI (tokens)</label>
                                        <input type="number" class="form-control" id="openai-daily-limit" value="20000">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <h6>Ajustes de Qualidade</h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="voice-stability" class="form-label">Estabilidade da Voz</label>
                                        <div class="input-group">
                                            <input type="range" class="form-range form-control" id="voice-stability" min="0" max="1" step="0.1" value="0.5">
                                            <span class="input-group-text" id="stability-value">0.5</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="voice-similarity" class="form-label">Similaridade da Voz</label>
                                        <div class="input-group">
                                            <input type="range" class="form-range form-control" id="voice-similarity" min="0" max="1" step="0.1" value="0.75">
                                            <span class="input-group-text" id="similarity-value">0.75</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="save-ai-settings-btn">Salvar Configurações</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Setup AI Models events
 */
function setupAIModelsEvents() {
    // Toggle API key visibility
    const toggleApiKeyBtn = document.getElementById('toggle-api-key');
    const elevenLabsApiKey = document.getElementById('elevenlabs-api-key');
    
    if (toggleApiKeyBtn && elevenLabsApiKey) {
        toggleApiKeyBtn.addEventListener('click', () => {
            if (elevenLabsApiKey.type === 'password') {
                elevenLabsApiKey.type = 'text';
                toggleApiKeyBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                elevenLabsApiKey.type = 'password';
                toggleApiKeyBtn.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    }
    
    // Toggle OpenAI API key visibility
    const toggleOpenAiKeyBtn = document.getElementById('toggle-openai-key');
    const openAiApiKey = document.getElementById('openai-api-key');
    
    if (toggleOpenAiKeyBtn && openAiApiKey) {
        toggleOpenAiKeyBtn.addEventListener('click', () => {
            if (openAiApiKey.type === 'password') {
                openAiApiKey.type = 'text';
                toggleOpenAiKeyBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                openAiApiKey.type = 'password';
                toggleOpenAiKeyBtn.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    }
    
    // Save ElevenLabs API key
    const saveApiKeyBtn = document.getElementById('save-api-key');
    if (saveApiKeyBtn) {
        saveApiKeyBtn.addEventListener('click', () => {
            const apiKey = elevenLabsApiKey.value.trim();
            if (!apiKey) {
                alert('Por favor, insira uma chave API válida.');
                return;
            }
            
            // In a real app, you would send this to your backend
            alert('Chave API salva com sucesso!');
            
            // Load voices after setting API key
            loadElevenLabsVoices(apiKey);
        });
    }
    
    // Save OpenAI API key
    const saveOpenAiKeyBtn = document.getElementById('save-openai-key');
    if (saveOpenAiKeyBtn) {
        saveOpenAiKeyBtn.addEventListener('click', () => {
            const apiKey = openAiApiKey.value.trim();
            if (!apiKey) {
                alert('Por favor, insira uma chave API válida.');
                return;
            }
            
            // In a real app, you would send this to your backend
            alert('Chave API da OpenAI salva com sucesso!');
        });
    }
    
    // Temperature slider value display
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperature-value');
    
    if (temperatureSlider && temperatureValue) {
        temperatureSlider.addEventListener('input', () => {
            temperatureValue.textContent = temperatureSlider.value;
        });
    }
    
    // Voice settings sliders
    const stabilitySlider = document.getElementById('voice-stability');
    const stabilityValue = document.getElementById('stability-value');
    
    if (stabilitySlider && stabilityValue) {
        stabilitySlider.addEventListener('input', () => {
            stabilityValue.textContent = stabilitySlider.value;
        });
    }
    
    const similaritySlider = document.getElementById('voice-similarity');
    const similarityValue = document.getElementById('similarity-value');
    
    if (similaritySlider && similarityValue) {
        similaritySlider.addEventListener('input', () => {
            similarityValue.textContent = similaritySlider.value;
        });
    }
    
    // Test voice button
    const testVoiceBtn = document.getElementById('test-voice-btn');
    if (testVoiceBtn) {
        testVoiceBtn.addEventListener('click', () => {
            testElevenLabsVoice();
        });
    }
    
    // Add custom voice button
    const addCustomVoiceBtn = document.getElementById('add-custom-voice-btn');
    if (addCustomVoiceBtn) {
        addCustomVoiceBtn.addEventListener('click', () => {
            const addVoiceModal = new bootstrap.Modal(document.getElementById('add-voice-modal'));
            addVoiceModal.show();
        });
    }
    
    // Submit voice button
    const submitVoiceBtn = document.getElementById('submit-voice-btn');
    if (submitVoiceBtn) {
        submitVoiceBtn.addEventListener('click', () => {
            addCustomVoice();
        });
    }
    
    // AI Settings button
    const aiSettingsBtn = document.getElementById('ai-settings-btn');
    if (aiSettingsBtn) {
        aiSettingsBtn.addEventListener('click', () => {
            const aiSettingsModal = new bootstrap.Modal(document.getElementById('ai-settings-modal'));
            aiSettingsModal.show();
        });
    }
    
    // Save AI Settings button
    const saveAiSettingsBtn = document.getElementById('save-ai-settings-btn');
    if (saveAiSettingsBtn) {
        saveAiSettingsBtn.addEventListener('click', () => {
            saveAISettings();
        });
    }
}

/**
 * Load ElevenLabs models and voices
 */
function loadElevenLabsModels() {
    // Load saved API key if available
    const savedApiKey = localStorage.getItem('elevenlabs_api_key');
    if (savedApiKey) {
        const elevenLabsApiKey = document.getElementById('elevenlabs-api-key');
        if (elevenLabsApiKey) {
            elevenLabsApiKey.value = savedApiKey;
            
            // Load voices with the saved API key
            loadElevenLabsVoices(savedApiKey);
        }
    }
    
    // Load saved OpenAI API key if available
    const savedOpenAiKey = localStorage.getItem('openai_api_key');
    if (savedOpenAiKey) {
        const openAiApiKey = document.getElementById('openai-api-key');
        if (openAiApiKey) {
            openAiApiKey.value = savedOpenAiKey;
        }
    }
}

/**
 * Load ElevenLabs voices
 * @param {string} apiKey - The ElevenLabs API key
 */
function loadElevenLabsVoices(apiKey) {
    const voicesList = document.getElementById('voices-list');
    
    // Show loading state
    voicesList.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="mt-2">Carregando vozes...</p>
        </div>
    `;
    
    // In a real app, you would fetch this from your backend
    // Here we'll simulate an API call with mock data
    setTimeout(() => {
        const mockVoices = [
            {
                voice_id: '21m00Tcm4TlvDq8ikWAM',
                name: 'Rachel',
                category: 'premade',
                description: 'A warm and versatile female voice with a neutral accent'
            },
            {
                voice_id: 'AZnzlk1XvdvUeBnXmlld',
                name: 'Domi',
                category: 'premade',
                description: 'A soft and calm female voice with a natural tone'
            },
            {
                voice_id: 'EXAVITQu4vr4xnSDxMaL',
                name: 'Bella',
                category: 'premade',
                description: 'A confident and warm female voice'
            },
            {
                voice_id: 'ErXwobaYiN019PkySvjV',
                name: 'Antoni',
                category: 'premade',
                description: 'A strong and clear male voice with a neutral accent'
            },
            {
                voice_id: 'MF3mGyEYCl7XYWbV9V6O',
                name: 'Elli',
                category: 'premade',
                description: 'A soft and gentle female voice with a slight accent'
            },
            {
                voice_id: 'TxGEqnHWrfWFTfGW9XjX',
                name: 'Josh',
                category: 'premade',
                description: 'A deep and resonant male voice with a neutral accent'
            },
            {
                voice_id: 'VR6AewLTigWG4xSOukaG',
                name: 'Arnold',
                category: 'premade',
                description: 'A strong and confident male voice'
            },
            {
                voice_id: 'pNInz6obpgDQGcFmaJgB',
                name: 'Adam',
                category: 'premade',
                description: 'A versatile male voice with a neutral accent'
            },
            {
                voice_id: 'yoZ06aMxZJJ28mfd3POQ',
                name: 'Sam',
                category: 'premade',
                description: 'A deep and powerful male voice with a neutral accent'
            }
        ];
        
        // Add some custom voices for demonstration
        mockVoices.push({
            voice_id: 'custom-voice-1',
            name: 'João (Personalizado)',
            category: 'custom',
            description: 'Voz personalizada para agente João'
        });
        
        mockVoices.push({
            voice_id: 'custom-voice-2',
            name: 'Maria (Personalizado)',
            category: 'custom',
            description: 'Voz personalizada para agente Maria'
        });
        
        // Populate voices list
        renderElevenLabsVoices(mockVoices);
        
        // Populate voice select
        populateVoiceSelect(mockVoices);
        
        // Save the API key
        localStorage.setItem('elevenlabs_api_key', apiKey);
    }, 1500);
}

/**
 * Render ElevenLabs voices
 * @param {Array} voices - List of ElevenLabs voices
 */
function renderElevenLabsVoices(voices) {
    const voicesList = document.getElementById('voices-list');
    
    if (!voices || voices.length === 0) {
        voicesList.innerHTML = `
            <div class="text-center py-4">
                <p>Nenhuma voz disponível.</p>
            </div>
        `;
        return;
    }
    
    // Group voices by category
    const premadeVoices = voices.filter(v => v.category === 'premade');
    const customVoices = voices.filter(v => v.category === 'custom');
    
    let html = '';
    
    // Add premade voices
    if (premadeVoices.length > 0) {
        html += '<div class="list-group-item list-group-item-light">Vozes Pré-definidas</div>';
        
        premadeVoices.forEach(voice => {
            html += `
                <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${voice.name}</h6>
                        <p class="mb-1 small text-muted">${voice.description}</p>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary me-1 preview-voice-btn" data-voice-id="${voice.voice_id}">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success select-voice-btn" data-voice-id="${voice.voice_id}" data-voice-name="${voice.name}">
                            <i class="fas fa-check"></i>
                        </button>
                    </div>
                </div>
            `;
        });
    }
    
    // Add custom voices
    if (customVoices.length > 0) {
        html += '<div class="list-group-item list-group-item-light">Vozes Personalizadas</div>';
        
        customVoices.forEach(voice => {
            html += `
                <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${voice.name}</h6>
                        <p class="mb-1 small text-muted">${voice.description}</p>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary me-1 preview-voice-btn" data-voice-id="${voice.voice_id}">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success select-voice-btn" data-voice-id="${voice.voice_id}" data-voice-name="${voice.name}">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-voice-btn" data-voice-id="${voice.voice_id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
    }
    
    voicesList.innerHTML = html;
    
    // Add event listeners to preview buttons
    document.querySelectorAll('.preview-voice-btn').forEach(button => {
        button.addEventListener('click', () => {
            const voiceId = button.getAttribute('data-voice-id');
            previewVoice(voiceId);
        });
    });
    
    // Add event listeners to select buttons
    document.querySelectorAll('.select-voice-btn').forEach(button => {
        button.addEventListener('click', () => {
            const voiceId = button.getAttribute('data-voice-id');
            const voiceName = button.getAttribute('data-voice-name');
            selectVoice(voiceId, voiceName);
        });
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-voice-btn').forEach(button => {
        button.addEventListener('click', () => {
            const voiceId = button.getAttribute('data-voice-id');
            deleteVoice(voiceId);
        });
    });
}

/**
 * Populate voice select dropdown
 * @param {Array} voices - List of ElevenLabs voices
 */
function populateVoiceSelect(voices) {
    const voiceSelect = document.getElementById('elevenlabs-voice');
    
    // Clear existing options except the first one
    while (voiceSelect.options.length > 1) {
        voiceSelect.remove(1);
    }
    
    // Add options for each voice
    voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.voice_id;
        option.textContent = voice.name;
        voiceSelect.appendChild(option);
    });
    
    // Set default voice if saved
    const savedVoiceId = localStorage.getItem('elevenlabs_default_voice');
    if (savedVoiceId) {
        voiceSelect.value = savedVoiceId;
    } else {
        // Default to Rachel if available
        const rachelOption = Array.from(voiceSelect.options).find(option => option.value === '21m00Tcm4TlvDq8ikWAM');
        if (rachelOption) {
            voiceSelect.value = '21m00Tcm4TlvDq8ikWAM';
        }
    }
}

/**
 * Preview a voice
 * @param {string} voiceId - The ID of the voice to preview
 */
function previewVoice(voiceId) {
    const previewText = "Olá, sou um assistente virtual e estou ligando para falar sobre uma oportunidade especial.";
    
    // In a real app, you would call your backend API
    // Here we'll show a mock loading state and then play a sample audio
    
    const button = document.querySelector(`.preview-voice-btn[data-voice-id="${voiceId}"]`);
    const originalHTML = button.innerHTML;
    
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    button.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.disabled = false;
        
        // Create audio element with a sample audio
        const audioSrc = "https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-1.mp3";
        const audio = new Audio(audioSrc);
        audio.play();
        
        // Show a toast notification
        showToast("Reproduzindo amostra de voz");
    }, 1000);
}

/**
 * Select a voice as default
 * @param {string} voiceId - The ID of the voice to select
 * @param {string} voiceName - The name of the voice
 */
function selectVoice(voiceId, voiceName) {
    const voiceSelect = document.getElementById('elevenlabs-voice');
    
    // Set the select value
    voiceSelect.value = voiceId;
    
    // Save to localStorage
    localStorage.setItem('elevenlabs_default_voice', voiceId);
    
    // Show a toast notification
    showToast(`Voz padrão definida: ${voiceName}`);
}

/**
 * Delete a custom voice
 * @param {string} voiceId - The ID of the voice to delete
 */
function deleteVoice(voiceId) {
    if (confirm('Tem certeza que deseja excluir esta voz personalizada?')) {
        // In a real app, you would call your backend API
        // Here we'll just remove the element from the DOM
        
        const voiceElement = document.querySelector(`.delete-voice-btn[data-voice-id="${voiceId}"]`).closest('.list-group-item');
        voiceElement.remove();
        
        // Also remove from the select dropdown
        const voiceSelect = document.getElementById('elevenlabs-voice');
        const option = Array.from(voiceSelect.options).find(option => option.value === voiceId);
        if (option) {
            option.remove();
        }
        
        // Show a toast notification
        showToast("Voz personalizada excluída com sucesso");
    }
}

/**
 * Test ElevenLabs voice with the current settings
 */
function testElevenLabsVoice() {
    const voiceId = document.getElementById('elevenlabs-voice').value;
    const modelId = document.getElementById('elevenlabs-model').value;
    const text = document.getElementById('test-voice-text').value.trim();
    
    if (!voiceId) {
        alert('Por favor, selecione uma voz.');
        return;
    }
    
    if (!text) {
        alert('Por favor, insira um texto para testar.');
        return;
    }
    
    const testVoiceBtn = document.getElementById('test-voice-btn');
    const originalHTML = testVoiceBtn.innerHTML;
    
    testVoiceBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Gerando Áudio...';
    testVoiceBtn.disabled = true;
    
    // In a real app, you would call your backend API
    // Here we'll simulate an API call with a delay
    setTimeout(() => {
        testVoiceBtn.innerHTML = originalHTML;
        testVoiceBtn.disabled = false;
        
        // Show test result
        const testResult = document.getElementById('voice-test-result');
        testResult.style.display = 'block';
        
        // Set audio source
        const testAudio = document.getElementById('test-audio');
        testAudio.src = "https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-1.mp3";
        testAudio.play();
    }, 2000);
}

/**
 * Add a custom voice
 */
function addCustomVoice() {
    const voiceName = document.getElementById('voice-name').value.trim();
    const voiceDescription = document.getElementById('voice-description').value.trim();
    const voiceSample = document.getElementById('voice-sample').files[0];
    
    if (!voiceName) {
        alert('Por favor, insira um nome para a voz.');
        return;
    }
    
    if (!voiceSample) {
        alert('Por favor, selecione um arquivo de áudio para a amostra de voz.');
        return;
    }
    
    const submitVoiceBtn = document.getElementById('submit-voice-btn');
    const originalHTML = submitVoiceBtn.innerHTML;
    
    submitVoiceBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';
    submitVoiceBtn.disabled = true;
    
    // In a real app, you would upload the file to your backend
    // Here we'll simulate an API call with a delay
    setTimeout(() => {
        submitVoiceBtn.innerHTML = originalHTML;
        submitVoiceBtn.disabled = false;
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('add-voice-modal'));
        modal.hide();
        
        // Show success message
        showToast("Voz personalizada adicionada com sucesso");
        
        // Reload voices to include the new one
        const apiKey = document.getElementById('elevenlabs-api-key').value;
        loadElevenLabsVoices(apiKey);
        
        // Reset form
        document.getElementById('add-voice-form').reset();
    }, 2000);
}

/**
 * Save AI settings
 */
function saveAISettings() {
    // Get all settings
    const settings = {
        integrationType: document.getElementById('ai-integration-type').value,
        enableUsageLimits: document.getElementById('enable-usage-limits').checked,
        elevenLabsDailyLimit: document.getElementById('elevenlabs-daily-limit').value,
        openaiDailyLimit: document.getElementById('openai-daily-limit').value,
        voiceStability: document.getElementById('voice-stability').value,
        voiceSimilarity: document.getElementById('voice-similarity').value
    };
    
    // In a real app, you would send this to your backend
    console.log('AI Settings:', settings);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('ai-settings-modal'));
    modal.hide();
    
    // Show success message
    showToast("Configurações de IA salvas com sucesso");
}

/**
 * Show a toast notification
 * @param {string} message - The message to show
 */
function showToast(message) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">VoiceAI</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Initialize and show the toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove the toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Expose component initialization to window object
window.initAIModels = initAIModels;

// Store for component elements
let aiModelsContainer;

/**
 * AI Models component that handles AI integrations like ElevenLabs and OpenAI
 * Expose component functions to window object
 */
window.initAIModels = initAIModels;

// Adding other AIModels functions to window object as well
window.AIModels = {
    /**
     * Initialize the AI Models component
     * @param {HTMLElement} container - Container element where the component will be rendered
     */
    init: function(container) {
        console.log('Initializing AI Models component');
        
        // Set AI Models container
        aiModelsContainer = container;
        
        // Initialize the component
        initAIModels();
        
        return container;
    },
    
    /**
     * Clean up the component
     */
    destroy: function() {
        // Clean up any event listeners or resources
        console.log('Destroying AI Models component');
        
        if (aiModelsContainer) {
            // Reset content
            aiModelsContainer.innerHTML = '';
        }
    }
};