/**
 * Settings component for VoiceAI platform
 */

class Settings {
    constructor() {
        this.element = document.getElementById('settings-page');
        this.currentTab = 'user';
    }
    
    /**
     * Initialize settings
     */
    async init() {
        if (!this.element) return;
        
        try {
            // Render settings
            this.render();
            
            // Set up event handlers
            this.setupEventHandlers();
            
            // Load settings
            this.loadSettings();
        } catch (error) {
            console.error('Error initializing settings:', error);
        }
    }
    
    /**
     * Render settings
     */
    render() {
        this.element.innerHTML = `
            <div class="settings-container">
                <h1 class="page-title">Configurações</h1>
                
                <div class="settings-tabs">
                    <div class="settings-tab active" data-tab="user">Perfil do Usuário</div>
                    <div class="settings-tab" data-tab="telephony">Telefonia</div>
                    <div class="settings-tab" data-tab="ai">Inteligência Artificial</div>
                    <div class="settings-tab" data-tab="integrations">Integrações</div>
                    <div class="settings-tab" data-tab="notifications">Notificações</div>
                </div>
                
                <div class="settings-content">
                    <!-- User Profile Settings -->
                    <div class="settings-panel active" id="user-settings">
                        <div class="settings-section">
                            <div class="settings-section-title">Informações Pessoais</div>
                            <form id="profile-form">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="profile-name" class="form-label">Nome Completo</label>
                                        <input type="text" id="profile-name" class="form-control">
                                    </div>
                                    <div class="col-md-6">
                                        <label for="profile-email" class="form-label">Email</label>
                                        <input type="email" id="profile-email" class="form-control" disabled>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="profile-phone" class="form-label">Telefone</label>
                                        <input type="tel" id="profile-phone" class="form-control">
                                    </div>
                                    <div class="col-md-6">
                                        <label for="profile-job-title" class="form-label">Cargo</label>
                                        <input type="text" id="profile-job-title" class="form-control">
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary">Salvar Informações</button>
                            </form>
                        </div>
                        
                        <div class="settings-section">
                            <div class="settings-section-title">Alterar Senha</div>
                            <form id="password-form">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="current-password" class="form-label">Senha Atual</label>
                                        <input type="password" id="current-password" class="form-control">
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="new-password" class="form-label">Nova Senha</label>
                                        <input type="password" id="new-password" class="form-control">
                                    </div>
                                    <div class="col-md-6">
                                        <label for="confirm-password" class="form-label">Confirmar Nova Senha</label>
                                        <input type="password" id="confirm-password" class="form-control">
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary">Alterar Senha</button>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Telephony Settings -->
                    <div class="settings-panel" id="telephony-settings">
                        <div class="settings-section">
                            <div class="settings-section-title">Configurações de Telefonia</div>
                            <form id="telephony-form">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="telephony-provider" class="form-label">Provedor</label>
                                        <select id="telephony-provider" class="form-select">
                                            <option value="twilio">Twilio</option>
                                            <option value="asterisk">Asterisk</option>
                                            <option value="plivo">Plivo</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="default-caller-id" class="form-label">ID de Chamada Padrão</label>
                                        <input type="text" id="default-caller-id" class="form-control">
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Credenciais Twilio</label>
                                    <div class="row mb-2">
                                        <div class="col-md-6">
                                            <input type="text" id="twilio-account-sid" class="form-control" placeholder="Account SID">
                                        </div>
                                        <div class="col-md-6">
                                            <input type="password" id="twilio-auth-token" class="form-control" placeholder="Auth Token">
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <input type="text" id="twilio-phone-number" class="form-control" placeholder="Número de Telefone">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Configurações Asterisk</label>
                                    <div class="row mb-2">
                                        <div class="col-md-6">
                                            <input type="text" id="asterisk-url" class="form-control" placeholder="URL do servidor">
                                        </div>
                                        <div class="col-md-6">
                                            <input type="text" id="asterisk-context" class="form-control" placeholder="Contexto">
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <input type="text" id="asterisk-username" class="form-control" placeholder="Usuário">
                                        </div>
                                        <div class="col-md-6">
                                            <input type="password" id="asterisk-password" class="form-control" placeholder="Senha">
                                        </div>
                                    </div>
                                </div>
                                
                                <button type="submit" class="btn btn-primary">Salvar Configurações</button>
                            </form>
                        </div>
                        
                        <div class="settings-section">
                            <div class="settings-section-title">Troncos SIP</div>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Endereço</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Tronco 1</td>
                                        <td>sip.provedor1.com</td>
                                        <td><span class="badge bg-success">Ativo</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary">Editar</button>
                                            <button class="btn btn-sm btn-outline-danger">Excluir</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Tronco 2</td>
                                        <td>sip.provedor2.com</td>
                                        <td><span class="badge bg-success">Ativo</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary">Editar</button>
                                            <button class="btn btn-sm btn-outline-danger">Excluir</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Tronco 3</td>
                                        <td>sip.provedor3.com</td>
                                        <td><span class="badge bg-danger">Inativo</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary">Editar</button>
                                            <button class="btn btn-sm btn-outline-danger">Excluir</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <button class="btn btn-outline-primary">Adicionar Tronco</button>
                        </div>
                    </div>
                    
                    <!-- AI Settings -->
                    <div class="settings-panel" id="ai-settings">
                        <div class="settings-section">
                            <div class="settings-section-title">Configurações de IA</div>
                            <form id="ai-form">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="ai-provider" class="form-label">Provedor de IA</label>
                                        <select id="ai-provider" class="form-select">
                                            <option value="openai">OpenAI</option>
                                            <option value="google">Google AI</option>
                                            <option value="azure">Azure AI</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="ai-model" class="form-label">Modelo de IA</label>
                                        <select id="ai-model" class="form-select">
                                            <option value="gpt-4o">GPT-4o</option>
                                            <option value="gemini-pro">Gemini Pro</option>
                                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="openai-api-key" class="form-label">Chave de API OpenAI</label>
                                    <input type="password" id="openai-api-key" class="form-control">
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Configurações de Transcrição</label>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <select id="speech-to-text-provider" class="form-select">
                                                <option value="whisper">Whisper (OpenAI)</option>
                                                <option value="google">Google Speech-to-Text</option>
                                                <option value="azure">Azure Speech Services</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6">
                                            <select id="speech-to-text-language" class="form-select">
                                                <option value="pt-BR">Português (Brasil)</option>
                                                <option value="en-US">Inglês (EUA)</option>
                                                <option value="es-ES">Espanhol</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Configurações de Síntese de Voz</label>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <select id="text-to-speech-provider" class="form-select">
                                                <option value="google">Google Text-to-Speech</option>
                                                <option value="azure">Azure Speech Services</option>
                                                <option value="elevenlabs">ElevenLabs</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6">
                                            <select id="text-to-speech-voice" class="form-select">
                                                <option value="female-1">Feminina 1</option>
                                                <option value="female-2">Feminina 2</option>
                                                <option value="male-1">Masculina 1</option>
                                                <option value="male-2">Masculina 2</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <button type="submit" class="btn btn-primary">Salvar Configurações</button>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Integrations Settings -->
                    <div class="settings-panel" id="integrations-settings">
                        <div class="settings-section">
                            <div class="settings-section-title">Integrações</div>
                            
                            <div class="integration-item">
                                <div class="integration-header">
                                    <div class="integration-info">
                                        <h4>CRM</h4>
                                        <p>Conecte-se ao seu sistema de CRM para sincronizar leads e contatos.</p>
                                    </div>
                                    <div class="integration-status">
                                        <span class="badge bg-danger">Desconectado</span>
                                    </div>
                                </div>
                                <div class="integration-actions">
                                    <button class="btn btn-outline-primary">Conectar</button>
                                </div>
                            </div>
                            
                            <div class="integration-item">
                                <div class="integration-header">
                                    <div class="integration-info">
                                        <h4>WhatsApp Business API</h4>
                                        <p>Conecte-se à API do WhatsApp Business para mensagens.</p>
                                    </div>
                                    <div class="integration-status">
                                        <span class="badge bg-success">Conectado</span>
                                    </div>
                                </div>
                                <div class="integration-actions">
                                    <button class="btn btn-outline-danger">Desconectar</button>
                                    <button class="btn btn-outline-secondary">Configurar</button>
                                </div>
                            </div>
                            
                            <div class="integration-item">
                                <div class="integration-header">
                                    <div class="integration-info">
                                        <h4>Email Marketing</h4>
                                        <p>Conecte-se à sua plataforma de email marketing.</p>
                                    </div>
                                    <div class="integration-status">
                                        <span class="badge bg-danger">Desconectado</span>
                                    </div>
                                </div>
                                <div class="integration-actions">
                                    <button class="btn btn-outline-primary">Conectar</button>
                                </div>
                            </div>
                            
                            <div class="integration-item">
                                <div class="integration-header">
                                    <div class="integration-info">
                                        <h4>Calendário</h4>
                                        <p>Conecte-se ao Google Calendar ou Microsoft Outlook.</p>
                                    </div>
                                    <div class="integration-status">
                                        <span class="badge bg-danger">Desconectado</span>
                                    </div>
                                </div>
                                <div class="integration-actions">
                                    <button class="btn btn-outline-primary">Conectar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Notifications Settings -->
                    <div class="settings-panel" id="notifications-settings">
                        <div class="settings-section">
                            <div class="settings-section-title">Configurações de Notificações</div>
                            <form id="notifications-form">
                                <div class="mb-3">
                                    <label class="form-label">Notificações por Email</label>
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="email-new-lead" checked>
                                        <label class="form-check-label" for="email-new-lead">Novo lead criado</label>
                                    </div>
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="email-lead-qualified" checked>
                                        <label class="form-check-label" for="email-lead-qualified">Lead qualificado</label>
                                    </div>
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="email-missed-call">
                                        <label class="form-check-label" for="email-missed-call">Chamada perdida</label>
                                    </div>
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="email-daily-summary" checked>
                                        <label class="form-check-label" for="email-daily-summary">Resumo diário</label>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Notificações do Sistema</label>
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="system-new-message" checked>
                                        <label class="form-check-label" for="system-new-message">Nova mensagem recebida</label>
                                    </div>
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="system-incoming-call" checked>
                                        <label class="form-check-label" for="system-incoming-call">Chamada recebida</label>
                                    </div>
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="system-task-reminder" checked>
                                        <label class="form-check-label" for="system-task-reminder">Lembrete de tarefa</label>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Notificações por SMS</label>
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="sms-high-priority">
                                        <label class="form-check-label" for="sms-high-priority">Leads de alta prioridade</label>
                                    </div>
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="sms-missed-call">
                                        <label class="form-check-label" for="sms-missed-call">Chamadas perdidas</label>
                                    </div>
                                </div>
                                
                                <button type="submit" class="btn btn-primary">Salvar Configurações</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        // Tab switching
        const tabs = document.querySelectorAll('.settings-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
        
        // Profile form
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.saveProfile();
            });
        }
        
        // Password form
        const passwordForm = document.getElementById('password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.changePassword();
            });
        }
        
        // Telephony form
        const telephonyForm = document.getElementById('telephony-form');
        if (telephonyForm) {
            telephonyForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.saveTelephonySettings();
            });
        }
        
        // AI form
        const aiForm = document.getElementById('ai-form');
        if (aiForm) {
            aiForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.saveAISettings();
            });
        }
        
        // Notifications form
        const notificationsForm = document.getElementById('notifications-form');
        if (notificationsForm) {
            notificationsForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.saveNotificationSettings();
            });
        }
    }
    
    /**
     * Switch settings tab
     */
    switchTab(tabId) {
        // Update current tab
        this.currentTab = tabId;
        
        // Update active tab
        const tabs = document.querySelectorAll('.settings-tab');
        tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update active panel
        const panels = document.querySelectorAll('.settings-panel');
        panels.forEach(panel => {
            if (panel.id === `${tabId}-settings`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
    }
    
    /**
     * Load settings
     */
    async loadSettings() {
        try {
            // Load user profile
            await this.loadUserProfile();
            
            // Load other settings based on current tab
            switch (this.currentTab) {
                case 'telephony':
                    await this.loadTelephonySettings();
                    break;
                case 'ai':
                    await this.loadAISettings();
                    break;
                case 'integrations':
                    await this.loadIntegrationSettings();
                    break;
                case 'notifications':
                    await this.loadNotificationSettings();
                    break;
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    /**
     * Load user profile
     */
    async loadUserProfile() {
        try {
            // Get current user from store
            const user = window.store.state.currentUser;
            
            if (user) {
                // Set form values
                const nameInput = document.getElementById('profile-name');
                const emailInput = document.getElementById('profile-email');
                const phoneInput = document.getElementById('profile-phone');
                const jobTitleInput = document.getElementById('profile-job-title');
                
                if (nameInput) nameInput.value = user.name || '';
                if (emailInput) emailInput.value = user.email || '';
                if (phoneInput) phoneInput.value = user.phone || '';
                if (jobTitleInput) jobTitleInput.value = user.jobTitle || '';
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }
    
    /**
     * Load telephony settings
     */
    async loadTelephonySettings() {
        try {
            // In a real application, you would fetch telephony settings from API
            // const telephonySettings = await ApiService.getTelephonySettings();
            
            // Set form values
            // ...
        } catch (error) {
            console.error('Error loading telephony settings:', error);
        }
    }
    
    /**
     * Load AI settings
     */
    async loadAISettings() {
        try {
            // In a real application, you would fetch AI settings from API
            // const aiSettings = await ApiService.getAISettings();
            
            // Set form values
            // ...
        } catch (error) {
            console.error('Error loading AI settings:', error);
        }
    }
    
    /**
     * Load integration settings
     */
    async loadIntegrationSettings() {
        try {
            // In a real application, you would fetch integration settings from API
            // const integrationSettings = await ApiService.getIntegrationSettings();
            
            // Update integration status
            // ...
        } catch (error) {
            console.error('Error loading integration settings:', error);
        }
    }
    
    /**
     * Load notification settings
     */
    async loadNotificationSettings() {
        try {
            // In a real application, you would fetch notification settings from API
            // const notificationSettings = await ApiService.getNotificationSettings();
            
            // Set form values
            // ...
        } catch (error) {
            console.error('Error loading notification settings:', error);
        }
    }
    
    /**
     * Save user profile
     */
    async saveProfile() {
        try {
            // Get form values
            const name = document.getElementById('profile-name').value;
            const phone = document.getElementById('profile-phone').value;
            const jobTitle = document.getElementById('profile-job-title').value;
            
            // Validate form
            if (!name) {
                alert('Nome é obrigatório');
                return;
            }
            
            // In a real application, you would update user profile via API
            // await ApiService.updateUserProfile({ name, phone, jobTitle });
            
            // Update current user in store
            const currentUser = { ...window.store.state.currentUser, name, phone, jobTitle };
            window.store.setState({ currentUser });
            
            // Show notification
            window.store.setNotification('Perfil atualizado com sucesso', 'success');
        } catch (error) {
            console.error('Error saving profile:', error);
            window.store.setNotification('Erro ao atualizar perfil', 'danger');
        }
    }
    
    /**
     * Change password
     */
    async changePassword() {
        try {
            // Get form values
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validate form
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Todos os campos são obrigatórios');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('A nova senha e a confirmação não coincidem');
                return;
            }
            
            if (newPassword.length < 6) {
                alert('A nova senha deve ter pelo menos 6 caracteres');
                return;
            }
            
            // In a real application, you would update password via API
            // await ApiService.changePassword({ currentPassword, newPassword });
            
            // Clear form
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
            
            // Show notification
            window.store.setNotification('Senha alterada com sucesso', 'success');
        } catch (error) {
            console.error('Error changing password:', error);
            window.store.setNotification('Erro ao alterar senha', 'danger');
        }
    }
    
    /**
     * Save telephony settings
     */
    async saveTelephonySettings() {
        try {
            // Get form values
            const provider = document.getElementById('telephony-provider').value;
            const callerId = document.getElementById('default-caller-id').value;
            
            // Additional settings based on provider
            let providerSettings = {};
            
            if (provider === 'twilio') {
                providerSettings = {
                    accountSid: document.getElementById('twilio-account-sid').value,
                    authToken: document.getElementById('twilio-auth-token').value,
                    phoneNumber: document.getElementById('twilio-phone-number').value
                };
            } else if (provider === 'asterisk') {
                providerSettings = {
                    url: document.getElementById('asterisk-url').value,
                    context: document.getElementById('asterisk-context').value,
                    username: document.getElementById('asterisk-username').value,
                    password: document.getElementById('asterisk-password').value
                };
            }
            
            // In a real application, you would update settings via API
            // await ApiService.updateTelephonySettings({
            //     provider,
            //     callerId,
            //     providerSettings
            // });
            
            // Show notification
            window.store.setNotification('Configurações de telefonia atualizadas com sucesso', 'success');
        } catch (error) {
            console.error('Error saving telephony settings:', error);
            window.store.setNotification('Erro ao atualizar configurações de telefonia', 'danger');
        }
    }
    
    /**
     * Save AI settings
     */
    async saveAISettings() {
        try {
            // Get form values
            const provider = document.getElementById('ai-provider').value;
            const model = document.getElementById('ai-model').value;
            const openaiApiKey = document.getElementById('openai-api-key').value;
            const speechToTextProvider = document.getElementById('speech-to-text-provider').value;
            const speechToTextLanguage = document.getElementById('speech-to-text-language').value;
            const textToSpeechProvider = document.getElementById('text-to-speech-provider').value;
            const textToSpeechVoice = document.getElementById('text-to-speech-voice').value;
            
            // In a real application, you would update settings via API
            // await ApiService.updateAISettings({
            //     provider,
            //     model,
            //     openaiApiKey,
            //     speechToText: {
            //         provider: speechToTextProvider,
            //         language: speechToTextLanguage
            //     },
            //     textToSpeech: {
            //         provider: textToSpeechProvider,
            //         voice: textToSpeechVoice
            //     }
            // });
            
            // Show notification
            window.store.setNotification('Configurações de IA atualizadas com sucesso', 'success');
        } catch (error) {
            console.error('Error saving AI settings:', error);
            window.store.setNotification('Erro ao atualizar configurações de IA', 'danger');
        }
    }
    
    /**
     * Save notification settings
     */
    async saveNotificationSettings() {
        try {
            // Get form values
            const emailSettings = {
                newLead: document.getElementById('email-new-lead').checked,
                leadQualified: document.getElementById('email-lead-qualified').checked,
                missedCall: document.getElementById('email-missed-call').checked,
                dailySummary: document.getElementById('email-daily-summary').checked
            };
            
            const systemSettings = {
                newMessage: document.getElementById('system-new-message').checked,
                incomingCall: document.getElementById('system-incoming-call').checked,
                taskReminder: document.getElementById('system-task-reminder').checked
            };
            
            const smsSettings = {
                highPriority: document.getElementById('sms-high-priority').checked,
                missedCall: document.getElementById('sms-missed-call').checked
            };
            
            // In a real application, you would update settings via API
            // await ApiService.updateNotificationSettings({
            //     email: emailSettings,
            //     system: systemSettings,
            //     sms: smsSettings
            // });
            
            // Show notification
            window.store.setNotification('Configurações de notificação atualizadas com sucesso', 'success');
        } catch (error) {
            console.error('Error saving notification settings:', error);
            window.store.setNotification('Erro ao atualizar configurações de notificação', 'danger');
        }
    }
}

// Export the settings component
window.Settings = new Settings();
