/**
 * Integration Component
 * Handles external integrations with Make, n8n, and other platforms
 */

// Use global API and showToast function
// Removed imports to avoid ES module errors

// Main container for integration component
let integrationContainer;

// Integration platforms
const integrationPlatforms = [
    {
        id: 'make',
        name: 'Make',
        logo: '/img/integration/make-logo.svg',
        description: 'Automações visuais com fluxos de trabalho poderosos',
        website: 'https://www.make.com',
        color: '#8e44ef'
    },
    {
        id: 'n8n',
        name: 'n8n',
        logo: '/img/integration/n8n-logo.svg',
        description: 'Fluxos de trabalho automatizados com código aberto',
        website: 'https://n8n.io',
        color: '#ff6d5a'
    },
    {
        id: 'zapier',
        name: 'Zapier',
        logo: '/img/integration/zapier-logo.svg',
        description: 'Conecte apps e automatize fluxos de trabalho',
        website: 'https://zapier.com',
        color: '#ff4a00'
    },
    {
        id: 'integromat',
        name: 'Integromat',
        logo: '/img/integration/integromat-logo.svg',
        description: 'Conecte aplicativos e serviços complexos',
        website: 'https://www.integromat.com',
        color: '#2e8ae6'
    }
];

// Available webhook triggers
const webhookTriggers = [
    {
        id: 'new_lead',
        name: 'Novo Lead',
        description: 'Dispara quando um novo lead é criado',
        fields: [
            'id', 'name', 'company', 'phone', 'email', 'status', 'score', 'source', 'created_at'
        ]
    },
    {
        id: 'lead_status_change',
        name: 'Mudança de Status de Lead',
        description: 'Dispara quando o status de um lead é alterado',
        fields: [
            'id', 'name', 'old_status', 'new_status', 'changed_at', 'changed_by'
        ]
    },
    {
        id: 'new_call',
        name: 'Nova Chamada',
        description: 'Dispara quando uma nova chamada é registrada',
        fields: [
            'id', 'lead_id', 'lead_name', 'agent_id', 'agent_name', 'direction', 'status', 'start_time', 'duration'
        ]
    },
    {
        id: 'call_completed',
        name: 'Chamada Concluída',
        description: 'Dispara quando uma chamada é concluída',
        fields: [
            'id', 'lead_id', 'lead_name', 'agent_id', 'agent_name', 'direction', 'status', 'start_time', 'end_time', 'duration', 'recording_url', 'transcript'
        ]
    },
    {
        id: 'new_message',
        name: 'Nova Mensagem',
        description: 'Dispara quando uma nova mensagem é recebida',
        fields: [
            'id', 'conversation_id', 'lead_id', 'lead_name', 'sender_type', 'content', 'message_type', 'created_at'
        ]
    },
    {
        id: 'campaign_started',
        name: 'Campanha Iniciada',
        description: 'Dispara quando uma campanha é iniciada',
        fields: [
            'id', 'name', 'description', 'status', 'target_leads', 'start_date'
        ]
    },
    {
        id: 'campaign_ended',
        name: 'Campanha Encerrada',
        description: 'Dispara quando uma campanha é encerrada',
        fields: [
            'id', 'name', 'description', 'status', 'target_leads', 'start_date', 'end_date', 'total_leads', 'success_rate'
        ]
    },
    {
        id: 'callback_scheduled',
        name: 'Retorno Agendado',
        description: 'Dispara quando um retorno é agendado',
        fields: [
            'id', 'lead_id', 'lead_name', 'agent_id', 'agent_name', 'scheduled_at', 'notes', 'status'
        ]
    }
];

// API actions that can be called from external platforms
const apiActions = [
    {
        id: 'create_lead',
        name: 'Criar Lead',
        description: 'Cria um novo lead no sistema',
        method: 'POST',
        endpoint: '/api/leads',
        params: [
            { name: 'name', type: 'string', required: true, description: 'Nome do lead' },
            { name: 'company', type: 'string', required: false, description: 'Empresa do lead' },
            { name: 'phone', type: 'string', required: true, description: 'Telefone do lead' },
            { name: 'email', type: 'string', required: false, description: 'Email do lead' },
            { name: 'status', type: 'string', required: false, description: 'Status inicial do lead' },
            { name: 'score', type: 'number', required: false, description: 'Pontuação inicial do lead' },
            { name: 'source', type: 'string', required: false, description: 'Origem do lead' }
        ]
    },
    {
        id: 'update_lead',
        name: 'Atualizar Lead',
        description: 'Atualiza um lead existente',
        method: 'PUT',
        endpoint: '/api/leads/:id',
        params: [
            { name: 'id', type: 'number', required: true, description: 'ID do lead', path: true },
            { name: 'name', type: 'string', required: false, description: 'Nome do lead' },
            { name: 'company', type: 'string', required: false, description: 'Empresa do lead' },
            { name: 'phone', type: 'string', required: false, description: 'Telefone do lead' },
            { name: 'email', type: 'string', required: false, description: 'Email do lead' },
            { name: 'status', type: 'string', required: false, description: 'Status do lead' },
            { name: 'score', type: 'number', required: false, description: 'Pontuação do lead' }
        ]
    },
    {
        id: 'get_lead',
        name: 'Obter Lead',
        description: 'Obtém informações de um lead específico',
        method: 'GET',
        endpoint: '/api/leads/:id',
        params: [
            { name: 'id', type: 'number', required: true, description: 'ID do lead', path: true }
        ]
    },
    {
        id: 'initiate_call',
        name: 'Iniciar Chamada',
        description: 'Inicia uma chamada para um lead',
        method: 'POST',
        endpoint: '/api/calls',
        params: [
            { name: 'lead_id', type: 'number', required: true, description: 'ID do lead' },
            { name: 'agent_id', type: 'number', required: true, description: 'ID do agente' },
            { name: 'use_ai', type: 'boolean', required: false, description: 'Usar IA para a chamada' }
        ]
    },
    {
        id: 'send_message',
        name: 'Enviar Mensagem',
        description: 'Envia uma mensagem para um lead',
        method: 'POST',
        endpoint: '/api/conversations/:id/messages',
        params: [
            { name: 'id', type: 'number', required: true, description: 'ID da conversa', path: true },
            { name: 'content', type: 'string', required: true, description: 'Conteúdo da mensagem' },
            { name: 'sender_type', type: 'string', required: true, description: 'Tipo de remetente (system, agent, ai)' },
            { name: 'sender_id', type: 'number', required: false, description: 'ID do remetente (se for agent)' },
            { name: 'message_type', type: 'string', required: false, description: 'Tipo de mensagem (text, image, file)' }
        ]
    },
    {
        id: 'schedule_callback',
        name: 'Agendar Retorno',
        description: 'Agenda um retorno para um lead',
        method: 'POST',
        endpoint: '/api/callbacks',
        params: [
            { name: 'lead_id', type: 'number', required: true, description: 'ID do lead' },
            { name: 'agent_id', type: 'number', required: true, description: 'ID do agente' },
            { name: 'scheduled_at', type: 'string', required: true, description: 'Data e hora agendada (ISO)' },
            { name: 'notes', type: 'string', required: false, description: 'Notas sobre o retorno' }
        ]
    },
    {
        id: 'create_note',
        name: 'Criar Nota',
        description: 'Adiciona uma nota a um lead',
        method: 'POST',
        endpoint: '/api/leads/:id/notes',
        params: [
            { name: 'id', type: 'number', required: true, description: 'ID do lead', path: true },
            { name: 'user_id', type: 'number', required: true, description: 'ID do usuário criando a nota' },
            { name: 'content', type: 'string', required: true, description: 'Conteúdo da nota' },
            { name: 'note_type', type: 'string', required: false, description: 'Tipo de nota (general, call, meeting, task)' }
        ]
    }
];

/**
 * Initialize integration component
 */
function initIntegration() {
    // Create main container
    integrationContainer = document.createElement('div');
    integrationContainer.className = 'container-fluid';
    integrationContainer.innerHTML = `
        <div class="d-sm-flex align-items-center justify-content-between mb-4">
            <h1 class="h3 mb-0 text-gray-800">Integrações</h1>
            <button class="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm" id="help-integration-btn">
                <i class="fas fa-question-circle fa-sm text-white-50 me-1"></i> Ajuda
            </button>
        </div>

        <div class="row">
            <div class="col-xl-12 col-lg-12">
                <div class="card shadow mb-4">
                    <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 class="m-0 font-weight-bold text-primary">Plataformas de Integração</h6>
                        <a href="#" id="refresh-platforms-btn" class="btn btn-sm btn-circle btn-light">
                            <i class="fas fa-sync-alt"></i>
                        </a>
                    </div>
                    <div class="card-body">
                        <div class="row integration-platforms">
                            ${integrationPlatforms.map(platform => `
                                <div class="col-xl-3 col-md-6 mb-4">
                                    <div class="card platform-card h-100" data-platform="${platform.id}">
                                        <div class="card-body">
                                            <div class="platform-logo mb-3" style="background-color: ${platform.color}20;">
                                                <img src="${platform.logo}" alt="${platform.name}" width="48" height="48">
                                            </div>
                                            <div class="platform-name">${platform.name}</div>
                                            <div class="platform-description">${platform.description}</div>
                                        </div>
                                        <div class="card-footer d-flex justify-content-between">
                                            <a href="${platform.website}" target="_blank" class="btn btn-sm btn-outline-secondary">
                                                <i class="fas fa-external-link-alt me-1"></i> Site
                                            </a>
                                            <button class="btn btn-sm btn-primary configure-platform-btn" data-platform="${platform.id}">
                                                <i class="fas fa-cog me-1"></i> Configurar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-xl-12 col-lg-12">
                <div class="card shadow mb-4">
                    <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 class="m-0 font-weight-bold text-primary">Webhooks Configurados</h6>
                        <button class="btn btn-sm btn-primary" id="add-webhook-btn">
                            <i class="fas fa-plus fa-sm me-1"></i> Novo Webhook
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered" id="webhooks-table">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Evento</th>
                                        <th>URL</th>
                                        <th>Plataforma</th>
                                        <th>Status</th>
                                        <th>Últimos disparos</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Sample data, replace with actual data -->
                                    <tr>
                                        <td>Novos Leads para CRM</td>
                                        <td>Novo Lead</td>
                                        <td><span class="text-truncate d-inline-block" style="max-width: 200px;">https://hook.make.com/abcdefghijklmnopqrst</span></td>
                                        <td><span class="badge" style="background-color: #8e44ef;">Make</span></td>
                                        <td><span class="badge bg-success">Ativo</span></td>
                                        <td>145 (95% sucesso)</td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-primary">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-outline-danger">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                                <button class="btn btn-outline-secondary">
                                                    <i class="fas fa-history"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Chamadas Completas para n8n</td>
                                        <td>Chamada Concluída</td>
                                        <td><span class="text-truncate d-inline-block" style="max-width: 200px;">https://n8n.meudominio.com/webhook/xyz123</span></td>
                                        <td><span class="badge" style="background-color: #ff6d5a;">n8n</span></td>
                                        <td><span class="badge bg-success">Ativo</span></td>
                                        <td>78 (100% sucesso)</td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-primary">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-outline-danger">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                                <button class="btn btn-outline-secondary">
                                                    <i class="fas fa-history"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-xl-12 col-lg-12">
                <div class="card shadow mb-4">
                    <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 class="m-0 font-weight-bold text-primary">API Actions</h6>
                        <div class="dropdown no-arrow">
                            <a class="dropdown-toggle" href="#" role="button" id="apiActionsDropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="apiActionsDropdown">
                                <a class="dropdown-item" href="#" id="generate-api-docs-btn">
                                    <i class="fas fa-file-alt fa-sm fa-fw me-2 text-gray-400"></i>
                                    Gerar Documentação
                                </a>
                                <a class="dropdown-item" href="#" id="view-api-logs-btn">
                                    <i class="fas fa-list fa-sm fa-fw me-2 text-gray-400"></i>
                                    Ver Logs de API
                                </a>
                                <div class="dropdown-divider"></div>
                                <a class="dropdown-item" href="#" id="regenerate-api-key-btn">
                                    <i class="fas fa-key fa-sm fa-fw me-2 text-gray-400"></i>
                                    Regerar Chave API
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="alert alert-info mb-4">
                            <div class="d-flex">
                                <div class="me-3">
                                    <i class="fas fa-info-circle fa-2x"></i>
                                </div>
                                <div>
                                    <h5 class="alert-heading">Chave API</h5>
                                    <p class="mb-0">Use esta chave para autenticar chamadas externas à API da VoiceAI.</p>
                                    <div class="api-key-container mt-2">
                                        <div class="input-group">
                                            <input type="password" class="form-control bg-light border-0 small" id="api-key-display" value="••••••••••••••••••••••••••••••••" readonly>
                                            <button class="btn btn-outline-secondary" type="button" id="toggle-api-key-btn">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button class="btn btn-outline-secondary" type="button" id="copy-api-key-btn">
                                                <i class="fas fa-copy"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <ul class="nav nav-tabs" id="apiActionsTabs" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="available-actions-tab" data-bs-toggle="tab" data-bs-target="#available-actions" type="button" role="tab" aria-controls="available-actions" aria-selected="true">Ações Disponíveis</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="usage-examples-tab" data-bs-toggle="tab" data-bs-target="#usage-examples" type="button" role="tab" aria-controls="usage-examples" aria-selected="false">Exemplos de Uso</button>
                            </li>
                        </ul>
                        
                        <div class="tab-content pt-3" id="apiActionsTabsContent">
                            <div class="tab-pane fade show active" id="available-actions" role="tabpanel" aria-labelledby="available-actions-tab">
                                <div class="accordion" id="api-actions-accordion">
                                    ${apiActions.map((action, index) => `
                                        <div class="accordion-item">
                                            <h2 class="accordion-header">
                                                <button class="accordion-button ${index > 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#action-${action.id}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="action-${action.id}">
                                                    <span class="badge me-2" style="background-color: ${getMethodColor(action.method)};">${action.method}</span>
                                                    ${action.name}
                                                </button>
                                            </h2>
                                            <div id="action-${action.id}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#api-actions-accordion">
                                                <div class="accordion-body">
                                                    <p>${action.description}</p>
                                                    <div class="endpoint mb-3">
                                                        <strong>Endpoint:</strong> <code>${action.endpoint}</code>
                                                    </div>
                                                    <div class="parameters mb-3">
                                                        <strong>Parâmetros:</strong>
                                                        <table class="table table-sm table-bordered mt-2">
                                                            <thead>
                                                                <tr>
                                                                    <th>Nome</th>
                                                                    <th>Tipo</th>
                                                                    <th>Obrigatório</th>
                                                                    <th>Descrição</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                ${action.params.map(param => `
                                                                    <tr>
                                                                        <td>${param.name} ${param.path ? '<span class="badge bg-secondary">path</span>' : ''}</td>
                                                                        <td><code>${param.type}</code></td>
                                                                        <td>${param.required ? '<span class="badge bg-primary">Sim</span>' : '<span class="badge bg-secondary">Não</span>'}</td>
                                                                        <td>${param.description}</td>
                                                                    </tr>
                                                                `).join('')}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div class="try-it-out">
                                                        <button class="btn btn-sm btn-primary try-api-action-btn" data-action-id="${action.id}">
                                                            <i class="fas fa-play me-1"></i> Testar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="tab-pane fade" id="usage-examples" role="tabpanel" aria-labelledby="usage-examples-tab">
                                <div class="code-examples">
                                    <ul class="nav nav-pills mb-3" id="code-examples-tabs" role="tablist">
                                        <li class="nav-item" role="presentation">
                                            <button class="nav-link active" id="curl-tab" data-bs-toggle="pill" data-bs-target="#curl-example" type="button" role="tab" aria-controls="curl-example" aria-selected="true">cURL</button>
                                        </li>
                                        <li class="nav-item" role="presentation">
                                            <button class="nav-link" id="javascript-tab" data-bs-toggle="pill" data-bs-target="#javascript-example" type="button" role="tab" aria-controls="javascript-example" aria-selected="false">JavaScript</button>
                                        </li>
                                        <li class="nav-item" role="presentation">
                                            <button class="nav-link" id="python-tab" data-bs-toggle="pill" data-bs-target="#python-example" type="button" role="tab" aria-controls="python-example" aria-selected="false">Python</button>
                                        </li>
                                        <li class="nav-item" role="presentation">
                                            <button class="nav-link" id="php-tab" data-bs-toggle="pill" data-bs-target="#php-example" type="button" role="tab" aria-controls="php-example" aria-selected="false">PHP</button>
                                        </li>
                                    </ul>
                                    
                                    <div class="tab-content" id="code-examples-content">
                                        <div class="tab-pane fade show active" id="curl-example" role="tabpanel" aria-labelledby="curl-tab">
                                            <pre class="code-block"><code>curl -X POST "https://api.voiceai.com/api/leads" \\
     -H "Content-Type: application/json" \\
     -H "Authorization: Bearer YOUR_API_KEY" \\
     -d '{
       "name": "João Silva",
       "company": "Empresa ABC",
       "phone": "+5511987654321",
       "email": "joao@empresa.com",
       "status": "new",
       "source": "website"
     }'</code></pre>
                                            <button class="btn btn-sm btn-outline-secondary copy-code-btn" data-code-block="curl-example">
                                                <i class="fas fa-copy me-1"></i> Copiar
                                            </button>
                                        </div>
                                        
                                        <div class="tab-pane fade" id="javascript-example" role="tabpanel" aria-labelledby="javascript-tab">
                                            <pre class="code-block"><code>// Usando fetch API
const apiKey = 'YOUR_API_KEY';
const apiUrl = 'https://api.voiceai.com/api/leads';

fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${apiKey}\`
  },
  body: JSON.stringify({
    name: 'João Silva',
    company: 'Empresa ABC',
    phone: '+5511987654321',
    email: 'joao@empresa.com',
    status: 'new',
    source: 'website'
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));</code></pre>
                                            <button class="btn btn-sm btn-outline-secondary copy-code-btn" data-code-block="javascript-example">
                                                <i class="fas fa-copy me-1"></i> Copiar
                                            </button>
                                        </div>
                                        
                                        <div class="tab-pane fade" id="python-example" role="tabpanel" aria-labelledby="python-tab">
                                            <pre class="code-block"><code>import requests
import json

api_key = 'YOUR_API_KEY'
api_url = 'https://api.voiceai.com/api/leads'

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {api_key}'
}

data = {
    'name': 'João Silva',
    'company': 'Empresa ABC',
    'phone': '+5511987654321',
    'email': 'joao@empresa.com',
    'status': 'new',
    'source': 'website'
}

response = requests.post(api_url, headers=headers, json=data)
print(response.json())</code></pre>
                                            <button class="btn btn-sm btn-outline-secondary copy-code-btn" data-code-block="python-example">
                                                <i class="fas fa-copy me-1"></i> Copiar
                                            </button>
                                        </div>
                                        
                                        <div class="tab-pane fade" id="php-example" role="tabpanel" aria-labelledby="php-tab">
                                            <pre class="code-block"><code>&lt;?php
$apiKey = 'YOUR_API_KEY';
$apiUrl = 'https://api.voiceai.com/api/leads';

$data = [
    'name' => 'João Silva',
    'company' => 'Empresa ABC',
    'phone' => '+5511987654321',
    'email' => 'joao@empresa.com',
    'status' => 'new',
    'source' => 'website'
];

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);
?&gt;</code></pre>
                                            <button class="btn btn-sm btn-outline-secondary copy-code-btn" data-code-block="php-example">
                                                <i class="fas fa-copy me-1"></i> Copiar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
        .platform-card {
            transition: all 0.2s;
            border: 1px solid #e3e6f0;
        }
        
        .platform-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }
        
        .platform-logo {
            width: 64px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        
        .platform-name {
            font-weight: bold;
            font-size: 1.1rem;
            margin-bottom: 5px;
        }
        
        .platform-description {
            font-size: 0.8rem;
            color: #858796;
        }
        
        .code-block {
            background-color: #f8f9fc;
            border: 1px solid #e3e6f0;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 10px;
            overflow-x: auto;
        }
        
        .api-key-container {
            max-width: 500px;
        }
    `;
    document.head.appendChild(style);

    // Add event listeners
    setupIntegrationEvents();

    return integrationContainer;
}

/**
 * Setup integration event listeners
 */
function setupIntegrationEvents() {
    // Platform configuration
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.configure-platform-btn')) return;
        
        const btn = e.target.closest('.configure-platform-btn');
        const platformId = btn.getAttribute('data-platform');
        
        showPlatformConfiguration(platformId);
    });

    // Add webhook button
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'add-webhook-btn') return;
        
        showAddWebhookModal();
    });

    // Toggle API key visibility
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'toggle-api-key-btn' && !e.target.closest('#toggle-api-key-btn')) return;
        
        const apiKeyInput = document.getElementById('api-key-display');
        const toggleBtn = document.getElementById('toggle-api-key-btn');
        
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            apiKeyInput.value = 'vap_' + generateRandomString(32);
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            apiKeyInput.type = 'password';
            apiKeyInput.value = '••••••••••••••••••••••••••••••••';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    });

    // Copy API key
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'copy-api-key-btn' && !e.target.closest('#copy-api-key-btn')) return;
        
        const apiKeyInput = document.getElementById('api-key-display');
        const originalType = apiKeyInput.type;
        const originalValue = apiKeyInput.value;
        
        // Show the key if it's hidden
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            apiKeyInput.value = 'vap_' + generateRandomString(32);
        }
        
        // Copy to clipboard
        apiKeyInput.select();
        document.execCommand('copy');
        
        // Restore original state
        apiKeyInput.type = originalType;
        if (originalType === 'password') {
            apiKeyInput.value = originalValue;
        }
        
        // Show toast
        showToast('Chave API copiada para a área de transferência', 'success');
    });

    // Copy code examples
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.copy-code-btn')) return;
        
        const btn = e.target.closest('.copy-code-btn');
        const codeBlockId = btn.getAttribute('data-code-block');
        const codeBlock = document.querySelector(`#${codeBlockId} code`);
        
        // Create a temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = codeBlock.textContent;
        document.body.appendChild(textarea);
        
        // Copy to clipboard
        textarea.select();
        document.execCommand('copy');
        
        // Remove textarea
        document.body.removeChild(textarea);
        
        // Update button text temporarily
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check me-1"></i> Copiado!';
        
        // Restore original text after 2 seconds
        setTimeout(() => {
            btn.innerHTML = originalHtml;
        }, 2000);
    });

    // Try API action
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.try-api-action-btn')) return;
        
        const btn = e.target.closest('.try-api-action-btn');
        const actionId = btn.getAttribute('data-action-id');
        
        showTryApiActionModal(actionId);
    });

    // Regenerate API key
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'regenerate-api-key-btn') return;
        
        showRegenerateApiKeyConfirmation();
    });

    // View API logs
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'view-api-logs-btn') return;
        
        showApiLogs();
    });

    // Generate API docs
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'generate-api-docs-btn') return;
        
        generateApiDocs();
    });

    // Help button
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'help-integration-btn') return;
        
        showIntegrationHelp();
    });
}

/**
 * Show platform configuration modal
 * @param {string} platformId - ID of the platform to configure
 */
function showPlatformConfiguration(platformId) {
    // Find platform details
    const platform = integrationPlatforms.find(p => p.id === platformId);
    
    if (!platform) {
        console.error(`Platform not found: ${platformId}`);
        return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'platform-config-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'platform-config-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header" style="background-color: ${platform.color}10;">
                    <h5 class="modal-title" id="platform-config-modal-label">
                        <img src="${platform.logo}" alt="${platform.name}" width="24" height="24" class="me-2">
                        Configurar ${platform.name}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Configure as integrações entre a VoiceAI e ${platform.name}.
                    </div>
                    
                    <ul class="nav nav-tabs" id="platformConfigTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="platform-setup-tab" data-bs-toggle="tab" data-bs-target="#platform-setup" type="button" role="tab" aria-controls="platform-setup" aria-selected="true">Configuração</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="platform-webhooks-tab" data-bs-toggle="tab" data-bs-target="#platform-webhooks" type="button" role="tab" aria-controls="platform-webhooks" aria-selected="false">Webhooks</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="platform-templates-tab" data-bs-toggle="tab" data-bs-target="#platform-templates" type="button" role="tab" aria-controls="platform-templates" aria-selected="false">Templates</button>
                        </li>
                    </ul>
                    
                    <div class="tab-content pt-3" id="platformConfigTabsContent">
                        <div class="tab-pane fade show active" id="platform-setup" role="tabpanel" aria-labelledby="platform-setup-tab">
                            <h5>Conectar com ${platform.name}</h5>
                            <p>Siga as instruções abaixo para conectar a VoiceAI com ${platform.name}:</p>
                            
                            <div class="connection-steps mt-4">
                                <div class="connection-step">
                                    <div class="step-number">1</div>
                                    <div class="step-content">
                                        <div class="step-title">Criar uma conta no ${platform.name}</div>
                                        <div class="step-description">
                                            Se você ainda não tem uma conta no ${platform.name}, <a href="${platform.website}" target="_blank">cadastre-se aqui</a>.
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="connection-step">
                                    <div class="step-number">2</div>
                                    <div class="step-content">
                                        <div class="step-title">Copiar sua API Key da VoiceAI</div>
                                        <div class="step-description">
                                            Você vai precisar da sua API Key da VoiceAI para autenticar as requisições.
                                            <div class="input-group mt-2" style="max-width: 500px;">
                                                <input type="text" class="form-control" value="vap_${generateRandomString(8)}..." readonly>
                                                <button class="btn btn-outline-secondary" type="button">
                                                    <i class="fas fa-copy"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="connection-step">
                                    <div class="step-number">3</div>
                                    <div class="step-content">
                                        <div class="step-title">Criar um novo cenário/fluxo no ${platform.name}</div>
                                        <div class="step-description">
                                            ${getPlatformSpecificInstructions(platformId)}
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="connection-step">
                                    <div class="step-number">4</div>
                                    <div class="step-content">
                                        <div class="step-title">Testar a conexão</div>
                                        <div class="step-description">
                                            Após configurar a integração, você pode testá-la usando o botão abaixo:
                                            <button class="btn btn-primary mt-2" id="test-platform-connection-btn">
                                                <i class="fas fa-plug me-1"></i> Testar Conexão
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-pane fade" id="platform-webhooks" role="tabpanel" aria-labelledby="platform-webhooks-tab">
                            <h5>Webhooks para ${platform.name}</h5>
                            <p>Configure webhooks para enviar eventos da VoiceAI para o ${platform.name}.</p>
                            
                            <div class="platform-webhooks-container mt-3">
                                <div class="webhooks-list mb-3">
                                    <table class="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Evento</th>
                                                <th>URL do Webhook</th>
                                                <th>Status</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Novo Lead</td>
                                                <td>https://${platformId}.meudominio.com/webhook/leads</td>
                                                <td><span class="badge bg-success">Ativo</span></td>
                                                <td>
                                                    <button class="btn btn-sm btn-outline-danger">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div class="add-webhook-form">
                                    <h6>Adicionar novo webhook</h6>
                                    <div class="row g-3">
                                        <div class="col-md-5">
                                            <select class="form-select" id="webhook-event-select">
                                                <option value="">-- Selecione o evento --</option>
                                                ${webhookTriggers.map(trigger => `
                                                    <option value="${trigger.id}">${trigger.name}</option>
                                                `).join('')}
                                            </select>
                                        </div>
                                        <div class="col-md-5">
                                            <input type="text" class="form-control" id="webhook-url-input" placeholder="URL do webhook">
                                        </div>
                                        <div class="col-md-2">
                                            <button class="btn btn-primary w-100" id="add-webhook-to-platform-btn">
                                                <i class="fas fa-plus"></i> Adicionar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-pane fade" id="platform-templates" role="tabpanel" aria-labelledby="platform-templates-tab">
                            <h5>Templates para ${platform.name}</h5>
                            <p>Use estes templates prontos para acelerar suas integrações com ${platform.name}.</p>
                            
                            <div class="templates-list mt-3">
                                <div class="row">
                                    ${getPlatformTemplates(platformId).map(template => `
                                        <div class="col-md-6 mb-3">
                                            <div class="card h-100">
                                                <div class="card-body">
                                                    <h6 class="card-title">${template.name}</h6>
                                                    <p class="card-text small">${template.description}</p>
                                                </div>
                                                <div class="card-footer">
                                                    <button class="btn btn-sm btn-primary" data-template-id="${template.id}">
                                                        <i class="fas fa-download me-1"></i> Usar Template
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    <button type="button" class="btn btn-primary">Salvar Configurações</button>
                </div>
            </div>
        </div>
    `;
    
    // Add CSS for steps
    const style = document.createElement('style');
    style.textContent = `
        .connection-steps {
            position: relative;
        }
        
        .connection-steps::before {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            left: 14px;
            width: 2px;
            background-color: #e3e6f0;
            z-index: 0;
        }
        
        .connection-step {
            display: flex;
            margin-bottom: 20px;
            position: relative;
        }
        
        .step-number {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: ${platform.color};
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 15px;
            z-index: 1;
        }
        
        .step-content {
            flex: 1;
        }
        
        .step-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .step-description {
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(modal);
    
    // Show modal
    const bootstrapModal = new bootstrap.Modal(document.getElementById('platform-config-modal'));
    bootstrapModal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('platform-config-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
        document.head.removeChild(style);
    });
}

/**
 * Show add webhook modal
 */
function showAddWebhookModal() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'add-webhook-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'add-webhook-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="add-webhook-modal-label">
                        <i class="fas fa-plug me-2"></i>
                        Adicionar Novo Webhook
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Webhooks permitem que a VoiceAI envie dados para outras plataformas quando eventos específicos ocorrerem.
                    </div>
                    
                    <form id="add-webhook-form">
                        <div class="mb-3">
                            <label for="webhook-name-input" class="form-label">Nome do Webhook</label>
                            <input type="text" class="form-control" id="webhook-name-input" placeholder="Ex: Notificar CRM sobre novos leads">
                            <div class="form-text">Um nome descritivo para identificar este webhook.</div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="webhook-event-input" class="form-label">Evento</label>
                            <select class="form-select" id="webhook-event-input">
                                <option value="">-- Selecione o evento que vai disparar este webhook --</option>
                                ${webhookTriggers.map(trigger => `
                                    <option value="${trigger.id}">${trigger.name}</option>
                                `).join('')}
                            </select>
                            <div class="form-text">O evento que irá disparar este webhook.</div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="webhook-description-input" class="form-label">Descrição</label>
                            <textarea class="form-control" id="webhook-description-input" rows="2" placeholder="Explique o propósito deste webhook"></textarea>
                            <div class="form-text">Uma descrição opcional para explicar o propósito deste webhook.</div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-8">
                                <label for="webhook-url-input" class="form-label">URL do Webhook</label>
                                <input type="text" class="form-control" id="webhook-url-input" placeholder="https://...">
                                <div class="form-text">A URL que receberá os dados do evento.</div>
                            </div>
                            <div class="col-md-4">
                                <label for="webhook-platform-input" class="form-label">Plataforma</label>
                                <select class="form-select" id="webhook-platform-input">
                                    <option value="">-- Selecione --</option>
                                    ${integrationPlatforms.map(platform => `
                                        <option value="${platform.id}">${platform.name}</option>
                                    `).join('')}
                                </select>
                                <div class="form-text">A plataforma que receberá os dados.</div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Configurações Avançadas</label>
                            <div class="card">
                                <div class="card-body">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="webhook-active-switch" checked>
                                                <label class="form-check-label" for="webhook-active-switch">Webhook ativo</label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="webhook-retry-switch" checked>
                                                <label class="form-check-label" for="webhook-retry-switch">Tentar novamente em caso de falha</label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="webhook-include-metadata-switch" checked>
                                                <label class="form-check-label" for="webhook-include-metadata-switch">Incluir metadados</label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="webhook-log-requests-switch" checked>
                                                <label class="form-check-label" for="webhook-log-requests-switch">Registrar requisições</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Campos a incluir no payload</label>
                            <div class="webhook-fields-container" id="webhook-fields-container">
                                <div class="alert alert-secondary">
                                    Selecione um evento para ver os campos disponíveis.
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="save-webhook-btn">Salvar Webhook</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    const bootstrapModal = new bootstrap.Modal(document.getElementById('add-webhook-modal'));
    bootstrapModal.show();
    
    // Event listener for event selection
    document.getElementById('webhook-event-input').addEventListener('change', function() {
        const eventId = this.value;
        if (!eventId) return;
        
        const event = webhookTriggers.find(e => e.id === eventId);
        if (!event) return;
        
        // Update fields container
        const fieldsContainer = document.getElementById('webhook-fields-container');
        fieldsContainer.innerHTML = `
            <div class="alert alert-info mb-3">
                <i class="fas fa-info-circle me-2"></i>
                Selecione os campos que você deseja incluir no payload do webhook.
            </div>
            <div class="row">
                ${event.fields.map(field => `
                    <div class="col-md-4 mb-2">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="field-${field}" name="webhook-fields[]" value="${field}" checked>
                            <label class="form-check-label" for="field-${field}">
                                ${field}
                            </label>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button type="button" class="btn btn-sm btn-link mt-2" id="select-all-fields-btn">Selecionar todos</button>
            <button type="button" class="btn btn-sm btn-link mt-2" id="deselect-all-fields-btn">Desmarcar todos</button>
        `;
        
        // Add event listeners for select/deselect all buttons
        document.getElementById('select-all-fields-btn').addEventListener('click', function() {
            document.querySelectorAll('input[name="webhook-fields[]"]').forEach(checkbox => {
                checkbox.checked = true;
            });
        });
        
        document.getElementById('deselect-all-fields-btn').addEventListener('click', function() {
            document.querySelectorAll('input[name="webhook-fields[]"]').forEach(checkbox => {
                checkbox.checked = false;
            });
        });
    });
    
    // Save webhook button
    document.getElementById('save-webhook-btn').addEventListener('click', function() {
        // Validate form
        const nameInput = document.getElementById('webhook-name-input');
        const eventInput = document.getElementById('webhook-event-input');
        const urlInput = document.getElementById('webhook-url-input');
        
        if (!nameInput.value.trim()) {
            showToast('Por favor, informe um nome para o webhook', 'error');
            nameInput.focus();
            return;
        }
        
        if (!eventInput.value) {
            showToast('Por favor, selecione um evento', 'error');
            eventInput.focus();
            return;
        }
        
        if (!urlInput.value.trim()) {
            showToast('Por favor, informe a URL do webhook', 'error');
            urlInput.focus();
            return;
        }
        
        // In a real app, we would submit the form to the API
        showToast('Webhook adicionado com sucesso!', 'success');
        
        // Close modal
        bootstrapModal.hide();
    });
    
    // Remove modal from DOM when hidden
    document.getElementById('add-webhook-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

/**
 * Show try API action modal
 * @param {string} actionId - ID of the API action to try
 */
function showTryApiActionModal(actionId) {
    // Find action details
    const action = apiActions.find(a => a.id === actionId);
    
    if (!action) {
        console.error(`Action not found: ${actionId}`);
        return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'try-api-action-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'try-api-action-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="try-api-action-modal-label">
                        <span class="badge me-2" style="background-color: ${getMethodColor(action.method)};">${action.method}</span>
                        ${action.name}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        ${action.description}
                    </div>
                    
                    <div class="endpoint mb-3">
                        <strong>Endpoint:</strong> <code>${action.endpoint}</code>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Parâmetros</label>
                        <div class="params-container">
                            ${action.params.map(param => `
                                <div class="mb-2">
                                    <label for="param-${param.name}" class="form-label">
                                        ${param.name}
                                        ${param.required ? '<span class="text-danger">*</span>' : ''}
                                        ${param.path ? '<span class="badge bg-secondary">path</span>' : ''}
                                    </label>
                                    <input type="${param.type === 'number' ? 'number' : 'text'}" class="form-control" id="param-${param.name}" placeholder="${param.description}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Cabeçalhos</label>
                        <div class="headers-container">
                            <div class="row">
                                <div class="col-md-5">
                                    <input type="text" class="form-control" placeholder="Nome" value="Content-Type" readonly>
                                </div>
                                <div class="col-md-7">
                                    <input type="text" class="form-control" placeholder="Valor" value="application/json" readonly>
                                </div>
                            </div>
                            <div class="row mt-2">
                                <div class="col-md-5">
                                    <input type="text" class="form-control" placeholder="Nome" value="Authorization" readonly>
                                </div>
                                <div class="col-md-7">
                                    <input type="text" class="form-control" placeholder="Valor" value="Bearer vap_..." readonly>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <button class="btn btn-primary" id="execute-api-action-btn">
                            <i class="fas fa-play me-1"></i> Executar
                        </button>
                    </div>
                    
                    <div class="response-container mt-4 d-none" id="api-response-container">
                        <label class="form-label">Resposta</label>
                        <div class="card">
                            <div class="card-header d-flex justify-content-between">
                                <div>
                                    <span class="badge bg-success">200 OK</span>
                                    <span class="ms-2">0.245s</span>
                                </div>
                                <button class="btn btn-sm btn-outline-secondary">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                            <div class="card-body">
                                <pre id="api-response-content">Clique em "Executar" para ver a resposta...</pre>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    const bootstrapModal = new bootstrap.Modal(document.getElementById('try-api-action-modal'));
    bootstrapModal.show();
    
    // Execute API action button
    document.getElementById('execute-api-action-btn').addEventListener('click', function() {
        // Show response container
        document.getElementById('api-response-container').classList.remove('d-none');
        
        // In a real app, we would call the API
        // For demo, show a sample response
        const responseContent = document.getElementById('api-response-content');
        
        // Show loading
        responseContent.textContent = 'Carregando...';
        
        // Simulate API call delay
        setTimeout(() => {
            // Get a sample response based on the action
            const response = getSampleApiResponse(action);
            
            // Update response content
            responseContent.textContent = JSON.stringify(response, null, 2);
        }, 1000);
    });
    
    // Remove modal from DOM when hidden
    document.getElementById('try-api-action-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

/**
 * Show regenerate API key confirmation
 */
function showRegenerateApiKeyConfirmation() {
    // Create confirmation modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'regenerate-api-key-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'regenerate-api-key-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="regenerate-api-key-modal-label">
                        <i class="fas fa-key me-2"></i>
                        Regerar Chave API
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>Atenção!</strong> Você está prestes a regerar sua chave API.
                    </div>
                    <p>
                        Ao regerar sua chave API, a chave atual será invalidada e todas as integrações que a utilizam deixarão de funcionar.
                    </p>
                    <p>
                        Você precisará atualizar a chave em todas as suas integrações.
                    </p>
                    <div class="form-check mt-3">
                        <input class="form-check-input" type="checkbox" id="confirm-regenerate-api-key-check">
                        <label class="form-check-label" for="confirm-regenerate-api-key-check">
                            Eu entendo que esta ação não pode ser desfeita e que precisarei atualizar todas as minhas integrações.
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-danger" id="confirm-regenerate-api-key-btn" disabled>
                        <i class="fas fa-key me-1"></i> Regerar Chave API
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    const bootstrapModal = new bootstrap.Modal(document.getElementById('regenerate-api-key-modal'));
    bootstrapModal.show();
    
    // Enable/disable confirm button based on checkbox
    document.getElementById('confirm-regenerate-api-key-check').addEventListener('change', function() {
        document.getElementById('confirm-regenerate-api-key-btn').disabled = !this.checked;
    });
    
    // Confirm button
    document.getElementById('confirm-regenerate-api-key-btn').addEventListener('click', function() {
        // In a real app, we would call the API to regenerate the key
        // For demo, show a toast
        showToast('Chave API regenerada com sucesso!', 'success');
        
        // Update API key display
        const apiKeyInput = document.getElementById('api-key-display');
        if (apiKeyInput && apiKeyInput.type === 'text') {
            apiKeyInput.value = 'vap_' + generateRandomString(32);
        }
        
        // Close modal
        bootstrapModal.hide();
    });
    
    // Remove modal from DOM when hidden
    document.getElementById('regenerate-api-key-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

/**
 * Show API logs
 */
function showApiLogs() {
    // Create logs modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'api-logs-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'api-logs-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="api-logs-modal-label">
                        <i class="fas fa-list me-2"></i>
                        Logs de API
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="api-logs-filters mb-3">
                        <div class="row g-3">
                            <div class="col-md-3">
                                <input type="text" class="form-control" placeholder="Filtrar...">
                            </div>
                            <div class="col-md-2">
                                <select class="form-select">
                                    <option value="">Status</option>
                                    <option value="success">Sucesso</option>
                                    <option value="error">Erro</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <select class="form-select">
                                    <option value="">Método</option>
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                    <option value="DELETE">DELETE</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <div class="input-group">
                                    <span class="input-group-text">Data</span>
                                    <input type="date" class="form-control">
                                </div>
                            </div>
                            <div class="col-md-2">
                                <button class="btn btn-primary w-100">
                                    <i class="fas fa-filter me-1"></i> Filtrar
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-bordered table-hover">
                            <thead>
                                <tr>
                                    <th>Data/Hora</th>
                                    <th>Método</th>
                                    <th>Endpoint</th>
                                    <th>Status</th>
                                    <th>Duração</th>
                                    <th>IP</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${generateSampleApiLogs().map(log => `
                                    <tr>
                                        <td>${log.datetime}</td>
                                        <td>
                                            <span class="badge" style="background-color: ${getMethodColor(log.method)};">${log.method}</span>
                                        </td>
                                        <td><code>${log.endpoint}</code></td>
                                        <td><span class="badge ${log.status >= 200 && log.status < 300 ? 'bg-success' : 'bg-danger'}">${log.status}</span></td>
                                        <td>${log.duration}ms</td>
                                        <td>${log.ip}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary view-log-btn">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <div>
                            Mostrando 1-10 de 125 registros
                        </div>
                        <div>
                            <nav aria-label="Navegação de logs">
                                <ul class="pagination">
                                    <li class="page-item disabled">
                                        <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Anterior</a>
                                    </li>
                                    <li class="page-item active" aria-current="page">
                                        <a class="page-link" href="#">1</a>
                                    </li>
                                    <li class="page-item">
                                        <a class="page-link" href="#">2</a>
                                    </li>
                                    <li class="page-item">
                                        <a class="page-link" href="#">3</a>
                                    </li>
                                    <li class="page-item">
                                        <a class="page-link" href="#">Próximo</a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    <button type="button" class="btn btn-primary">
                        <i class="fas fa-download me-1"></i> Exportar Logs
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    const bootstrapModal = new bootstrap.Modal(document.getElementById('api-logs-modal'));
    bootstrapModal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('api-logs-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

/**
 * Generate API documentation
 */
function generateApiDocs() {
    // Create loading toast
    showToast('Gerando documentação da API...', 'info');
    
    // Simulate API call delay
    setTimeout(() => {
        // Create docs modal
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'api-docs-modal';
        modal.tabIndex = '-1';
        modal.setAttribute('aria-labelledby', 'api-docs-modal-label');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="api-docs-modal-label">
                            <i class="fas fa-file-alt me-2"></i>
                            Documentação da API
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle me-2"></i>
                            Documentação gerada com sucesso!
                        </div>
                        
                        <div class="api-docs-container">
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <h5 class="card-title">
                                                <i class="fas fa-file-pdf me-2"></i>
                                                Documentação em PDF
                                            </h5>
                                            <p class="card-text">
                                                Documentação completa da API em formato PDF, ideal para consulta offline.
                                            </p>
                                        </div>
                                        <div class="card-footer">
                                            <button class="btn btn-primary">
                                                <i class="fas fa-download me-1"></i> Baixar PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <h5 class="card-title">
                                                <i class="fas fa-file-code me-2"></i>
                                                Especificação OpenAPI
                                            </h5>
                                            <p class="card-text">
                                                Especificação OpenAPI (Swagger) para importação em ferramentas de desenvolvimento.
                                            </p>
                                        </div>
                                        <div class="card-footer">
                                            <button class="btn btn-primary">
                                                <i class="fas fa-download me-1"></i> Baixar JSON
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <h5>Prévia da Documentação</h5>
                            <div class="api-docs-preview">
                                <div class="card">
                                    <div class="card-header">
                                        API VoiceAI v1.0
                                    </div>
                                    <div class="card-body">
                                        <h5>Visão Geral</h5>
                                        <p>
                                            A API VoiceAI permite que você integre todas as funcionalidades da plataforma VoiceAI com seus sistemas e aplicativos.
                                        </p>
                                        
                                        <h5>Autenticação</h5>
                                        <p>
                                            A API usa autenticação via token Bearer. Inclua o cabeçalho <code>Authorization: Bearer YOUR_API_KEY</code> em todas as requisições.
                                        </p>
                                        
                                        <h5>Endpoints Disponíveis</h5>
                                        <div class="table-responsive">
                                            <table class="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>Método</th>
                                                        <th>Endpoint</th>
                                                        <th>Descrição</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${apiActions.map(action => `
                                                        <tr>
                                                            <td>
                                                                <span class="badge" style="background-color: ${getMethodColor(action.method)};">${action.method}</span>
                                                            </td>
                                                            <td><code>${action.endpoint}</code></td>
                                                            <td>${action.description}</td>
                                                        </tr>
                                                    `).join('')}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal
        const bootstrapModal = new bootstrap.Modal(document.getElementById('api-docs-modal'));
        bootstrapModal.show();
        
        // Remove modal from DOM when hidden
        document.getElementById('api-docs-modal').addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(modal);
        });
    }, 1500);
}

/**
 * Show integration help
 */
function showIntegrationHelp() {
    // Create help modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'integration-help-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'integration-help-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="integration-help-modal-label">
                        <i class="fas fa-question-circle me-2"></i>
                        Ajuda: Integrações
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="accordion" id="integration-help-accordion">
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#help-webhooks" aria-expanded="true" aria-controls="help-webhooks">
                                    O que são webhooks?
                                </button>
                            </h2>
                            <div id="help-webhooks" class="accordion-collapse collapse show" data-bs-parent="#integration-help-accordion">
                                <div class="accordion-body">
                                    <p>
                                        Webhooks são "callbacks HTTP" que permitem que a VoiceAI notifique outras plataformas 
                                        quando eventos específicos ocorrerem. Por exemplo, quando um novo lead é criado, uma 
                                        chamada é concluída ou uma mensagem é recebida.
                                    </p>
                                    <p>
                                        Quando o evento ocorre, a VoiceAI envia uma requisição HTTP POST para a URL configurada, 
                                        contendo dados sobre o evento. A plataforma de destino pode então processar esses dados e 
                                        tomar ações adequadas.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#help-platforms" aria-expanded="false" aria-controls="help-platforms">
                                    Plataformas de integração
                                </button>
                            </h2>
                            <div id="help-platforms" class="accordion-collapse collapse" data-bs-parent="#integration-help-accordion">
                                <div class="accordion-body">
                                    <p>
                                        A VoiceAI se integra com diversas plataformas de automação e sistemas de terceiros, incluindo:
                                    </p>
                                    <ul>
                                        <li>
                                            <strong>Make (antigo Integromat)</strong> - Plataforma de automação visual que permite 
                                            conectar apps e sistemas sem codificação.
                                        </li>
                                        <li>
                                            <strong>n8n</strong> - Plataforma de automação de código aberto que pode ser executada 
                                            em seus próprios servidores.
                                        </li>
                                        <li>
                                            <strong>Zapier</strong> - Plataforma que conecta mais de 3.000 aplicativos para automatizar 
                                            fluxos de trabalho.
                                        </li>
                                        <li>
                                            <strong>CRMs</strong> - Integre com sistemas CRM populares como Salesforce, HubSpot, 
                                            Pipedrive, etc.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#help-api" aria-expanded="false" aria-controls="help-api">
                                    Usando a API
                                </button>
                            </h2>
                            <div id="help-api" class="accordion-collapse collapse" data-bs-parent="#integration-help-accordion">
                                <div class="accordion-body">
                                    <p>
                                        A API da VoiceAI permite que você acesse e manipule dados da plataforma programaticamente. 
                                        Você pode criar leads, iniciar chamadas, enviar mensagens e muito mais.
                                    </p>
                                    <p>
                                        Para usar a API, você precisa de uma chave API, que pode ser encontrada na seção de integrações.
                                    </p>
                                    <p>
                                        Todas as requisições à API devem incluir o cabeçalho <code>Authorization: Bearer YOUR_API_KEY</code>.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#help-examples" aria-expanded="false" aria-controls="help-examples">
                                    Exemplos de integrações
                                </button>
                            </h2>
                            <div id="help-examples" class="accordion-collapse collapse" data-bs-parent="#integration-help-accordion">
                                <div class="accordion-body">
                                    <p>
                                        Aqui estão alguns exemplos de integrações úteis:
                                    </p>
                                    <ul>
                                        <li>
                                            <strong>Salesforce + VoiceAI</strong> - Sincronize leads entre o Salesforce e a VoiceAI, 
                                            e atualize automaticamente o CRM quando uma chamada for concluída.
                                        </li>
                                        <li>
                                            <strong>Google Sheets + VoiceAI</strong> - Importe leads de uma planilha do Google 
                                            e exporte resultados de campanhas para análise.
                                        </li>
                                        <li>
                                            <strong>Slack + VoiceAI</strong> - Receba notificações no Slack quando leads 
                                            importantes interagirem com sua empresa.
                                        </li>
                                        <li>
                                            <strong>E-mail + VoiceAI</strong> - Envie e-mails automáticos após chamadas bem-sucedidas 
                                            ou quando um lead mudar de status.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    const bootstrapModal = new bootstrap.Modal(document.getElementById('integration-help-modal'));
    bootstrapModal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('integration-help-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

/**
 * Get platform-specific instructions
 * @param {string} platformId - ID of the platform
 * @returns {string} - HTML string with platform-specific instructions
 */
function getPlatformSpecificInstructions(platformId) {
    switch (platformId) {
        case 'make':
            return `
                <ol>
                    <li>No Make, crie um novo cenário</li>
                    <li>Adicione um trigger (gatilho) do tipo "Webhook"</li>
                    <li>Copie a URL do webhook e adicione-a no VoiceAI</li>
                    <li>Configure o formato de dados como JSON</li>
                    <li>Adicione as ações que deseja executar quando o webhook for acionado</li>
                </ol>
                <p><a href="https://www.make.com/en/help/tools/webhooks" target="_blank">Ver documentação do Make</a></p>
            `;
        case 'n8n':
            return `
                <ol>
                    <li>No n8n, crie um novo workflow</li>
                    <li>Adicione um nó "Webhook" como trigger</li>
                    <li>Configure o webhook para receber requisições POST</li>
                    <li>Ative o webhook e copie a URL gerada</li>
                    <li>Adicione esta URL no VoiceAI para o evento desejado</li>
                </ol>
                <p><a href="https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/" target="_blank">Ver documentação do n8n</a></p>
            `;
        case 'zapier':
            return `
                <ol>
                    <li>No Zapier, crie um novo Zap</li>
                    <li>Selecione "Webhook by Zapier" como trigger</li>
                    <li>Escolha "Catch Hook" como evento</li>
                    <li>Copie a URL do webhook fornecida</li>
                    <li>Configure as ações que deseja executar quando o webhook for acionado</li>
                </ol>
                <p><a href="https://zapier.com/help/create/code-webhooks/trigger-zaps-from-webhooks" target="_blank">Ver documentação do Zapier</a></p>
            `;
        case 'integromat':
            return `
                <ol>
                    <li>No Integromat, crie um novo cenário</li>
                    <li>Adicione um módulo "Webhooks" como trigger</li>
                    <li>Escolha "Custom webhook" como tipo</li>
                    <li>Copie a URL do webhook e adicione-a no VoiceAI</li>
                    <li>Configure as ações que deseja executar quando o webhook for acionado</li>
                </ol>
                <p><a href="https://www.integromat.com/en/help/app/webhooks" target="_blank">Ver documentação do Integromat</a></p>
            `;
        default:
            return `
                <p>Consulte a documentação da plataforma para obter instruções específicas sobre como configurar webhooks.</p>
            `;
    }
}

/**
 * Get platform templates
 * @param {string} platformId - ID of the platform
 * @returns {Object[]} - Array of template objects
 */
function getPlatformTemplates(platformId) {
    switch (platformId) {
        case 'make':
            return [
                {
                    id: 'make-new-lead',
                    name: 'Sincronizar novos leads com CRM',
                    description: 'Quando um novo lead for criado na VoiceAI, adiciona automaticamente ao seu CRM'
                },
                {
                    id: 'make-call-complete',
                    name: 'Notificar equipe sobre chamadas',
                    description: 'Envia notificações no Slack quando chamadas importantes forem concluídas'
                },
                {
                    id: 'make-lead-status',
                    name: 'Automação de e-mail por status',
                    description: 'Envia e-mails personalizados quando o status de um lead mudar'
                },
                {
                    id: 'make-campaign-reports',
                    name: 'Relatórios de campanha',
                    description: 'Gera automaticamente relatórios de campanha no Google Sheets'
                }
            ];
        case 'n8n':
            return [
                {
                    id: 'n8n-new-lead',
                    name: 'Lead para CRM e E-mail',
                    description: 'Adiciona novos leads ao CRM e envia e-mail de boas-vindas'
                },
                {
                    id: 'n8n-call-recording',
                    name: 'Processamento de gravações',
                    description: 'Processa gravações de chamadas para extração de insights'
                },
                {
                    id: 'n8n-lead-scoring',
                    name: 'Sistema de pontuação de leads',
                    description: 'Atualiza a pontuação de leads com base em interações'
                }
            ];
        case 'zapier':
            return [
                {
                    id: 'zapier-lead-to-crm',
                    name: 'Lead para múltiplos CRMs',
                    description: 'Sincroniza leads com Salesforce, HubSpot e outros CRMs'
                },
                {
                    id: 'zapier-calendar',
                    name: 'Agendamento no calendário',
                    description: 'Adiciona callbacks agendados ao Google Calendar ou Outlook'
                }
            ];
        case 'integromat':
            return [
                {
                    id: 'integromat-lead-enrichment',
                    name: 'Enriquecimento de leads',
                    description: 'Enriquece dados de leads com informações de fontes externas'
                },
                {
                    id: 'integromat-notifications',
                    name: 'Notificações multicanal',
                    description: 'Envia notificações via e-mail, SMS, e aplicativos de mensagens'
                }
            ];
        default:
            return [];
    }
}

/**
 * Get color for HTTP method
 * @param {string} method - HTTP method
 * @returns {string} - Color hex code
 */
function getMethodColor(method) {
    switch (method.toUpperCase()) {
        case 'GET':
            return '#61affe';
        case 'POST':
            return '#49cc90';
        case 'PUT':
            return '#fca130';
        case 'DELETE':
            return '#f93e3e';
        case 'PATCH':
            return '#50e3c2';
        default:
            return '#6c757d';
    }
}

/**
 * Generate sample API logs
 * @returns {Object[]} - Array of log objects
 */
function generateSampleApiLogs() {
    const logs = [];
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const endpoints = [
        '/api/leads',
        '/api/leads/15',
        '/api/conversations',
        '/api/calls',
        '/api/campaigns',
        '/api/leads/42/notes'
    ];
    const statuses = [200, 201, 400, 401, 404, 500];
    const ips = ['192.168.1.1', '10.0.0.5', '172.16.0.10', '127.0.0.1'];
    
    // Generate sample dates from yesterday to today
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    for (let i = 0; i < 10; i++) {
        const date = new Date(yesterday.getTime() + Math.random() * (now.getTime() - yesterday.getTime()));
        
        logs.push({
            datetime: date.toLocaleString(),
            method: methods[Math.floor(Math.random() * methods.length)],
            endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            duration: Math.floor(Math.random() * 500) + 50,
            ip: ips[Math.floor(Math.random() * ips.length)]
        });
    }
    
    // Sort by datetime descending
    logs.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
    
    return logs;
}

/**
 * Get a sample API response
 * @param {Object} action - API action
 * @returns {Object} - Sample response
 */
function getSampleApiResponse(action) {
    switch (action.id) {
        case 'create_lead':
            return {
                success: true,
                data: {
                    id: 123,
                    name: 'João Silva',
                    company: 'Empresa ABC',
                    phone: '+5511987654321',
                    email: 'joao@empresa.com',
                    status: 'new',
                    score: 0,
                    source: 'website',
                    created_at: new Date().toISOString()
                }
            };
        case 'update_lead':
            return {
                success: true,
                data: {
                    id: 42,
                    name: 'João Silva',
                    company: 'Empresa ABC',
                    phone: '+5511987654321',
                    email: 'joao@empresa.com',
                    status: 'qualified',
                    score: 75,
                    source: 'website',
                    updated_at: new Date().toISOString()
                }
            };
        case 'get_lead':
            return {
                success: true,
                data: {
                    id: 42,
                    name: 'João Silva',
                    company: 'Empresa ABC',
                    phone: '+5511987654321',
                    email: 'joao@empresa.com',
                    status: 'qualified',
                    score: 75,
                    source: 'website',
                    created_at: '2023-03-15T10:30:00Z',
                    updated_at: '2023-04-01T14:45:00Z',
                    last_activity: '2023-04-01T14:45:00Z',
                    conversations: [
                        { id: 101, channel: 'voice', status: 'completed', created_at: '2023-03-15T10:35:00Z' },
                        { id: 102, channel: 'chat', status: 'active', created_at: '2023-04-01T14:40:00Z' }
                    ],
                    notes: [
                        { id: 201, content: 'Cliente interessado em plano enterprise', created_at: '2023-03-15T11:00:00Z' }
                    ]
                }
            };
        case 'initiate_call':
            return {
                success: true,
                data: {
                    id: 456,
                    lead_id: 42,
                    agent_id: 1,
                    direction: 'outbound',
                    status: 'ringing',
                    start_time: new Date().toISOString(),
                    created_at: new Date().toISOString()
                }
            };
        case 'send_message':
            return {
                success: true,
                data: {
                    id: 789,
                    conversation_id: 102,
                    sender_type: 'agent',
                    sender_id: 1,
                    content: 'Olá João, como posso ajudar?',
                    message_type: 'text',
                    created_at: new Date().toISOString()
                }
            };
        case 'schedule_callback':
            return {
                success: true,
                data: {
                    id: 321,
                    lead_id: 42,
                    agent_id: 1,
                    scheduled_at: '2023-04-05T14:00:00Z',
                    notes: 'Retornar para discutir proposta',
                    status: 'scheduled',
                    created_at: new Date().toISOString(),
                    reminders: [
                        { id: 1, reminder_time: '2023-04-05T13:45:00Z', channel: 'email', status: 'pending' }
                    ]
                }
            };
        case 'create_note':
            return {
                success: true,
                data: {
                    id: 202,
                    lead_id: 42,
                    user_id: 1,
                    content: 'Cliente solicitou demonstração do produto',
                    note_type: 'general',
                    created_at: new Date().toISOString()
                }
            };
        default:
            return {
                success: true,
                message: 'Operation completed successfully'
            };
    }
}

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} - Random string
 */
function generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
}

export { initIntegration };