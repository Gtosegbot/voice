// frontend/js/components/Integration/webhook_manager.js
/**
 * WebhookIntegrationManager
 * 
 * Classe para gerenciar integrações via webhook com plataformas como:
 * - n8n
 * - Make (Integromat)
 * - Zapier
 * - Pipedream
 * - Webhookrelay
 * 
 * Permite configurar callbacks para eventos da plataforma com instruções
 * passo a passo para configuração.
 */
class WebhookIntegrationManager {
  /**
   * Cria um novo gerenciador de integrações webhook
   * @param {Object} options - Opções de configuração
   */
  constructor(options = {}) {
    // Configuração básica
    this.config = {
      baseURL: options.baseURL || this._detectBaseURL(),
      apiPath: options.apiPath || '/api/v1',
      enabledPlatforms: options.enabledPlatforms || [
        'n8n', 'make', 'zapier', 'pipedream', 'webhook'
      ],
      authType: options.authType || 'api_key',  // 'api_key', 'jwt', 'basic'
      secretKey: options.secretKey || this._generateSecretKey(),
      maxWebhooks: options.maxWebhooks || 100,
      enableLogging: options.enableLogging !== false
    };
    
    // URL base para webhooks
    this.webhookBaseURL = options.webhookBaseURL || 
                         `${this.config.baseURL}${this.config.apiPath}/webhook`;
    
    // Gatilhos disponíveis
    this.availableTriggers = [
      {
        id: 'call_started',
        name: 'Chamada Iniciada',
        description: 'Acionado quando uma chamada é iniciada',
        category: 'call',
        samplePayload: this._getSamplePayload('call_started')
      },
      {
        id: 'call_answered',
        name: 'Chamada Atendida',
        description: 'Acionado quando uma chamada é atendida',
        category: 'call',
        samplePayload: this._getSamplePayload('call_answered')
      },
      {
        id: 'call_ended',
        name: 'Chamada Finalizada',
        description: 'Acionado quando uma chamada termina',
        category: 'call',
        samplePayload: this._getSamplePayload('call_ended')
      },
      {
        id: 'voicemail_detected',
        name: 'Caixa Postal Detectada',
        description: 'Acionado quando uma caixa postal é detectada',
        category: 'call',
        samplePayload: this._getSamplePayload('voicemail_detected')
      },
      {
        id: 'lead_qualified',
        name: 'Lead Qualificado',
        description: 'Acionado quando um lead é qualificado',
        category: 'lead',
        samplePayload: this._getSamplePayload('lead_qualified')
      },
      {
        id: 'lead_created',
        name: 'Lead Criado',
        description: 'Acionado quando um novo lead é criado',
        category: 'lead',
        samplePayload: this._getSamplePayload('lead_created')
      },
      {
        id: 'lead_updated',
        name: 'Lead Atualizado',
        description: 'Acionado quando um lead é atualizado',
        category: 'lead',
        samplePayload: this._getSamplePayload('lead_updated')
      },
      {
        id: 'appointment_scheduled',
        name: 'Agendamento Criado',
        description: 'Acionado quando um agendamento é criado',
        category: 'calendar',
        samplePayload: this._getSamplePayload('appointment_scheduled')
      },
      {
        id: 'appointment_confirmed',
        name: 'Agendamento Confirmado',
        description: 'Acionado quando um agendamento é confirmado',
        category: 'calendar',
        samplePayload: this._getSamplePayload('appointment_confirmed')
      },
      {
        id: 'appointment_cancelled',
        name: 'Agendamento Cancelado',
        description: 'Acionado quando um agendamento é cancelado',
        category: 'calendar',
        samplePayload: this._getSamplePayload('appointment_cancelled')
      },
      {
        id: 'transcript_completed',
        name: 'Transcrição Completada',
        description: 'Acionado quando uma transcrição de chamada é completada',
        category: 'analytics',
        samplePayload: this._getSamplePayload('transcript_completed')
      },
      {
        id: 'custom_event',
        name: 'Evento Personalizado',
        description: 'Acionado quando um evento personalizado ocorre',
        category: 'custom',
        isCustom: true,
        samplePayload: this._getSamplePayload('custom_event')
      }
    ];
    
    // Templates para cada plataforma
    this.platformTemplates = {
      'n8n': {
        name: 'n8n',
        logoUrl: '/img/integration/n8n-logo.svg',
        description: 'Automatização de fluxos de trabalho com código aberto e orientada a nós',
        docUrl: 'https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.webhook/',
        generateTemplate: this.generateN8nTemplate.bind(this)
      },
      'make': {
        name: 'Make (Integromat)',
        logoUrl: '/img/integration/make-logo.svg',
        description: 'Plataforma de integração visual para conectar apps e automatizar fluxos de trabalho',
        docUrl: 'https://www.make.com/en/help/tools/webhooks',
        generateTemplate: this.generateMakeTemplate.bind(this)
      },
      'zapier': {
        name: 'Zapier',
        logoUrl: '/img/integration/zapier-logo.svg',
        description: 'Conecte seus apps e automatize fluxos de trabalho',
        docUrl: 'https://zapier.com/help/create/code-webhooks/trigger-zaps-from-webhooks',
        generateTemplate: this.generateZapierTemplate.bind(this)
      },
      'pipedream': {
        name: 'Pipedream',
        logoUrl: '/img/integration/pipedream-logo.svg',
        description: 'Conecte APIs, execute código Node.js sem servidor e construa fluxos de trabalho',
        docUrl: 'https://pipedream.com/docs/components/api/',
        generateTemplate: this.generatePipedreamTemplate.bind(this)
      },
      'webhook': {
        name: 'Webhook Genérico',
        logoUrl: '/img/integration/webhook-generic.svg',
        description: 'Integre com qualquer sistema que suporte webhooks',
        docUrl: null,
        generateTemplate: this.generateGenericWebhookTemplate.bind(this)
      }
    };
    
    // Webhooks registrados
    this.registeredWebhooks = [];
    
    // Gerenciamento de estado
    this.status = {
      isInitialized: false,
      lastError: null,
      isLoading: false
    };
    
    // Inicializar
    this._init();
  }
  
  /**
   * Inicializa o gerenciador
   * @private
   */
  _init() {
    this._log('Inicializando WebhookIntegrationManager');
    
    // Carregar webhooks salvos
    this._loadSavedWebhooks();
    
    this.status.isInitialized = true;
  }
  
  /**
   * Carrega webhooks salvos
   * @private
   */
  _loadSavedWebhooks() {
    try {
      // Em produção, carregaria do backend
      // Para demo, carregamos do localStorage
      const saved = localStorage.getItem('webhook_integrations');
      if (saved) {
        this.registeredWebhooks = JSON.parse(saved);
        this._log(`${this.registeredWebhooks.length} webhooks carregados`);
      }
    } catch (error) {
      this._logError('Falha ao carregar webhooks salvos', error);
      this.status.lastError = error.message;
    }
  }
  
  /**
   * Salva webhooks registrados
   * @private
   */
  _saveWebhooks() {
    try {
      // Em produção, salvaria no backend
      // Para demo, salvamos no localStorage
      localStorage.setItem('webhook_integrations', JSON.stringify(this.registeredWebhooks));
      this._log(`${this.registeredWebhooks.length} webhooks salvos`);
    } catch (error) {
      this._logError('Falha ao salvar webhooks', error);
      this.status.lastError = error.message;
    }
  }
  
  /**
   * Gera payload de exemplo para um gatilho
   * @param {string} trigger - ID do gatilho
   * @returns {Object} Payload de exemplo
   * @private
   */
  _getSamplePayload(trigger) {
    // Payloads de exemplo para cada tipo de gatilho
    const sampleData = {
      'call_started': {
        event: 'call_started',
        timestamp: new Date().toISOString(),
        call: {
          id: 'call_1234567890',
          from: '+5511999999999',
          to: '+5511888888888',
          direction: 'outbound',
          status: 'initiated',
          start_time: new Date().toISOString()
        },
        lead: {
          id: 'lead_123',
          name: 'João Silva',
          phone: '+5511999999999',
          email: 'joao.silva@exemplo.com',
          company: 'Empresa ABC'
        }
      },
      'call_answered': {
        event: 'call_answered',
        timestamp: new Date().toISOString(),
        call: {
          id: 'call_1234567890',
          from: '+5511999999999',
          to: '+5511888888888',
          direction: 'outbound',
          status: 'in-progress',
          start_time: new Date(Date.now() - 5000).toISOString(),
          answer_time: new Date().toISOString()
        },
        lead: {
          id: 'lead_123',
          name: 'João Silva',
          phone: '+5511999999999',
          email: 'joao.silva@exemplo.com',
          company: 'Empresa ABC'
        }
      },
      'call_ended': {
        event: 'call_ended',
        timestamp: new Date().toISOString(),
        call: {
          id: 'call_1234567890',
          from: '+5511999999999',
          to: '+5511888888888',
          direction: 'outbound',
          status: 'completed',
          start_time: new Date(Date.now() - 65000).toISOString(),
          answer_time: new Date(Date.now() - 60000).toISOString(),
          end_time: new Date().toISOString(),
          duration: 60,
          recording_url: 'https://api.exemplo.com/recordings/call_1234567890.mp3'
        },
        lead: {
          id: 'lead_123',
          name: 'João Silva',
          phone: '+5511999999999',
          email: 'joao.silva@exemplo.com',
          company: 'Empresa ABC'
        },
        analytics: {
          sentiment: 'positive',
          topics: ['pricing', 'features', 'support'],
          talk_ratio: { agent: 40, customer: 60 }
        }
      },
      'voicemail_detected': {
        event: 'voicemail_detected',
        timestamp: new Date().toISOString(),
        call: {
          id: 'call_1234567890',
          from: '+5511999999999',
          to: '+5511888888888',
          direction: 'outbound',
          status: 'voicemail',
          start_time: new Date(Date.now() - 15000).toISOString(),
          detection_time: new Date().toISOString()
        },
        lead: {
          id: 'lead_123',
          name: 'João Silva',
          phone: '+5511999999999',
          email: 'joao.silva@exemplo.com'
        },
        detection: {
          confidence: 0.92,
          method: 'audio_analysis'
        }
      },
      'lead_qualified': {
        event: 'lead_qualified',
        timestamp: new Date().toISOString(),
        lead: {
          id: 'lead_123',
          name: 'João Silva',
          phone: '+5511999999999',
          email: 'joao.silva@exemplo.com',
          company: 'Empresa ABC',
          status: 'qualified',
          score: 85,
          previous_status: 'new'
        },
        qualification: {
          agent_id: 'user_456',
          call_id: 'call_1234567890',
          notes: 'Cliente interessado no plano premium',
          custom_fields: {
            budget: 'R$ 5.000,00',
            decision_timeframe: '30 dias',
            pain_points: ['preço', 'suporte']
          }
        }
      },
      'lead_created': {
        event: 'lead_created',
        timestamp: new Date().toISOString(),
        lead: {
          id: 'lead_123',
          name: 'João Silva',
          phone: '+5511999999999',
          email: 'joao.silva@exemplo.com',
          company: 'Empresa ABC',
          status: 'new',
          score: 65,
          source: 'website',
          created_at: new Date().toISOString()
        },
        source_data: {
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'brand',
          landing_page: 'https://exemplo.com/landing-page'
        }
      },
      'lead_updated': {
        event: 'lead_updated',
        timestamp: new Date().toISOString(),
        lead: {
          id: 'lead_123',
          name: 'João Silva',
          phone: '+5511999999999',
          email: 'joao.silva@exemplo.com',
          company: 'Empresa ABC',
          status: 'opportunity',
          score: 80,
          updated_at: new Date().toISOString()
        },
        changes: {
          status: { from: 'qualified', to: 'opportunity' },
          score: { from: 65, to: 80 }
        },
        updated_by: 'user_456'
      },
      'appointment_scheduled': {
        event: 'appointment_scheduled',
        timestamp: new Date().toISOString(),
        appointment: {
          id: 'appt_123',
          title: 'Demonstração de Produto',
          start_time: new Date(Date.now() + 86400000).toISOString(), // Amanhã
          end_time: new Date(Date.now() + 86400000 + 3600000).toISOString(), // +1h
          timezone: 'America/Sao_Paulo',
          location: 'Google Meet',
          status: 'scheduled',
          created_at: new Date().toISOString()
        },
        lead: {
          id: 'lead_123',
          name: 'João Silva',
          phone: '+5511999999999',
          email: 'joao.silva@exemplo.com'
        },
        scheduled_by: 'user_456',
        source: 'phone_call'
      },
      'appointment_confirmed': {
        event: 'appointment_confirmed',
        timestamp: new Date().toISOString(),
        appointment: {
          id: 'appt_123',
          title: 'Demonstração de Produto',
          start_time: new Date(Date.now() + 86400000).toISOString(), // Amanhã
          end_time: new Date(Date.now() + 86400000 + 3600000).toISOString(), // +1h
          timezone: 'America/Sao_Paulo',
          location: 'Google Meet',
          status: 'confirmed',
          created_at: new Date(Date.now() - 86400000).toISOString(), // Ontem
          confirmed_at: new Date().toISOString()
        },
        lead: {
          id: 'lead_123',
          name: 'João Silva',
          phone: '+5511999999999',
          email: 'joao.silva@exemplo.com'
        },
        confirmation_method: 'email_click'
      },
      'appointment_cancelled': {
        event: 'appointment_cancelled',
        timestamp: new Date().toISOString(),
        appointment: {
          id: 'appt_123',
          title: 'Demonstração de Produto',
          start_time: new Date(Date.now() + 86400000).toISOString(), // Amanhã
          end_time: new Date(Date.now() + 86400000 + 3600000).toISOString(), // +1h
          timezone: 'America/Sao_Paulo',
          location: 'Google Meet',
          status: 'cancelled',
          created_at: new Date(Date.now() - 86400000).toISOString(), // Ontem
          cancelled_at: new Date().toISOString()
        },
        lead: {
          id: 'lead_123',
          name: 'João Silva',
          phone: '+5511999999999',
          email: 'joao.silva@exemplo.com'
        },
        cancellation: {
          reason: 'scheduling_conflict',
          cancelled_by: 'lead', // lead ou agent
          notes: 'Conflito de agenda, solicita reagendamento'
        }
      },
      'transcript_completed': {
        event: 'transcript_completed',
        timestamp: new Date().toISOString(),
        call: {
          id: 'call_1234567890',
          from: '+5511999999999',
          to: '+5511888888888',
          direction: 'outbound',
          status: 'completed',
          start_time: new Date(Date.now() - 3600000).toISOString(),
          end_time: new Date(Date.now() - 3540000).toISOString(),
          duration: 60
        },
        lead: {
          id: 'lead_123',
          name: 'João Silva',
          phone: '+5511999999999',
          email: 'joao.silva@exemplo.com'
        },
        transcript: {
          id: 'transcript_789',
          language: 'pt-BR',
          confidence: 0.92,
          text: 'Diálogo completo da chamada aqui...',
          segments: [
            {
              speaker: 'agent',
              start_time: 0,
              end_time: 5.2,
              text: 'Olá, como posso ajudar?'
            },
            {
              speaker: 'customer',
              start_time: 6.1,
              end_time: 12.5,
              text: 'Estou interessado no seu produto. Pode me dar mais informações?'
            }
          ],
          transcript_url: 'https://api.exemplo.com/transcripts/transcript_789.json'
        },
        analytics: {
          sentiment: 'positive',
          topics: ['pricing', 'features', 'support'],
          summary: 'O cliente está interessado no produto e solicitou mais informações sobre preços.',
          key_insights: [
            'Cliente mencionou orçamento de R$ 5.000',
            'Interesse principal em recursos de integração',
            'Tem preocupações com suporte técnico'
          ]
        }
      },
      'custom_event': {
        event: 'custom_event',
        timestamp: new Date().toISOString(),
        event_name: 'process_completed',
        data: {
          process_id: 'proc_456',
          status: 'success',
          duration: 45.2,
          items_processed: 120
        },
        metadata: {
          source: 'api',
          user_id: 'user_789',
          ip: '192.168.1.1'
        }
      }
    };
    
    return sampleData[trigger] || {
      event: trigger,
      timestamp: new Date().toISOString(),
      data: { message: 'Exemplo de payload não disponível para este evento' }
    };
  }
  
  /**
   * Registra um novo webhook
   * @param {Object} webhookData - Dados do webhook
   * @returns {Object} Webhook registrado
   */
  registerWebhook(webhookData) {
    try {
      // Verificar limite
      if (this.registeredWebhooks.length >= this.config.maxWebhooks) {
        throw new Error(`Limite de ${this.config.maxWebhooks} webhooks atingido`);
      }
      
      // Validar dados mínimos
      if (!webhookData.name || !webhookData.trigger || !webhookData.platform) {
        throw new Error('Dados incompletos: nome, gatilho e plataforma são obrigatórios');
      }
      
      // Verificar se plataforma é suportada
      if (!this.config.enabledPlatforms.includes(webhookData.platform)) {
        throw new Error(`Plataforma não suportada: ${webhookData.platform}`);
      }
      
      // Verificar se gatilho existe
      const triggerExists = this.availableTriggers.some(t => t.id === webhookData.trigger);
      if (!triggerExists && !webhookData.isCustom) {
        throw new Error(`Gatilho desconhecido: ${webhookData.trigger}`);
      }
      
      // Gerar ID único
      const webhookId = this._generateWebhookId();
      
      // Gerar URL com token de segurança
      const securityToken = this._generateSecurityToken();
      const webhookUrl = this.generateWebhookURL(webhookId, webhookData.trigger, securityToken);
      
      // Criar objeto webhook
      const newWebhook = {
        id: webhookId,
        name: webhookData.name,
        description: webhookData.description || '',
        trigger: webhookData.trigger,
        trigger_name: webhookData.trigger_name || this._getTriggerName(webhookData.trigger),
        platform: webhookData.platform,
        url: webhookUrl,
        security_token: securityToken,
        target_url: webhookData.target_url || '',
        is_active: true,
        created_at: new Date().toISOString(),
        last_triggered: null,
        custom_headers: webhookData.custom_headers || {},
        metadata: webhookData.metadata || {}
      };
      
      // Adicionar à lista
      this.registeredWebhooks.push(newWebhook);
      
      // Persistir mudanças
      this._saveWebhooks();
      
      // Retornar novo webhook
      return newWebhook;
    } catch (error) {
      this._logError('Falha ao registrar webhook', error);
      this.status.lastError = error.message;
      throw error;
    }
  }
  
  /**
   * Atualiza um webhook existente
   * @param {string} webhookId - ID do webhook
   * @param {Object} updateData - Dados a atualizar
   * @returns {Object} Webhook atualizado
   */
  updateWebhook(webhookId, updateData) {
    try {
      // Encontrar webhook
      const index = this.registeredWebhooks.findIndex(w => w.id === webhookId);
      if (index === -1) {
        throw new Error(`Webhook não encontrado: ${webhookId}`);
      }
      
      const webhook = { ...this.registeredWebhooks[index] };
      
      // Atualizar campos permitidos
      const allowedFields = [
        'name', 'description', 'is_active', 'target_url', 
        'custom_headers', 'metadata'
      ];
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          webhook[field] = updateData[field];
        }
      });
      
      // Atualizar na lista
      this.registeredWebhooks[index] = webhook;
      
      // Persistir mudanças
      this._saveWebhooks();
      
      return webhook;
    } catch (error) {
      this._logError('Falha ao atualizar webhook', error);
      this.status.lastError = error.message;
      throw error;
    }
  }
  
  /**
   * Desativa um webhook
   * @param {string} webhookId - ID do webhook
   * @returns {boolean} Sucesso
   */
  deactivateWebhook(webhookId) {
    try {
      // Encontrar webhook
      const webhook = this.registeredWebhooks.find(w => w.id === webhookId);
      if (!webhook) {
        throw new Error(`Webhook não encontrado: ${webhookId}`);
      }
      
      // Desativar
      webhook.is_active = false;
      
      // Persistir mudanças
      this._saveWebhooks();
      
      return true;
    } catch (error) {
      this._logError('Falha ao desativar webhook', error);
      this.status.lastError = error.message;
      throw error;
    }
  }
  
  /**
   * Remove um webhook
   * @param {string} webhookId - ID do webhook
   * @returns {boolean} Sucesso
   */
  deleteWebhook(webhookId) {
    try {
      // Encontrar webhook
      const initialLength = this.registeredWebhooks.length;
      this.registeredWebhooks = this.registeredWebhooks.filter(w => w.id !== webhookId);
      
      if (this.registeredWebhooks.length === initialLength) {
        throw new Error(`Webhook não encontrado: ${webhookId}`);
      }
      
      // Persistir mudanças
      this._saveWebhooks();
      
      return true;
    } catch (error) {
      this._logError('Falha ao remover webhook', error);
      this.status.lastError = error.message;
      throw error;
    }
  }
  
  /**
   * Retorna todos os webhooks registrados
   * @param {Object} filters - Filtros opcionais
   * @returns {Array} Lista de webhooks
   */
  getWebhooks(filters = {}) {
    try {
      let webhooks = [...this.registeredWebhooks];
      
      // Aplicar filtros
      if (filters.platform) {
        webhooks = webhooks.filter(w => w.platform === filters.platform);
      }
      
      if (filters.trigger) {
        webhooks = webhooks.filter(w => w.trigger === filters.trigger);
      }
      
      if (filters.isActive !== undefined) {
        webhooks = webhooks.filter(w => w.is_active === filters.isActive);
      }
      
      return webhooks;
    } catch (error) {
      this._logError('Falha ao recuperar webhooks', error);
      this.status.lastError = error.message;
      return [];
    }
  }
  
  /**
   * Gera URL para um webhook
   * @param {string} webhookId - ID do webhook
   * @param {string} trigger - Gatilho associado
   * @param {string} token - Token de segurança
   * @returns {string} URL do webhook
   */
  generateWebhookURL(webhookId, trigger, token) {
    return `${this.webhookBaseURL}/${trigger}/${webhookId}?token=${token}`;
  }
  
  /**
   * Gera template de configuração para n8n
   * @param {Object} webhook - Dados do webhook
   * @returns {Object} Template para n8n
   */
  generateN8nTemplate(webhook) {
    const trigger = this.availableTriggers.find(t => t.id === webhook.trigger);
    
    return {
      template: {
        nodes: [
          {
            parameters: {
              authentication: 'headerAuth',
              httpMethod: 'POST',
              path: webhook.trigger,
              responseMode: 'onReceived',
              responseCode: 200,
              responseData: 'firstEntryJson',
              options: {}
            },
            name: `DisparoSeguro: ${trigger ? trigger.name : webhook.trigger}`,
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [300, 400]
          }
        ],
        connections: {}
      },
      instructions: [
        'No n8n, crie um novo fluxo de trabalho',
        'Adicione um nó "Webhook" como trigger',
        'Configure o webhook com os seguintes parâmetros:',
        `- Método: POST`,
        `- Caminho: ${webhook.trigger}`,
        `- Autenticação: Header Auth`,
        `- Nome do Header: Authorization`,
        `- Valor: Bearer ${webhook.security_token}`,
        'Salve o fluxo de trabalho e ative o webhook',
        `Copie o URL gerado pelo n8n e atualize o campo "URL de destino" nas configurações deste webhook`
      ],
      samplePayload: trigger ? trigger.samplePayload : this._getSamplePayload('custom_event')
    };
  }
  
  /**
   * Gera template de configuração para Make (Integromat)
   * @param {Object} webhook - Dados do webhook
   * @returns {Object} Template para Make
   */
  generateMakeTemplate(webhook) {
    const trigger = this.availableTriggers.find(t => t.id === webhook.trigger);
    
    return {
      template: {
        name: `DisparoSeguro - ${trigger ? trigger.name : webhook.trigger}`,
        blueprint: {
          modules: [
            {
              name: 'Webhook',
              slug: 'webhook',
              type: 'trigger'
            }
          ]
        }
      },
      instructions: [
        'No Make, crie um novo cenário',
        'Adicione um módulo "Webhook" como trigger',
        'Selecione "Webhook personalizado"',
        'Copie o URL gerado pelo Make',
        `Atualize o campo "URL de destino" nas configurações deste webhook`,
        'No Make, adicione um cabeçalho personalizado:',
        `- Nome: Authorization`,
        `- Valor: Bearer ${webhook.security_token}`,
        'Salve e ative o cenário'
      ],
      samplePayload: trigger ? trigger.samplePayload : this._getSamplePayload('custom_event')
    };
  }
  
  /**
   * Gera template de configuração para Zapier
   * @param {Object} webhook - Dados do webhook
   * @returns {Object} Template para Zapier
   */
  generateZapierTemplate(webhook) {
    const trigger = this.availableTriggers.find(t => t.id === webhook.trigger);
    
    return {
      template: {
        title: `DisparoSeguro - ${trigger ? trigger.name : webhook.trigger}`,
        hook_url: '',
        event_type: webhook.trigger
      },
      instructions: [
        'No Zapier, crie um novo Zap',
        'Selecione "Webhook" como app de trigger',
        'Escolha "Catch Hook" como evento',
        'Copie o URL gerado pelo Zapier',
        `Atualize o campo "URL de destino" nas configurações deste webhook`,
        'Continue a configuração no Zapier adicionando o resto do fluxo',
        'Importante: Adicione um passo "Formatter" para extrair o cabeçalho de autorização',
        'e verificar se contém o token correto'
      ],
      samplePayload: trigger ? trigger.samplePayload : this._getSamplePayload('custom_event')
    };
  }
  
  /**
   * Gera template de configuração para Pipedream
   * @param {Object} webhook - Dados do webhook
   * @returns {Object} Template para Pipedream
   */
  generatePipedreamTemplate(webhook) {
    const trigger = this.availableTriggers.find(t => t.id === webhook.trigger);
    
    return {
      template: {
        name: `DisparoSeguro - ${trigger ? trigger.name : webhook.trigger}`,
        trigger_type: 'webhook'
      },
      instructions: [
        'No Pipedream, crie um novo workflow',
        'Adicione um trigger "HTTP / Webhook"',
        'Selecione "HTTP Requests" como fonte de eventos',
        'Copie o URL do endpoint gerado',
        `Atualize o campo "URL de destino" nas configurações deste webhook`,
        'No primeiro passo do workflow, adicione código para verificar o token:',
        '```javascript',
        'export default defineComponent({',
        '  async run({ steps, $ }) {',
        '    const authHeader = steps.trigger.event.headers.authorization;',
        `    const expectedToken = "Bearer ${webhook.security_token}";`,
        '',
        '    if (authHeader !== expectedToken) {',
        '      throw new Error("Unauthorized");',
        '    }',
        '',
        '    return steps.trigger.event.body;',
        '  }',
        '});',
        '```'
      ],
      samplePayload: trigger ? trigger.samplePayload : this._getSamplePayload('custom_event')
    };
  }
  
  /**
   * Gera template para webhook genérico
   * @param {Object} webhook - Dados do webhook
   * @returns {Object} Template para webhook genérico
   */
  generateGenericWebhookTemplate(webhook) {
    const trigger = this.availableTriggers.find(t => t.id === webhook.trigger);
    
    return {
      template: {
        url: webhook.url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${webhook.security_token}`
        }
      },
      instructions: [
        'Configure seu sistema para receber webhooks no seguinte endpoint:',
        `URL: ${webhook.url}`,
        'Método: POST',
        'Headers:',
        '  Content-Type: application/json',
        `  Authorization: Bearer ${webhook.security_token}`,
        '',
        'O corpo da requisição será um objeto JSON contendo dados do evento',
        'Verifique o exemplo de payload para estruturar seu handler adequadamente'
      ],
      samplePayload: trigger ? trigger.samplePayload : this._getSamplePayload('custom_event'),
      curlExample: this._generateCurlExample(webhook)
    };
  }
  
  /**
   * Gera exemplo de comando curl para testar webhook
   * @param {Object} webhook - Dados do webhook
   * @returns {string} Comando curl
   * @private
   */
  _generateCurlExample(webhook) {
    const trigger = this.availableTriggers.find(t => t.id === webhook.trigger);
    const payload = trigger ? trigger.samplePayload : this._getSamplePayload('custom_event');
    
    return `curl -X POST "${webhook.target_url || 'SUA_URL_AQUI'}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${webhook.security_token}" \\
  -d '${JSON.stringify(payload, null, 2)}'`;
  }
  
  /**
   * Gera um ID único para webhook
   * @returns {string} ID único
   * @private
   */
  _generateWebhookId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `whk_${timestamp}${randomStr}`;
  }
  
  /**
   * Gera token de segurança para webhook
   * @returns {string} Token de segurança
   * @private
   */
  _generateSecurityToken() {
    // Combinar timestamp, chave secreta e random bytes
    const timestamp = Date.now().toString();
    const randomPart = Math.random().toString(36).substring(2, 15);
    
    // Em produção usaria crypto para maior segurança
    return btoa(`${this.config.secretKey}:${timestamp}:${randomPart}`).replace(/[=+\/]/g, '')
      .substring(0, 32);
  }
  
  /**
   * Gera uma chave secreta aleatória
   * @returns {string} Chave secreta
   * @private
   */
  _generateSecretKey() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Detecta URL base da aplicação
   * @returns {string} URL base
   * @private
   */
  _detectBaseURL() {
    try {
      // Tentar usar origem da janela
      if (typeof window !== 'undefined') {
        return window.location.origin;
      }
      
      // Fallback para localhost
      return 'http://localhost:8000';
    } catch (error) {
      return 'http://localhost:8000';
    }
  }
  
  /**
   * Obtém nome legível de um gatilho
   * @param {string} triggerId - ID do gatilho
   * @returns {string} Nome do gatilho
   * @private
   */
  _getTriggerName(triggerId) {
    const trigger = this.availableTriggers.find(t => t.id === triggerId);
    return trigger ? trigger.name : triggerId;
  }
  
  /**
   * Registra um log de depuração
   * @param {string} message - Mensagem
   * @private
   */
  _log(message) {
    if (this.config.enableLogging) {
      console.log(`[WebhookManager] ${message}`);
    }
  }
  
  /**
   * Registra um erro
   * @param {string} message - Mensagem
   * @param {Error} error - Objeto de erro
   * @private
   */
  _logError(message, error) {
    console.error(`[WebhookManager] ${message}:`, error);
  }
  
  /**
   * Retorna gatilhos disponíveis agrupados por categoria
   * @returns {Object} Gatilhos agrupados
   */
  getAvailableTriggersByCategory() {
    try {
      const grouped = {};
      
      this.availableTriggers.forEach(trigger => {
        const category = trigger.category || 'other';
        
        if (!grouped[category]) {
          grouped[category] = [];
        }
        
        grouped[category].push(trigger);
      });
      
      return grouped;
    } catch (error) {
      this._logError('Falha ao agrupar gatilhos', error);
      return {};
    }
  }
  
  /**
   * Retorna plataformas de integração disponíveis
   * @returns {Array} Plataformas
   */
  getAvailablePlatforms() {
    return this.config.enabledPlatforms
      .filter(p => this.platformTemplates[p])
      .map(p => this.platformTemplates[p]);
  }
  
  /**
   * Testa um webhook enviando um evento de teste
   * @param {string} webhookId - ID do webhook
   * @returns {Promise} Resultado do teste
   */
  async testWebhook(webhookId) {
    try {
      // Encontrar webhook
      const webhook = this.registeredWebhooks.find(w => w.id === webhookId);
      if (!webhook) {
        throw new Error(`Webhook não encontrado: ${webhookId}`);
      }
      
      // Verificar se tem URL de destino
      if (!webhook.target_url) {
        throw new Error('URL de destino não configurada');
      }
      
      const trigger = this.availableTriggers.find(t => t.id === webhook.trigger);
      const testPayload = {
        event: webhook.trigger,
        test: true,
        timestamp: new Date().toISOString(),
        webhook_id: webhook.id,
        data: trigger ? trigger.samplePayload : { message: 'Teste de webhook' }
      };
      
      // Preparar headers
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${webhook.security_token}`,
        'X-Webhook-Test': 'true'
      };
      
      // Adicionar headers personalizados
      if (webhook.custom_headers) {
        Object.keys(webhook.custom_headers).forEach(key => {
          headers[key] = webhook.custom_headers[key];
        });
      }
      
      // Enviar requisição
      const response = await fetch(webhook.target_url, {
        method: 'POST',
        headers,
        body: JSON.stringify(testPayload)
      });
      
      // Processar resposta
      const result = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString()
      };
      
      try {
        result.data = await response.json();
      } catch (e) {
        // Se não for JSON, tentar obter texto
        result.data = await response.text();
      }
      
      // Atualizar estatísticas do webhook
      webhook.last_tested = new Date().toISOString();
      webhook.last_test_result = result.success ? 'success' : 'error';
      
      // Persistir mudanças
      this._saveWebhooks();
      
      return result;
    } catch (error) {
      this._logError('Falha ao testar webhook', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Obtém detalhes de um webhook
   * @param {string} webhookId - ID do webhook
   * @returns {Object|null} Webhook ou null se não encontrado
   */
  getWebhookDetails(webhookId) {
    try {
      const webhook = this.registeredWebhooks.find(w => w.id === webhookId);
      if (!webhook) {
        return null;
      }
      
      // Encontrar detalhes do trigger
      const trigger = this.availableTriggers.find(t => t.id === webhook.trigger);
      
      // Encontrar detalhes da plataforma
      const platform = this.platformTemplates[webhook.platform];
      
      return {
        ...webhook,
        trigger_details: trigger || null,
        platform_details: platform || null
      };
    } catch (error) {
      this._logError('Falha ao obter detalhes do webhook', error);
      return null;
    }
  }
}

// Exportar para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebhookIntegrationManager;
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return WebhookIntegrationManager;
  });
} else {
  window.WebhookIntegrationManager = WebhookIntegrationManager;
}
