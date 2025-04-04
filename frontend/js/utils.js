/**
 * Utilitários globais para a plataforma VoiceAI
 * Este arquivo contém funções de utilidade compartilhadas em toda a aplicação
 */

// Função de toast para mensagens
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '5000';
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
    
    // Set toast background color based on type
    let bgColor, iconClass;
    
    switch (type) {
        case 'success':
            bgColor = 'bg-success text-white';
            iconClass = 'fa-check-circle';
            break;
        case 'error':
            bgColor = 'bg-danger text-white';
            iconClass = 'fa-exclamation-circle';
            break;
        case 'warning':
            bgColor = 'bg-warning text-dark';
            iconClass = 'fa-exclamation-triangle';
            break;
        case 'info':
        default:
            bgColor = 'bg-info text-white';
            iconClass = 'fa-info-circle';
            break;
    }
    
    // Create toast content
    toast.innerHTML = `
        <div class="toast-header ${bgColor}">
            <i class="fas ${iconClass} me-2"></i>
            <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
            <small>Agora</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Initialize Bootstrap toast
    try {
        const bootstrapToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 5000
        });
        
        // Show toast
        bootstrapToast.show();
    } catch (error) {
        console.error('Error initializing Bootstrap toast:', error);
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            toast.remove();
        }, 5000);
    }
    
    // Remove toast from DOM after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
        
        // Remove container if it's empty
        if (toastContainer.children.length === 0) {
            toastContainer.remove();
        }
    });
}

// Expor funções globalmente
window.showToast = showToast;

// Função simples para carregar templates em contêineres
function loadTemplate(templateId, containerId, data = {}) {
    const template = document.getElementById(templateId);
    const container = document.getElementById(containerId);
    
    if (!template || !container) {
        console.error(`Template #${templateId} or container #${containerId} not found.`);
        return;
    }
    
    let content = template.innerHTML;
    
    // Substituir variáveis no template
    Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, data[key]);
    });
    
    container.innerHTML = content;
}

// Expor loadTemplate globalmente
window.loadTemplate = loadTemplate;

// Função para formatação de data
function formatDate(dateString, options = {}) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: options.showTime ? '2-digit' : undefined,
        minute: options.showTime ? '2-digit' : undefined,
        ...options
    }).format(date);
}

// Expor formatDate globalmente
window.formatDate = formatDate;

// Função para formatação de moeda
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Expor formatCurrency globalmente
window.formatCurrency = formatCurrency;
