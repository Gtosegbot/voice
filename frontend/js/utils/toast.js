/**
 * Toast utility for displaying notifications
 */

/**
 * Show a toast message
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, warning, info)
 */
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
    const bootstrapToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 5000
    });
    
    // Show toast
    bootstrapToast.show();
    
    // Remove toast from DOM after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
        
        // Remove container if it's empty
        if (toastContainer.children.length === 0) {
            toastContainer.remove();
        }
    });
}

export { showToast };