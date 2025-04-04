/**
 * Settings Component
 * This component renders the settings page
 */

/**
 * Initialize the settings page
 */
function initSettings() {
    renderSettings();
    setupSettingsEvents();
    loadSettings();
}

/**
 * Render the settings HTML
 */
function renderSettings() {
    const settingsPage = document.getElementById('settings-page');
    
    settingsPage.innerHTML = `
        <h1 class="page-title">Configurações</h1>
        
        <div class="settings-tabs">
            <div class="settings-tab active" data-tab="general">Geral</div>
            <div class="settings-tab" data-tab="users">Usuários</div>
            <div class="settings-tab" data-tab="telephony">Telefonia</div>
            <div class="settings-tab" data-tab="channels">Canais</div>
            <div class="settings-tab" data-tab="ai">Inteligência Artificial</div>
            <div class="settings-tab" data-tab="integrations">Integrações</div>
        </div>
        
        <div class="tab-content">
            <!-- General Settings -->
            <div class="tab-pane active" id="general-settings">
                <div class="settings-section">
                    <h3 class="settings-section-title">Informações da Empresa</h3>
                    <form id="company-form">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="company-name" class="form-label">Nome da Empresa</label>
                                <input type="text" class="form-control" id="company-name">
                            </div>
                            <div class="col-md-6">
                                <label for="company-website" class="form-label">Website</label>
                                <input type="url" class="form-control" id="company-website">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="company-email" class="form-label">Email para Contato</label>
                                <input type="email" class="form-control" id="company-email">
                            </div>
                            <div class="col-md-6">
                                <label for="company-phone" class="form-label">Telefone para Contato</label>
                                <input type="tel" class="form-control" id="company-phone">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="company-address" class="form-label">Endereço</label>
                            <textarea class="form-control" id="company-address" rows="2"></textarea>
                        </div>
                    </form>
                </div>
                
                <div class="settings-section">
                    <h3 class="settings-section-title">Preferências do Sistema</h3>
                    <form id="preferences-form">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="default-language" class="form-label">Idioma Padrão</label>
                                <select class="form-select" id="default-language">
                                    <option value="pt_BR">Português (Brasil)</option>
                                    <option value="en_US">English (US)</option>
                                    <option value="es_ES">Español</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="timezone" class="form-label">Fuso Horário</label>
                                <select class="form-select" id="timezone">
                                    <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                                    <option value="America/New_York">New York (GMT-5)</option>
                                    <option value="Europe/London">London (GMT+0)</option>
                                    <option value="Europe/Paris">Paris (GMT+1)</option>
                                </select>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="date-format" class="form-label">Formato de Data</label>
                                <select class="form-select" id="date-format">
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="time-format" class="form-label">Formato de Hora</label>
                                <select class="form-select" id="time-format">
                                    <option value="24h">24 horas</option>
                                    <option value="12h">12 horas (AM/PM)</option>
                                </select>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="lead-numbering" class="form-label">Numeração de Leads</label>
                                <select class="form-select" id="lead-numbering">
                                    <option value="sequential">Sequencial</option>
                                    <option value="date-prefixed">Prefixo de Data</option>
                                    <option value="custom">Personalizado</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="notification-frequency" class="form-label">Frequência de Notificações</label>
                                <select class="form-select" id="notification-frequency">
                                    <option value="real-time">Tempo Real</option>
                                    <option value="hourly">A cada hora</option>
                                    <option value="daily">Diariamente</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div class="settings-section">
                    <h3 class="settings-section-title">Segurança</h3>
                    <form id="security-form">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="session-timeout" class="form-label">Tempo de Expiração da Sessão</label>
                                <select class="form-select" id="session-timeout">
                                    <option value="30">30 minutos</option>
                                    <option value="60">1 hora</option>
                                    <option value="120">2 horas</option>
                                    <option value="240">4 horas</option>
                                    <option value="480">8 horas</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="password-expiry" class="form-label">Expiração de Senha</label>
                                <select class="form-select" id="password-expiry">
                                    <option value="30">30 dias</option>
                                    <option value="60">60 dias</option>
                                    <option value="90">90 dias</option>
                                    <option value="0">Nunca</option>
                                </select>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="password-complexity" class="form-label">Complexidade de Senha</label>
                                <select class="form-select" id="password-complexity">
                                    <option value="low">Baixa (mínimo 6 caracteres)</option>
                                    <option value="medium">Média (mínimo 8 caracteres, letras e números)</option>
                                    <option value="high">Alta (mínimo 8 caracteres, letras, números e símbolos)</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="two-factor-auth" class="form-label">Autenticação de Dois Fatores</label>
                                <select class="form-select" id="two-factor-auth">
                                    <option value="disabled">Desativada</option>
                                    <option value="optional">Opcional para Usuários</option>
                                    <option value="required">Obrigatória para Todos</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div class="text-end mt-4">
                    <button type="button" class="btn btn-secondary me-2">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="save-general-settings">Salvar Alterações</button>
                </div>
            </div>
            
            <!-- Users Settings -->
            <div class="tab-pane" id="users-settings">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h3 class="settings-section-title">Gerenciar Usuários</h3>
                    <button type="button" class="btn btn-primary" id="add-user-btn">
                        <i class="fas fa-plus"></i> Adicionar Usuário
                    </button>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Cargo</th>
                                <th>Função</th>
                                <th>Status</th>
                                <th>Último Acesso</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="users-table-body">
                            <tr>
                                <td colspan="7" class="text-center">Carregando usuários...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Telephony Settings -->
            <div class="tab-pane" id="telephony-settings">
                <div class="settings-section">
                    <h3 class="settings-section-title">Configurações de Telefonia</h3>
                    <form id="telephony-form">
                        <div class="mb-3">
                            <label class="form-label">Provedor de Telefonia</label>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="telephony-provider" id="provider-asterisk" value="asterisk" checked>
                                <label class="form-check-label" for="provider-asterisk">Asterisk</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="telephony-provider" id="provider-twilio" value="twilio">
                                <label class="form-check-label" for="provider-twilio">Twilio</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="telephony-provider" id="provider-other" value="other">
                                <label class="form-check-label" for="provider-other">Outro</label>
                            </div>
                        </div>
                        
                        <div id="asterisk-settings">
                            <h5 class="mb-3">Configurações do Asterisk</h5>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="asterisk-host" class="form-label">Host</label>
                                    <input type="text" class="form-control" id="asterisk-host">
                                </div>
                                <div class="col-md-6">
                                    <label for="asterisk-port" class="form-label">Porta</label>
                                    <input type="text" class="form-control" id="asterisk-port">
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="asterisk-username" class="form-label">Usuário</label>
                                    <input type="text" class="form-control" id="asterisk-username">
                                </div>
                                <div class="col-md-6">
                                    <label for="asterisk-password" class="form-label">Senha</label>
                                    <input type="password" class="form-control" id="asterisk-password">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Troncos SIP</label>
                                <div class="card mb-2">
                                    <div class="card-body">
                                        <h6>Tronco 1</h6>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <label for="trunk1-name" class="form-label">Nome</label>
                                                <input type="text" class="form-control" id="trunk1-name">
                                            </div>
                                            <div class="col-md-6">
                                                <label for="trunk1-context" class="form-label">Contexto</label>
                                                <input type="text" class="form-control" id="trunk1-context">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="card mb-2">
                                    <div class="card-body">
                                        <h6>Tronco 2</h6>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <label for="trunk2-name" class="form-label">Nome</label>
                                                <input type="text" class="form-control" id="trunk2-name">
                                            </div>
                                            <div class="col-md-6">
                                                <label for="trunk2-context" class="form-label">Contexto</label>
                                                <input type="text" class="form-control" id="trunk2-context">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="card">
                                    <div class="card-body">
                                        <h6>Tronco 3</h6>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <label for="trunk3-name" class="form-label">Nome</label>
                                                <input type="text" class="form-control" id="trunk3-name">
                                            </div>
                                            <div class="col-md-6">
                                                <label for="trunk3-context" class="form-label">Contexto</label>
                                                <input type="text" class="form-control" id="trunk3-context">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div id="twilio-settings" style="display: none;">
                            <h5 class="mb-3">Configurações do Twilio</h5>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="twilio-account-sid" class="form-label">Account SID</label>
                                    <input type="text" class="form-control" id="twilio-account-sid">
                                </div>
                                <div class="col-md-6">
                                    <label for="twilio-auth-token" class="form-label">Auth Token</label>
                                    <input type="password" class="form-control" id="twilio-auth-token">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="twilio-phone-number" class="form-label">Número de Telefone</label>
                                <input type="text" class="form-control" id="twilio-phone-number">
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="call-recording" class="form-label">Gravação de Chamadas</label>
                            <select class="form-select" id="call-recording">
                                <option value="all">Gravar Todas as Chamadas</option>
                                <option value="outbound">Apenas Chamadas de Saída</option>
                                <option value="inbound">Apenas Chamadas de Entrada</option>
                                <option value="none">Não Gravar Chamadas</option>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label for="recording-retention" class="form-label">Retenção de Gravações</label>
                            <select class="form-select" id="recording-retention">
                                <option value="30">30 dias</option>
                                <option value="60">60 dias</option>
                                <option value="90">90 dias</option>
                                <option value="180">180 dias</option>
                                <option value="365">1 ano</option>
                            </select>
                        </div>
                    </form>
                </div>
                
                <div class="text-end mt-4">
                    <button type="button" class="btn btn-secondary me-2">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="save-telephony-settings">Salvar Alterações</button>
                </div>
            </div>
            
            <!-- Channels Settings -->
            <div class="tab-pane" id="channels-settings">
                <div class="settings-section">
                    <h3 class="settings-section-title">Canais de Comunicação</h3>
                    
                    <div class="card mb-4">
                        <div class="card-header">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="whatsapp-enabled" checked>
                                <label class="form-check-label" for="whatsapp-enabled">
                                    <i class="fab fa-whatsapp text-success"></i> WhatsApp
                                </label>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label class="form-label">API do WhatsApp</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="whatsapp-api" id="whatsapp-official" value="official" checked>
                                    <label class="form-check-label" for="whatsapp-official">API Oficial</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="whatsapp-api" id="whatsapp-evolution" value="evolution">
                                    <label class="form-check-label" for="whatsapp-evolution">Evolution API</label>
                                </div>
                            </div>
                            
                            <div id="whatsapp-official-settings">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="whatsapp-token" class="form-label">Token de Acesso</label>
                                        <input type="password" class="form-control" id="whatsapp-token">
                                    </div>
                                    <div class="col-md-6">
                                        <label for="whatsapp-phone-id" class="form-label">ID do Telefone</label>
                                        <input type="text" class="form-control" id="whatsapp-phone-id">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="whatsapp-webhook-url" class="form-label">URL do Webhook</label>
                                    <input type="text" class="form-control" id="whatsapp-webhook-url" readonly>
                                </div>
                            </div>
                            
                            <div id="whatsapp-evolution-settings" style="display: none;">
                                <div class="mb-3">
                                    <label for="evolution-api-url" class="form-label">URL da Evolution API</label>
                                    <input type="text" class="form-control" id="evolution-api-url">
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="evolution-api-key" class="form-label">API Key</label>
                                        <input type="password" class="form-control" id="evolution-api-key">
                                    </div>
                                    <div class="col-md-6">
                                        <label for="evolution-instance" class="form-label">Instância</label>
                                        <input type="text" class="form-control" id="evolution-instance">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mb-4">
                        <div class="card-header">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="sms-enabled" checked>
                                <label class="form-check-label" for="sms-enabled">
                                    <i class="fas fa-sms text-primary"></i> SMS
                                </label>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label class="form-label">Provedor de SMS</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="sms-provider" id="sms-twilio" value="twilio" checked>
                                    <label class="form-check-label" for="sms-twilio">Twilio</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="sms-provider" id="sms-other" value="other">
                                    <label class="form-check-label" for="sms-other">Outro</label>
                                </div>
                            </div>
                            
                            <div id="sms-twilio-settings">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="sms-account-sid" class="form-label">Account SID</label>
                                        <input type="text" class="form-control" id="sms-account-sid">
                                    </div>
                                    <div class="col-md-6">
                                        <label for="sms-auth-token" class="form-label">Auth Token</label>
                                        <input type="password" class="form-control" id="sms-auth-token">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="sms-phone-number" class="form-label">Número de Telefone</label>
                                    <input type="text" class="form-control" id="sms-phone-number">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mb-4">
                        <div class="card-header">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="email-enabled" checked>
                                <label class="form-check-label" for="email-enabled">
                                    <i class="fas fa-envelope text-warning"></i> Email
                                </label>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="smtp-host" class="form-label">Servidor SMTP</label>
                                    <input type="text" class="form-control" id="smtp-host">
                                </div>
                                <div class="col-md-6">
                                    <label for="smtp-port" class="form-label">Porta</label>
                                    <input type="text" class="form-control" id="smtp-port">
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="smtp-username" class="form-label">Usuário</label>
                                    <input type="text" class="form-control" id="smtp-username">
                                </div>
                                <div class="col-md-6">
                                    <label for="smtp-password" class="form-label">Senha</label>
                                    <input type="password" class="form-control" id="smtp-password">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="email-from" class="form-label">Email de Origem</label>
                                <input type="email" class="form-control" id="email-from">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="text-end mt-4">
                    <button type="button" class="btn btn-secondary me-2">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="save-channels-settings">Salvar Alterações</button>
                </div>
            </div>
            
            <!-- AI Settings -->
            <div class="tab-pane" id="ai-settings">
                <div class="settings-section">
                    <h3 class="settings-section-title">Configurações de Inteligência Artificial</h3>
                    
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="fas fa-brain text-primary"></i> Modelos de IA
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label class="form-label">Provedor de IA</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="ai-provider" id="ai-openai" value="openai" checked>
                                    <label class="form-check-label" for="ai-openai">OpenAI</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="ai-provider" id="ai-mistral" value="mistral">
                                    <label class="form-check-label" for="ai-mistral">Mistral AI</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="ai-provider" id="ai-llama" value="llama">
                                    <label class="form-check-label" for="ai-llama">Llama</label>
                                </div>
                            </div>
                            
                            <div id="openai-settings">
                                <div class="mb-3">
                                    <label for="openai-api-key" class="form-label">API Key</label>
                                    <input type="password" class="form-control" id="openai-api-key">
                                </div>
                                <div class="mb-3">
                                    <label for="openai-model" class="form-label">Modelo</label>
                                    <select class="form-select" id="openai-model">
                                        <option value="gpt-4o-mini">GPT-4o Mini</option>
                                        <option value="gpt-4o" selected>GPT-4o</option>
                                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div id="mistral-settings" style="display: none;">
                                <div class="mb-3">
                                    <label for="mistral-api-key" class="form-label">API Key</label>
                                    <input type="password" class="form-control" id="mistral-api-key">
                                </div>
                                <div class="mb-3">
                                    <label for="mistral-model" class="form-label">Modelo</label>
                                    <select class="form-select" id="mistral-model">
                                        <option value="mistral-tiny">Mistral Tiny</option>
                                        <option value="mistral-small">Mistral Small</option>
                                        <option value="mistral-medium" selected>Mistral Medium</option>
                                        <option value="mistral-large">Mistral Large</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div id="llama-settings" style="display: none;">
                                <div class="mb-3">
                                    <label for="llama-endpoint" class="form-label">Endpoint</label>
                                    <input type="text" class="form-control" id="llama-endpoint">
                                </div>
                                <div class="mb-3">
                                    <label for="llama-api-key" class="form-label">API Key</label>
                                    <input type="password" class="form-control" id="llama-api-key">
                                </div>
                                <div class="mb-3">
                                    <label for="llama-model" class="form-label">Modelo</label>
                                    <select class="form-select" id="llama-model">
                                        <option value="llama-3-8b">Llama 3 8B</option>
                                        <option value="llama-3-70b" selected>Llama 3 70B</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="fas fa-microphone text-danger"></i> Configurações de Fala
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label class="form-label">Provedor de Reconhecimento de Fala (STT)</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="stt-provider" id="stt-openai" value="openai" checked>
                                    <label class="form-check-label" for="stt-openai">OpenAI Whisper</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="stt-provider" id="stt-google" value="google">
                                    <label class="form-check-label" for="stt-google">Google Speech</label>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="stt-language" class="form-label">Idioma Principal</label>
                                <select class="form-select" id="stt-language">
                                    <option value="pt-BR">Português (Brasil)</option>
                                    <option value="en-US">English (US)</option>
                                    <option value="es-ES">Español</option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Provedor de Síntese de Fala (TTS)</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="tts-provider" id="tts-openai" value="openai" checked>
                                    <label class="form-check-label" for="tts-openai">OpenAI TTS</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="tts-provider" id="tts-google" value="google">
                                    <label class="form-check-label" for="tts-google">Google TTS</label>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="tts-voice" class="form-label">Voz Padrão</label>
                                <select class="form-select" id="tts-voice">
                                    <option value="alloy">Alloy (Neutra)</option>
                                    <option value="echo">Echo (Masculina)</option>
                                    <option value="fable">Fable (Jovem)</option>
                                    <option value="nova">Nova (Feminina)</option>
                                    <option value="shimmer">Shimmer (Profissional)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="fas fa-cogs text-secondary"></i> Parâmetros de IA
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label for="temperature" class="form-label">Temperature</label>
                                <div class="input-group">
                                    <input type="range" class="form-range" id="temperature" min="0" max="1" step="0.1" value="0.7">
                                    <span class="ms-2" id="temperature-value">0.7</span>
                                </div>
                                <small class="text-muted">Valores mais baixos são mais previsíveis, valores mais altos são mais criativos.</small>
                            </div>
                            
                            <div class="mb-3">
                                <label for="max-tokens" class="form-label">Comprimento Máximo</label>
                                <input type="number" class="form-control" id="max-tokens" value="1024">
                                <small class="text-muted">Número máximo de tokens a serem gerados.</small>
                            </div>
                            
                            <div class="mb-3">
                                <label for="context-messages" class="form-label">Mensagens de Contexto</label>
                                <input type="number" class="form-control" id="context-messages" value="10">
                                <small class="text-muted">Número de mensagens anteriores a serem incluídas no contexto.</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="text-end mt-4">
                    <button type="button" class="btn btn-secondary me-2">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="save-ai-settings">Salvar Alterações</button>
                </div>
            </div>
            
            <!-- Integrations Settings -->
            <div class="tab-pane" id="integrations-settings">
                <div class="settings-section">
                    <h3 class="settings-section-title">Integrações</h3>
                    
                    <div class="card mb-4">
                        <div class="card-header">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="crm-enabled">
                                <label class="form-check-label" for="crm-enabled">
                                    <i class="fas fa-users text-primary"></i> CRM
                                </label>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label for="crm-provider" class="form-label">Provedor de CRM</label>
                                <select class="form-select" id="crm-provider">
                                    <option value="">Selecionar...</option>
                                    <option value="salesforce">Salesforce</option>
                                    <option value="hubspot">HubSpot</option>
                                    <option value="zoho">Zoho CRM</option>
                                    <option value="other">Outro</option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label for="crm-api-key" class="form-label">API Key</label>
                                <input type="password" class="form-control" id="crm-api-key">
                            </div>
                            
                            <div class="mb-3">
                                <label for="crm-url" class="form-label">URL da API</label>
                                <input type="text" class="form-control" id="crm-url">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Configurações de Sincronização</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="sync-leads" checked>
                                    <label class="form-check-label" for="sync-leads">
                                        Sincronizar Leads
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="sync-conversations" checked>
                                    <label class="form-check-label" for="sync-conversations">
                                        Sincronizar Conversas
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="sync-bidirectional">
                                    <label class="form-check-label" for="sync-bidirectional">
                                        Sincronização Bidirecional
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mb-4">
                        <div class="card-header">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="webhook-enabled">
                                <label class="form-check-label" for="webhook-enabled">
                                    <i class="fas fa-link text-warning"></i> Webhooks
                                </label>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label for="webhook-url" class="form-label">URL do Webhook</label>
                                <input type="text" class="form-control" id="webhook-url">
                            </div>
                            
                            <div class="mb-3">
                                <label for="webhook-secret" class="form-label">Secret</label>
                                <input type="password" class="form-control" id="webhook-secret">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Eventos</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="event-lead-created" checked>
                                    <label class="form-check-label" for="event-lead-created">
                                        Lead Criado
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="event-lead-updated" checked>
                                    <label class="form-check-label" for="event-lead-updated">
                                        Lead Atualizado
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="event-conversation-created" checked>
                                    <label class="form-check-label" for="event-conversation-created">
                                        Conversa Criada
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="event-message-received" checked>
                                    <label class="form-check-label" for="event-message-received">
                                        Mensagem Recebida
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="event-call-completed" checked>
                                    <label class="form-check-label" for="event-call-completed">
                                        Chamada Completada
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mb-4">
                        <div class="card-header">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="calendar-enabled">
                                <label class="form-check-label" for="calendar-enabled">
                                    <i class="fas fa-calendar-alt text-info"></i> Calendário
                                </label>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label for="calendar-provider" class="form-label">Provedor de Calendário</label>
                                <select class="form-select" id="calendar-provider">
                                    <option value="">Selecionar...</option>
                                    <option value="google">Google Calendar</option>
                                    <option value="office365">Office 365</option>
                                    <option value="calendly">Calendly</option>
                                    <option value="other">Outro</option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label for="calendar-api-key" class="form-label">API Key / Token</label>
                                <input type="password" class="form-control" id="calendar-api-key">
                            </div>
                            
                            <div class="mb-3">
                                <label for="calendar-id" class="form-label">ID do Calendário</label>
                                <input type="text" class="form-control" id="calendar-id">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="text-end mt-4">
                    <button type="button" class="btn btn-secondary me-2">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="save-integrations-settings">Salvar Alterações</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Set up settings page event listeners
 */
function setupSettingsEvents() {
    // Settings tabs
    const settingsTabs = document.querySelectorAll('.settings-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            settingsTabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            const tabName = tab.getAttribute('data-tab');
            tab.classList.add('active');
            document.getElementById(`${tabName}-settings`).classList.add('active');
        });
    });
    
    // Telephony provider radio buttons
    const providerRadios = document.querySelectorAll('input[name="telephony-provider"]');
    if (providerRadios.length > 0) {
        providerRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                document.getElementById('asterisk-settings').style.display = 'none';
                document.getElementById('twilio-settings').style.display = 'none';
                
                if (radio.value === 'asterisk') {
                    document.getElementById('asterisk-settings').style.display = 'block';
                } else if (radio.value === 'twilio') {
                    document.getElementById('twilio-settings').style.display = 'block';
                }
            });
        });
    }
    
    // WhatsApp API radio buttons
    const whatsappApiRadios = document.querySelectorAll('input[name="whatsapp-api"]');
    if (whatsappApiRadios.length > 0) {
        whatsappApiRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                document.getElementById('whatsapp-official-settings').style.display = 'none';
                document.getElementById('whatsapp-evolution-settings').style.display = 'none';
                
                if (radio.value === 'official') {
                    document.getElementById('whatsapp-official-settings').style.display = 'block';
                } else if (radio.value === 'evolution') {
                    document.getElementById('whatsapp-evolution-settings').style.display = 'block';
                }
            });
        });
    }
    
    // AI provider radio buttons
    const aiProviderRadios = document.querySelectorAll('input[name="ai-provider"]');
    if (aiProviderRadios.length > 0) {
        aiProviderRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                document.getElementById('openai-settings').style.display = 'none';
                document.getElementById('mistral-settings').style.display = 'none';
                document.getElementById('llama-settings').style.display = 'none';
                
                if (radio.value === 'openai') {
                    document.getElementById('openai-settings').style.display = 'block';
                } else if (radio.value === 'mistral') {
                    document.getElementById('mistral-settings').style.display = 'block';
                } else if (radio.value === 'llama') {
                    document.getElementById('llama-settings').style.display = 'block';
                }
            });
        });
    }
    
    // Temperature slider
    const temperatureSlider = document.getElementById('temperature');
    if (temperatureSlider) {
        temperatureSlider.addEventListener('input', () => {
            document.getElementById('temperature-value').textContent = temperatureSlider.value;
        });
    }
    
    // Save buttons
    const saveGeneralBtn = document.getElementById('save-general-settings');
    if (saveGeneralBtn) {
        saveGeneralBtn.addEventListener('click', () => {
            alert('Configurações gerais salvas com sucesso!');
        });
    }
    
    const saveTelephonyBtn = document.getElementById('save-telephony-settings');
    if (saveTelephonyBtn) {
        saveTelephonyBtn.addEventListener('click', () => {
            alert('Configurações de telefonia salvas com sucesso!');
        });
    }
    
    const saveChannelsBtn = document.getElementById('save-channels-settings');
    if (saveChannelsBtn) {
        saveChannelsBtn.addEventListener('click', () => {
            alert('Configurações de canais salvas com sucesso!');
        });
    }
    
    const saveAiBtn = document.getElementById('save-ai-settings');
    if (saveAiBtn) {
        saveAiBtn.addEventListener('click', () => {
            alert('Configurações de IA salvas com sucesso!');
        });
    }
    
    const saveIntegrationsBtn = document.getElementById('save-integrations-settings');
    if (saveIntegrationsBtn) {
        saveIntegrationsBtn.addEventListener('click', () => {
            alert('Configurações de integrações salvas com sucesso!');
        });
    }
    
    // Add user button
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            alert('Funcionalidade de adicionar usuário será implementada em breve.');
        });
    }
}

/**
 * Load settings data
 */
function loadSettings() {
    // For demonstration, load sample user data
    loadUserData();
    
    // In a real app, you would fetch all settings from your API
    // and populate the form fields
}

/**
 * Load user data for the users table
 */
function loadUserData() {
    // Mock user data
    const users = [
        {
            id: 1,
            name: 'Admin User',
            email: 'admin@voiceai.com',
            job_title: 'Administrador',
            role: 'admin',
            status: 'active',
            last_login: '2023-03-18T09:45:00Z'
        },
        {
            id: 2,
            name: 'Ana Silva',
            email: 'ana.silva@voiceai.com',
            job_title: 'Gerente de Vendas',
            role: 'manager',
            status: 'active',
            last_login: '2023-03-17T14:30:00Z'
        },
        {
            id: 3,
            name: 'Carlos Oliveira',
            email: 'carlos.oliveira@voiceai.com',
            job_title: 'Agente de Vendas',
            role: 'agent',
            status: 'active',
            last_login: '2023-03-18T11:20:00Z'
        },
        {
            id: 4,
            name: 'Juliana Santos',
            email: 'juliana.santos@voiceai.com',
            job_title: 'Agente de Vendas Sênior',
            role: 'agent',
            status: 'active',
            last_login: '2023-03-17T16:15:00Z'
        },
        {
            id: 5,
            name: 'Pedro Almeida',
            email: 'pedro.almeida@voiceai.com',
            job_title: 'Agente de Suporte',
            role: 'agent',
            status: 'inactive',
            last_login: '2023-03-10T09:30:00Z'
        }
    ];
    
    // Populate users table
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = users.map(user => {
        // Format the last login date
        const lastLogin = new Date(user.last_login);
        const formattedDate = `${lastLogin.toLocaleDateString('pt-BR')} ${lastLogin.toLocaleTimeString('pt-BR')}`;
        
        // Get role display text
        let roleText;
        switch (user.role) {
            case 'admin': roleText = 'Administrador'; break;
            case 'manager': roleText = 'Gerente'; break;
            case 'agent': roleText = 'Agente'; break;
            default: roleText = user.role;
        }
        
        // Get status badge
        const statusBadge = user.status === 'active' 
            ? '<span class="badge bg-success">Ativo</span>' 
            : '<span class="badge bg-secondary">Inativo</span>';
        
        return `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.job_title}</td>
                <td>${roleText}</td>
                <td>${statusBadge}</td>
                <td>${formattedDate}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary edit-user-btn" data-user-id="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-user-btn" data-user-id="${user.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Add event listeners to user action buttons
    document.querySelectorAll('.edit-user-btn').forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-user-id');
            alert(`Editar usuário ${userId} - Funcionalidade será implementada em breve.`);
        });
    });
    
    document.querySelectorAll('.delete-user-btn').forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-user-id');
            if (confirm(`Tem certeza que deseja excluir o usuário ${userId}?`)) {
                alert(`Funcionalidade será implementada em breve.`);
            }
        });
    });
}
