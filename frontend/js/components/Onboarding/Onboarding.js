/**
 * Onboarding Component
 * This component provides an interactive tutorial with AI-guided assistance
 */

// Global onboarding state
let onboardingState = {
    active: false,
    currentStep: 0,
    completedSteps: [],
    skippedSteps: [],
    userPreferences: {},
    conversationHistory: []
};

// Onboarding steps configuration
const onboardingSteps = [
    {
        id: 'welcome',
        title: 'Bem-vindo ao VoiceAI',
        content: 'Vamos mostrar como usar nossa plataforma de prospecção por voz. O assistente virtual irá orientá-lo em cada etapa.',
        element: 'body',
        position: 'center',
        actionType: 'next',
        aiPrompt: 'Você é um assistente de onboarding amigável. Apresente-se e explique brevemente que vai orientar o usuário a conhecer a plataforma VoiceAI para prospecção por voz com IA. Seja breve e cordial.'
    },
    {
        id: 'dashboard-overview',
        title: 'Painel Principal',
        content: 'Este é seu painel principal, onde você pode ver métricas e atividades recentes.',
        element: '#dashboard-page',
        position: 'right',
        actionType: 'next',
        aiPrompt: 'Explique que o painel principal mostra métricas importantes como total de leads, taxa de conversão, ligações recentes e atividades agendadas. Mencione brevemente que todas essas informações ajudam a monitorar o desempenho das campanhas.'
    },
    {
        id: 'campaigns-section',
        title: 'Gerenciamento de Campanhas',
        content: 'Aqui você pode criar e gerenciar suas campanhas de prospecção.',
        element: '#nav-campaigns',
        position: 'right',
        actionType: 'click',
        aiPrompt: 'Oriente o usuário a clicar no menu Campanhas. Explique que nessa seção ele poderá criar novas campanhas, importar leads via CSV e configurar fluxos de comunicação automatizados.'
    },
    {
        id: 'campaigns-create',
        title: 'Criando uma Campanha',
        content: 'Clique em "Nova Campanha" para criar sua primeira campanha de prospecção.',
        element: '#new-campaign-btn',
        position: 'bottom',
        actionType: 'click',
        aiPrompt: 'Oriente o usuário a criar sua primeira campanha. Explique que uma campanha organiza os leads e facilita o acompanhamento dos resultados. Mencione que é possível definir metas, períodos de execução e escolher vozes personalizadas.'
    },
    {
        id: 'campaigns-csv',
        title: 'Importação de Leads',
        content: 'Importe seus leads facilmente através de arquivos CSV.',
        element: '#csv-upload-form',
        position: 'left',
        actionType: 'next',
        aiPrompt: 'Explique como importar leads via CSV é simples e eficiente. Mencione que o sistema aceita arquivos com colunas como nome, telefone, empresa e email. Sugira formatar o CSV corretamente antes do upload para garantir uma importação sem erros.'
    },
    {
        id: 'callbacks-section',
        title: 'Agendamento de Retornos',
        content: 'Configure retornos automáticos para seus leads com lembretes integrados.',
        element: '#callbacks-table-body',
        position: 'top',
        actionType: 'next',
        aiPrompt: 'Destaque a importância do acompanhamento consistente com os leads. Explique que o sistema permite agendar retornos e enviar lembretes automáticos via SMS, WhatsApp ou email para garantir que o lead esteja disponível para a conversa agendada.'
    },
    {
        id: 'ai-models',
        title: 'Modelos de IA',
        content: 'Configure os modelos de IA, incluindo a síntese de voz com ElevenLabs.',
        element: '#nav-ai-models',
        position: 'right',
        actionType: 'click',
        aiPrompt: 'Guie o usuário para a seção de Modelos de IA. Explique a integração com ElevenLabs para síntese de voz de alta qualidade, que é um diferencial da plataforma. Mencione que é possível testar diferentes vozes e até criar vozes personalizadas com amostras de áudio.'
    },
    {
        id: 'elevenlabs-integration',
        title: 'Integração com ElevenLabs',
        content: 'Configure sua chave API do ElevenLabs e escolha vozes para suas campanhas.',
        element: '#elevenlabs-api-key',
        position: 'bottom',
        actionType: 'next',
        aiPrompt: 'Explique a importância de configurar a integração com ElevenLabs para acesso a vozes de alta qualidade. Indique onde o usuário pode obter uma chave API (elevenlabs.io) e como escolher vozes que melhor representem sua marca ou agentes.'
    },
    {
        id: 'voice-testing',
        title: 'Teste de Voz',
        content: 'Teste diferentes vozes para encontrar a ideal para suas campanhas.',
        element: '#test-voice-btn',
        position: 'right',
        actionType: 'click',
        aiPrompt: 'Incentive o usuário a testar as vozes disponíveis. Explique que a qualidade da voz é fundamental para a experiência do cliente e pode impactar significativamente as taxas de conversão. Sugira testar algumas frases típicas do seu script de vendas.'
    },
    {
        id: 'payments',
        title: 'Gerenciamento de Créditos',
        content: 'Adicione créditos para utilizar recursos premium da plataforma.',
        element: '#nav-payments',
        position: 'right',
        actionType: 'click',
        aiPrompt: 'Explique o modelo de créditos da plataforma. Mencione que os créditos são usados para recursos premium como síntese de voz, automação avançada e análise de intenção. Destaque as opções de pagamento disponíveis (PayPal e PIX).'
    },
    {
        id: 'finish',
        title: 'Pronto para Começar!',
        content: 'Você concluiu o tutorial básico. Agora você pode começar a usar a plataforma VoiceAI para impulsionar suas vendas!',
        element: 'body',
        position: 'center',
        actionType: 'finish',
        aiPrompt: 'Parabenize o usuário por completar o onboarding. Resuma os principais recursos vistos e incentive o usuário a explorar mais. Ofereça assistência contínua e mencione que ele pode reabrir o tutorial a qualquer momento através do menu de ajuda.'
    }
];

/**
 * Initialize the onboarding component
 */
function initOnboarding() {
    // Check if first time user
    const isFirstTimeUser = !localStorage.getItem('onboarding_completed');
    
    // Add onboarding button to help menu
    addOnboardingButton();
    
    // Start onboarding automatically for first-time users
    if (isFirstTimeUser) {
        setTimeout(() => {
            startOnboarding();
        }, 2000); // Delay to ensure page is fully loaded
    }
}

/**
 * Add onboarding button to the help menu
 */
function addOnboardingButton() {
    const helpMenu = document.querySelector('.dropdown-menu.help-menu');
    
    if (helpMenu) {
        const onboardingItem = document.createElement('a');
        onboardingItem.className = 'dropdown-item';
        onboardingItem.href = '#';
        onboardingItem.id = 'start-onboarding-btn';
        onboardingItem.innerHTML = '<i class="fas fa-play-circle me-2"></i> Iniciar Tutorial Interativo';
        
        helpMenu.insertBefore(onboardingItem, helpMenu.firstChild);
        
        // Add event listener
        onboardingItem.addEventListener('click', (e) => {
            e.preventDefault();
            startOnboarding();
        });
    }
}

/**
 * Start the onboarding process
 */
function startOnboarding() {
    // Reset onboarding state
    onboardingState = {
        active: true,
        currentStep: 0,
        completedSteps: [],
        skippedSteps: [],
        userPreferences: {},
        conversationHistory: []
    };
    
    // Create onboarding UI
    createOnboardingUI();
    
    // Start first step
    showOnboardingStep(0);
}

/**
 * Create the onboarding UI elements
 */
function createOnboardingUI() {
    // Remove existing onboarding UI if any
    removeOnboardingUI();
    
    // Create main container
    const onboardingContainer = document.createElement('div');
    onboardingContainer.id = 'onboarding-container';
    onboardingContainer.className = 'onboarding-container';
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'onboarding-tooltip';
    tooltip.className = 'onboarding-tooltip';
    
    // Create AI assistant panel
    const aiPanel = document.createElement('div');
    aiPanel.id = 'onboarding-ai-panel';
    aiPanel.className = 'onboarding-ai-panel';
    aiPanel.innerHTML = `
        <div class="onboarding-ai-header">
            <div class="ai-avatar">
                <img src="img/avatar-placeholder.jpg" alt="AI Assistant">
            </div>
            <div class="ai-info">
                <h4>Assistente VoiceAI</h4>
                <span class="ai-status">online</span>
            </div>
            <button id="minimize-ai-panel" class="btn btn-sm btn-light">
                <i class="fas fa-minus"></i>
            </button>
        </div>
        <div class="onboarding-ai-body">
            <div id="ai-messages" class="ai-messages"></div>
        </div>
        <div class="onboarding-ai-footer">
            <div class="input-group">
                <input type="text" id="ai-input" class="form-control" placeholder="Faça uma pergunta...">
                <button id="ai-send-btn" class="btn btn-primary">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.className = 'onboarding-overlay';
    
    // Append elements to the body
    document.body.appendChild(overlay);
    document.body.appendChild(tooltip);
    document.body.appendChild(aiPanel);
    document.body.appendChild(onboardingContainer);
    
    // Add event listeners
    document.getElementById('minimize-ai-panel').addEventListener('click', toggleAIPanel);
    document.getElementById('ai-send-btn').addEventListener('click', sendUserMessage);
    document.getElementById('ai-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendUserMessage();
        }
    });
    
    // Add onboarding styles
    addOnboardingStyles();
}

/**
 * Add onboarding CSS styles
 */
function addOnboardingStyles() {
    const styleId = 'onboarding-styles';
    
    // Check if already exists
    if (document.getElementById(styleId)) {
        return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = `
        .onboarding-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 9998;
            pointer-events: none;
        }
        
        .onboarding-tooltip {
            position: absolute;
            max-width: 350px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            padding: 15px;
            z-index: 10000;
            transition: all 0.3s ease;
            display: none;
        }
        
        .onboarding-tooltip-title {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 10px;
            color: #333;
        }
        
        .onboarding-tooltip-content {
            font-size: 0.95rem;
            margin-bottom: 15px;
            color: #555;
        }
        
        .onboarding-tooltip-actions {
            display: flex;
            justify-content: space-between;
        }
        
        .onboarding-highlight {
            position: absolute;
            z-index: 9999;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
            pointer-events: auto;
            border-radius: 4px;
        }
        
        .onboarding-ai-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            height: 450px;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            display: flex;
            flex-direction: column;
            z-index: 10001;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .onboarding-ai-panel.minimized {
            height: 60px;
        }
        
        .onboarding-ai-header {
            display: flex;
            align-items: center;
            padding: 10px 15px;
            background-color: #f8f9fa;
            border-bottom: 1px solid #eaeaea;
        }
        
        .ai-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            margin-right: 10px;
        }
        
        .ai-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .ai-info {
            flex: 1;
        }
        
        .ai-info h4 {
            font-size: 0.95rem;
            margin: 0;
        }
        
        .ai-status {
            font-size: 0.8rem;
            color: #28a745;
        }
        
        .onboarding-ai-body {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            background-color: #f5f7f9;
        }
        
        .ai-messages {
            display: flex;
            flex-direction: column;
        }
        
        .message {
            max-width: 80%;
            padding: 10px 15px;
            border-radius: 18px;
            margin-bottom: 10px;
            word-break: break-word;
        }
        
        .message.ai {
            background-color: #e3f2fd;
            color: #0d47a1;
            align-self: flex-start;
            border-bottom-left-radius: 5px;
        }
        
        .message.user {
            background-color: #e8f5e9;
            color: #1b5e20;
            align-self: flex-end;
            border-bottom-right-radius: 5px;
        }
        
        .message-time {
            font-size: 0.7rem;
            color: #999;
            margin-top: 5px;
        }
        
        .onboarding-ai-footer {
            padding: 10px 15px;
            border-top: 1px solid #eaeaea;
        }
        
        .typing-indicator {
            display: inline-block;
            width: 30px;
            text-align: center;
        }
        
        .typing-indicator span {
            display: inline-block;
            width: 6px;
            height: 6px;
            background-color: #0d6efd;
            border-radius: 50%;
            margin: 0 1px;
            animation: typing 1.4s infinite both;
        }
        
        .typing-indicator span:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
            animation-delay: 0.4s;
        }
        
        @keyframes typing {
            0% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
            100% { transform: translateY(0); }
        }
    `;
    
    document.head.appendChild(styleElement);
}

/**
 * Remove onboarding UI
 */
function removeOnboardingUI() {
    const elements = [
        'onboarding-container',
        'onboarding-tooltip',
        'onboarding-ai-panel',
        'onboarding-overlay'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    });
    
    // Remove any highlight classes
    const highlights = document.querySelectorAll('.onboarding-highlight');
    highlights.forEach(el => {
        el.classList.remove('onboarding-highlight');
    });
}

/**
 * Show a specific onboarding step
 * @param {number} stepIndex - The index of the step to show
 */
function showOnboardingStep(stepIndex) {
    // Update current step
    onboardingState.currentStep = stepIndex;
    
    // Get step data
    const step = onboardingSteps[stepIndex];
    
    if (!step) {
        console.error('Step not found');
        return;
    }
    
    // Get target element
    const targetElement = document.querySelector(step.element);
    
    if (!targetElement && step.element !== 'body') {
        console.error(`Target element not found: ${step.element}`);
        
        // Try to navigate to the correct page if possible
        if (step.element.startsWith('#nav-')) {
            const navId = step.element.substring(1); // Remove the # prefix
            const navItem = document.getElementById(navId);
            if (navItem) {
                navItem.click();
                // Try again after navigation
                setTimeout(() => showOnboardingStep(stepIndex), 500);
                return;
            }
        }
        
        // Skip this step if element still not found
        nextOnboardingStep();
        return;
    }
    
    // Add highlight to target element
    if (targetElement) {
        // Clear previous highlights
        const highlights = document.querySelectorAll('.onboarding-highlight');
        highlights.forEach(el => {
            el.classList.remove('onboarding-highlight');
        });
        
        // Add highlight class to target
        targetElement.classList.add('onboarding-highlight');
    }
    
    // Position tooltip
    positionTooltip(step, targetElement);
    
    // Add content to tooltip
    updateTooltipContent(step);
    
    // Show tooltip
    const tooltip = document.getElementById('onboarding-tooltip');
    tooltip.style.display = 'block';
    
    // Show AI message for this step
    showAIMessage(step.aiPrompt, true);
}

/**
 * Position the tooltip relative to the target element
 * @param {Object} step - The step data
 * @param {Element} targetElement - The target DOM element
 */
function positionTooltip(step, targetElement) {
    const tooltip = document.getElementById('onboarding-tooltip');
    
    if (step.element === 'body' || !targetElement) {
        // Center in the viewport
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
        return;
    }
    
    const tooltipWidth = 350; // Max width of tooltip
    const spacing = 20; // Spacing between tooltip and target
    
    // Get target position
    const targetRect = targetElement.getBoundingClientRect();
    
    // Calculate tooltip position based on specified position
    let top, left;
    
    switch (step.position) {
        case 'top':
            top = targetRect.top - tooltip.offsetHeight - spacing;
            left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
            break;
            
        case 'bottom':
            top = targetRect.bottom + spacing;
            left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
            break;
            
        case 'left':
            top = targetRect.top + (targetRect.height / 2) - (tooltip.offsetHeight / 2);
            left = targetRect.left - tooltipWidth - spacing;
            break;
            
        case 'right':
            top = targetRect.top + (targetRect.height / 2) - (tooltip.offsetHeight / 2);
            left = targetRect.right + spacing;
            break;
            
        case 'center':
        default:
            top = targetRect.top + (targetRect.height / 2) - (tooltip.offsetHeight / 2);
            left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
            break;
    }
    
    // Ensure tooltip stays within viewport
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    
    // Adjust horizontal position
    if (left < spacing) {
        left = spacing;
    } else if (left + tooltipWidth > viewport.width - spacing) {
        left = viewport.width - tooltipWidth - spacing;
    }
    
    // Adjust vertical position
    if (top < spacing) {
        top = spacing;
    } else if (top + tooltip.offsetHeight > viewport.height - spacing) {
        top = viewport.height - tooltip.offsetHeight - spacing;
    }
    
    // Apply position
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.transform = 'none';
}

/**
 * Update tooltip content
 * @param {Object} step - The step data
 */
function updateTooltipContent(step) {
    const tooltip = document.getElementById('onboarding-tooltip');
    
    tooltip.innerHTML = `
        <div class="onboarding-tooltip-title">${step.title}</div>
        <div class="onboarding-tooltip-content">${step.content}</div>
        <div class="onboarding-tooltip-actions">
            <button id="onboarding-skip-btn" class="btn btn-sm btn-outline-secondary">Pular</button>
            <div>
                <button id="onboarding-back-btn" class="btn btn-sm btn-outline-primary me-2" ${onboardingState.currentStep === 0 ? 'disabled' : ''}>Voltar</button>
                <button id="onboarding-next-btn" class="btn btn-sm btn-primary">
                    ${step.actionType === 'finish' ? 'Concluir' : (step.actionType === 'click' ? 'Clique para Continuar' : 'Próximo')}
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('onboarding-skip-btn').addEventListener('click', skipOnboardingStep);
    document.getElementById('onboarding-back-btn').addEventListener('click', previousOnboardingStep);
    document.getElementById('onboarding-next-btn').addEventListener('click', () => handleStepAction(step));
}

/**
 * Handle step action
 * @param {Object} step - The step data
 */
function handleStepAction(step) {
    switch (step.actionType) {
        case 'click':
            // Simulate a click on the target element
            const targetElement = document.querySelector(step.element);
            if (targetElement) {
                targetElement.click();
                
                // Wait for navigation and then move to next step
                setTimeout(() => {
                    nextOnboardingStep();
                }, 500);
            } else {
                nextOnboardingStep();
            }
            break;
            
        case 'finish':
            // End onboarding
            finishOnboarding();
            break;
            
        case 'next':
        default:
            // Move to the next step
            nextOnboardingStep();
            break;
    }
}

/**
 * Move to the next onboarding step
 */
function nextOnboardingStep() {
    // Add current step to completed steps
    onboardingState.completedSteps.push(onboardingState.currentStep);
    
    // Move to next step
    const nextStep = onboardingState.currentStep + 1;
    
    if (nextStep < onboardingSteps.length) {
        showOnboardingStep(nextStep);
    } else {
        finishOnboarding();
    }
}

/**
 * Move to the previous onboarding step
 */
function previousOnboardingStep() {
    // Move to previous step
    const prevStep = onboardingState.currentStep - 1;
    
    if (prevStep >= 0) {
        showOnboardingStep(prevStep);
    }
}

/**
 * Skip the current onboarding step
 */
function skipOnboardingStep() {
    // Add current step to skipped steps
    onboardingState.skippedSteps.push(onboardingState.currentStep);
    
    // Move to next step
    nextOnboardingStep();
}

/**
 * Finish the onboarding process
 */
function finishOnboarding() {
    // Save completion status
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_completed_at', new Date().toISOString());
    localStorage.setItem('onboarding_version', '1.0');
    
    // Remove UI
    removeOnboardingUI();
    
    // Reset state
    onboardingState.active = false;
    
    // Show completion message
    showToast('Tutorial concluído com sucesso! Você pode reabri-lo a qualquer momento através do menu de ajuda.');
}

/**
 * Show AI message in the chat panel
 * @param {string} prompt - The AI prompt
 * @param {boolean} isSystem - Whether this is a system-initiated message
 */
function showAIMessage(prompt, isSystem = false) {
    const messagesContainer = document.getElementById('ai-messages');
    
    // If this is an AI prompt from a system step, use a simulated response
    if (isSystem) {
        // Add typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message ai typing';
        typingIndicator.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesContainer.appendChild(typingIndicator);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // In a real app, you would call your backend AI service
        // Simulate a delayed response
        setTimeout(() => {
            // Remove typing indicator
            typingIndicator.remove();
            
            // Generate a simulated response based on the prompt
            const aiResponse = generateAIResponse(prompt);
            
            // Add AI message
            const messageElement = document.createElement('div');
            messageElement.className = 'message ai';
            messageElement.textContent = aiResponse;
            
            // Add time
            const timeElement = document.createElement('div');
            timeElement.className = 'message-time';
            timeElement.textContent = formatTime(new Date());
            messageElement.appendChild(timeElement);
            
            messagesContainer.appendChild(messageElement);
            
            // Add to conversation history
            onboardingState.conversationHistory.push({
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date().toISOString()
            });
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1500);
    } else {
        // Handle direct AI prompts (not from system steps)
        // In a real implementation, this would call your backend AI service
    }
}

/**
 * Generate a simulated AI response based on the prompt
 * @param {string} prompt - The AI prompt
 * @returns {string} - The simulated AI response
 */
function generateAIResponse(prompt) {
    // Basic responses for each step
    // In a real implementation, this would be replaced with actual AI service calls
    
    if (prompt.includes('Apresente-se')) {
        return "Olá! Sou seu assistente do VoiceAI. Estou aqui para guiá-lo pela plataforma e ajudar a aproveitar ao máximo todas as funcionalidades de prospecção por voz com IA. Vamos começar?";
    }
    
    if (prompt.includes('painel principal')) {
        return "Este é seu painel principal. Aqui você pode acompanhar métricas importantes como total de leads, taxa de conversão e atividades recentes. Os gráficos mostram o desempenho de suas campanhas, permitindo identificar tendências e oportunidades de melhoria.";
    }
    
    if (prompt.includes('Oriente o usuário a clicar no menu Campanhas')) {
        return "Vamos ver agora a seção de Campanhas! Clique no menu Campanhas no lado esquerdo. Lá você poderá criar novas campanhas, importar leads via CSV e configurar fluxos de comunicação automatizados para maximizar suas conversões.";
    }
    
    if (prompt.includes('criar sua primeira campanha')) {
        return "Agora vamos criar sua primeira campanha! Clique no botão 'Nova Campanha'. Uma campanha organiza todos os seus leads e facilita o acompanhamento dos resultados. Você pode definir metas, períodos de execução e até escolher vozes personalizadas para suas ligações automáticas.";
    }
    
    if (prompt.includes('importar leads via CSV')) {
        return "Esta seção permite importar seus contatos através de arquivos CSV - uma forma rápida e eficiente de adicionar múltiplos leads de uma vez. Certifique-se de que seu CSV esteja formatado com colunas como nome, telefone, empresa e email para uma importação sem problemas.";
    }
    
    if (prompt.includes('importância do acompanhamento')) {
        return "O acompanhamento consistente é fundamental para converter leads! Aqui você pode agendar retornos automáticos e configurar lembretes via SMS, WhatsApp ou email. Isso garante que seus leads estejam disponíveis e preparados para a conversa quando você ligar.";
    }
    
    if (prompt.includes('Guie o usuário para a seção de Modelos de IA')) {
        return "Vamos explorar os modelos de IA! Clique no menu de Modelos de IA. Nossa integração com ElevenLabs para síntese de voz é um diferencial da plataforma, oferecendo vozes extremamente naturais que aumentam significativamente as taxas de engajamento.";
    }
    
    if (prompt.includes('importância de configurar a integração com ElevenLabs')) {
        return "Para aproveitar nossa síntese de voz de alta qualidade, você precisa configurar sua chave API do ElevenLabs. Você pode obter essa chave em elevenlabs.io e inseri-la aqui. Depois disso, terá acesso a diversas vozes naturais ou poderá criar vozes personalizadas para seus agentes.";
    }
    
    if (prompt.includes('testar as vozes')) {
        return "Teste diferentes vozes para encontrar a ideal para suas campanhas! A qualidade da voz tem grande impacto na experiência do cliente e pode aumentar significativamente suas taxas de conversão. Experimente testar frases que você utilizaria em seus scripts de vendas para escolher a voz mais adequada.";
    }
    
    if (prompt.includes('modelo de créditos')) {
        return "Nossa plataforma utiliza um sistema de créditos para recursos premium. Os créditos são consumidos ao utilizar síntese de voz, automação avançada e análise de intenção. Você pode adquirir créditos facilmente através de PayPal ou PIX, com planos que se ajustam ao seu volume de uso.";
    }
    
    if (prompt.includes('Parabenize o usuário')) {
        return "Parabéns! Você concluiu o tutorial básico da plataforma VoiceAI. Agora você conhece os principais recursos como campanhas, importação de leads, agendamento de retornos e síntese de voz com IA. Estou sempre à disposição para ajudar! Você pode reabrir este tutorial a qualquer momento através do menu de ajuda.";
    }
    
    // Default response
    return "Entendido! Vamos continuar explorando a plataforma VoiceAI. Se tiver alguma dúvida específica, é só me perguntar.";
}

/**
 * Send user message to AI assistant
 */
function sendUserMessage() {
    const input = document.getElementById('ai-input');
    const message = input.value.trim();
    
    if (!message) {
        return;
    }
    
    // Clear input
    input.value = '';
    
    // Add user message to UI
    const messagesContainer = document.getElementById('ai-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message user';
    messageElement.textContent = message;
    
    // Add time
    const timeElement = document.createElement('div');
    timeElement.className = 'message-time';
    timeElement.textContent = formatTime(new Date());
    messageElement.appendChild(timeElement);
    
    messagesContainer.appendChild(messageElement);
    
    // Add to conversation history
    onboardingState.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Generate AI response
    // In a real implementation, this would call your backend AI service
    // For now, simulate a response
    simulateAIResponse(message);
}

/**
 * Simulate AI response to user message
 * @param {string} userMessage - The user message
 */
function simulateAIResponse(userMessage) {
    const messagesContainer = document.getElementById('ai-messages');
    
    // Add typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message ai typing';
    typingIndicator.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    messagesContainer.appendChild(typingIndicator);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Simulate thinking time
    setTimeout(() => {
        // Remove typing indicator
        typingIndicator.remove();
        
        // Generate response based on keywords
        let response = "";
        
        if (userMessage.toLowerCase().includes('como') && userMessage.toLowerCase().includes('campanha')) {
            response = "Para criar uma campanha, vá para a seção de Campanhas no menu lateral e clique no botão 'Nova Campanha'. Preencha as informações básicas como nome, descrição e datas. Em seguida, você pode importar leads via CSV ou adicionar leads manualmente.";
        } 
        else if (userMessage.toLowerCase().includes('csv') || userMessage.toLowerCase().includes('importar')) {
            response = "Para importar leads via CSV, acesse a seção de Campanhas, escolha a campanha desejada e use o formulário de upload de CSV. Certifique-se de que seu arquivo tenha colunas como nome, telefone, email e empresa para melhor organização dos dados.";
        }
        else if (userMessage.toLowerCase().includes('elevenlab') || userMessage.toLowerCase().includes('voz')) {
            response = "A integração com ElevenLabs permite síntese de voz de alta qualidade. Você precisa configurar sua chave API na seção de Modelos de IA. Após configurar, você pode escolher entre diversas vozes ou criar vozes personalizadas para suas campanhas.";
        }
        else if (userMessage.toLowerCase().includes('agendar') || userMessage.toLowerCase().includes('retorno') || userMessage.toLowerCase().includes('lembrete')) {
            response = "Para agendar retornos, vá até a seção de Campanhas e use a funcionalidade de 'Agendamento de Retornos'. Você pode definir data, hora e configurar lembretes automáticos via SMS, WhatsApp ou email para seus leads.";
        }
        else if (userMessage.toLowerCase().includes('crédito') || userMessage.toLowerCase().includes('pagamento') || userMessage.toLowerCase().includes('pix') || userMessage.toLowerCase().includes('paypal')) {
            response = "Você pode adquirir créditos na seção de Pagamentos. Aceitamos PayPal e PIX. Os créditos são usados para recursos premium como síntese de voz, automação avançada e análise de intenção.";
        }
        else if (userMessage.toLowerCase().includes('obrigado') || userMessage.toLowerCase().includes('ajudou') || userMessage.toLowerCase().includes('útil')) {
            response = "Fico feliz em ajudar! Se precisar de mais assistência, estou à disposição. Você pode reabrir este tutorial a qualquer momento através do menu de ajuda.";
        }
        else {
            response = "Obrigado pela sua pergunta! Como assistente do VoiceAI, posso ajudar com questões sobre campanhas, importação de leads, síntese de voz, agendamentos de retornos e muito mais. Poderia especificar melhor sua dúvida?";
        }
        
        // Add AI message
        const messageElement = document.createElement('div');
        messageElement.className = 'message ai';
        messageElement.textContent = response;
        
        // Add time
        const timeElement = document.createElement('div');
        timeElement.className = 'message-time';
        timeElement.textContent = formatTime(new Date());
        messageElement.appendChild(timeElement);
        
        messagesContainer.appendChild(messageElement);
        
        // Add to conversation history
        onboardingState.conversationHistory.push({
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString()
        });
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1500);
}

/**
 * Toggle AI panel minimized state
 */
function toggleAIPanel() {
    const panel = document.getElementById('onboarding-ai-panel');
    panel.classList.toggle('minimized');
    
    const button = document.getElementById('minimize-ai-panel');
    if (panel.classList.contains('minimized')) {
        button.innerHTML = '<i class="fas fa-expand"></i>';
    } else {
        button.innerHTML = '<i class="fas fa-minus"></i>';
    }
}

/**
 * Format time for chat messages
 * @param {Date} date - The date to format
 * @returns {string} - The formatted time string
 */
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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