/**
 * Payments Component
 * This component renders the payments page with PayPal subscription and PIX payment options
 */

/**
 * Initialize the payments page
 */
function initPayments() {
    renderPayments();
    setupPaymentsEvents();
    initPaypalButton();
}

/**
 * Render the payments HTML
 */
function renderPayments() {
    const paymentsPage = document.getElementById('payments-page');
    
    paymentsPage.innerHTML = `
        <div class="container py-4">
            <div class="row mb-4">
                <div class="col-12">
                    <h1 class="page-title">Adicionar Créditos</h1>
                    <p class="lead">Adicione créditos para utilizar recursos premium como síntese de voz ElevenLabs e automação avançada de campanhas.</p>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-8">
                    <div class="card mb-4">
                        <div class="card-header bg-primary text-white">
                            <h5 class="mb-0">Plano de Créditos Premium</h5>
                        </div>
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-7">
                                    <h4>R$ 49,90 / mês</h4>
                                    <ul class="list-group list-group-flush mb-3">
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <span><i class="fas fa-check text-success me-2"></i> 1000 minutos de síntese de voz ElevenLabs</span>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <span><i class="fas fa-check text-success me-2"></i> Campanhas automáticas ilimitadas</span>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <span><i class="fas fa-check text-success me-2"></i> Integração com WhatsApp</span>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <span><i class="fas fa-check text-success me-2"></i> Suporte prioritário</span>
                                        </li>
                                    </ul>
                                </div>
                                <div class="col-md-5">
                                    <div id="payment-options">
                                        <div class="d-grid gap-3">
                                            <div id="paypal-button-container-P-2DS65966SJ741222HM7UCBNY"></div>
                                            <hr>
                                            <button type="button" class="btn btn-outline-primary w-100" id="show-pix-btn">
                                                <i class="fas fa-qrcode me-2"></i> Pagar com PIX
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mb-4" id="credits-history-card">
                        <div class="card-header">
                            <h5 class="mb-0">Histórico de Créditos</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Descrição</th>
                                            <th>Valor</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody id="credits-history-table-body">
                                        <!-- Will be populated dynamically -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0">Seu Saldo</h5>
                        </div>
                        <div class="card-body">
                            <div class="text-center mb-3">
                                <h2 id="current-balance">0</h2>
                                <p class="text-muted">créditos disponíveis</p>
                            </div>
                            
                            <hr>
                            
                            <h6 class="mb-3">Consumo de Créditos</h6>
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    Síntese de Voz
                                    <span class="badge bg-primary rounded-pill" id="voice-synthesis-usage">0</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    Transcrição de Áudio
                                    <span class="badge bg-primary rounded-pill" id="audio-transcription-usage">0</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    Análise de Intenção
                                    <span class="badge bg-primary rounded-pill" id="intent-analysis-usage">0</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    Envio de Mensagens
                                    <span class="badge bg-primary rounded-pill" id="message-sending-usage">0</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0">Precisa de ajuda?</h5>
                        </div>
                        <div class="card-body">
                            <p>Se você tiver dúvidas sobre pagamentos ou créditos, entre em contato com nossa equipe de suporte.</p>
                            <a href="#" class="btn btn-outline-primary w-100">
                                <i class="fas fa-headset me-2"></i> Contatar Suporte
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- PIX Modal -->
        <div class="modal fade" id="pix-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Pagamento via PIX</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center">
                        <div class="mb-3">
                            <p>Para pagar via PIX, utilize a chave abaixo:</p>
                            <div class="d-flex align-items-center justify-content-center mb-3">
                                <input type="text" class="form-control text-center me-2" 
                                       id="pix-key" 
                                       value="ff576050-99a7-4158-b4ea-1eb0db3098ac" 
                                       readonly>
                                <button class="btn btn-outline-primary" id="copy-pix-key-btn">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                            <div class="alert alert-success copy-success-alert" style="display: none;">
                                Chave PIX copiada com sucesso!
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <p><strong>Valor:</strong> R$ 49,90</p>
                        </div>
                        
                        <div class="mb-3">
                            <p>Após realizar o pagamento, preencha as informações abaixo:</p>
                            <form id="pix-confirmation-form">
                                <div class="mb-3">
                                    <label for="transaction-id" class="form-label">ID da Transação (opcional)</label>
                                    <input type="text" class="form-control" id="transaction-id">
                                </div>
                                <div class="mb-3">
                                    <label for="payment-date" class="form-label">Data do Pagamento</label>
                                    <input type="date" class="form-control" id="payment-date" required>
                                </div>
                                <div class="mb-3">
                                    <label for="payment-proof" class="form-label">Comprovante (opcional)</label>
                                    <input type="file" class="form-control" id="payment-proof">
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Confirmar Pagamento</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Success Modal -->
        <div class="modal fade" id="payment-success-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Pagamento Recebido</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center">
                        <div class="mb-4">
                            <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                        </div>
                        <h4>Obrigado pelo seu pagamento!</h4>
                        <p>Seus créditos foram adicionados à sua conta.</p>
                        <p>Novo saldo: <strong id="new-balance-value">1000</strong> créditos</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load PayPal SDK
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=AZI2sTv8bYOkmVRO73vBUXQwupNyLRDQRARKALCehF_fa9lZydHeIYPOZX6X6-c53-l9ZgygdCqA_XHr&vault=true&intent=subscription';
    script.setAttribute('data-sdk-integration-source', 'button-factory');
    document.head.appendChild(script);
}

/**
 * Setup event listeners for payment page
 */
function setupPaymentsEvents() {
    // Show PIX modal
    const showPixBtn = document.getElementById('show-pix-btn');
    if (showPixBtn) {
        showPixBtn.addEventListener('click', () => {
            const pixModal = new bootstrap.Modal(document.getElementById('pix-modal'));
            pixModal.show();
        });
    }
    
    // Copy PIX key
    const copyPixKeyBtn = document.getElementById('copy-pix-key-btn');
    if (copyPixKeyBtn) {
        copyPixKeyBtn.addEventListener('click', () => {
            const pixKey = document.getElementById('pix-key');
            pixKey.select();
            document.execCommand('copy');
            
            const alert = document.querySelector('.copy-success-alert');
            alert.style.display = 'block';
            
            setTimeout(() => {
                alert.style.display = 'none';
            }, 3000);
        });
    }
    
    // PIX confirmation form
    const pixConfirmationForm = document.getElementById('pix-confirmation-form');
    if (pixConfirmationForm) {
        pixConfirmationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // In a real app, you would send this data to your API
            console.log('PIX payment confirmation:', {
                transactionId: document.getElementById('transaction-id').value,
                paymentDate: document.getElementById('payment-date').value,
                paymentProof: document.getElementById('payment-proof').files[0]
            });
            
            // Close PIX modal
            const pixModal = bootstrap.Modal.getInstance(document.getElementById('pix-modal'));
            pixModal.hide();
            
            // Show success modal
            const successModal = new bootstrap.Modal(document.getElementById('payment-success-modal'));
            successModal.show();
            
            // Update balance
            updateBalance(1000);
            
            // Reset form
            pixConfirmationForm.reset();
        });
    }
    
    // Load credits history
    loadCreditsHistory();
    
    // Load current balance
    loadCurrentBalance();
}

/**
 * Initialize PayPal button
 */
function initPaypalButton() {
    // This function will be called after the PayPal SDK is loaded
    if (typeof paypal !== 'undefined') {
        paypal.Buttons({
            style: {
                shape: 'pill',
                color: 'blue',
                layout: 'vertical',
                label: 'subscribe'
            },
            createSubscription: function(data, actions) {
                return actions.subscription.create({
                    /* Creates the subscription */
                    plan_id: 'P-2DS65966SJ741222HM7UCBNY'
                });
            },
            onApprove: function(data, actions) {
                // In a real app, you would send this data to your API
                console.log('PayPal subscription:', {
                    subscriptionID: data.subscriptionID
                });
                
                // Show success modal
                const successModal = new bootstrap.Modal(document.getElementById('payment-success-modal'));
                successModal.show();
                
                // Update balance
                updateBalance(1000);
            }
        }).render('#paypal-button-container-P-2DS65966SJ741222HM7UCBNY');
    } else {
        // If PayPal is not loaded yet, try again in 1 second
        setTimeout(initPaypalButton, 1000);
    }
}

/**
 * Load credits history
 */
function loadCreditsHistory() {
    const tableBody = document.getElementById('credits-history-table-body');
    
    // For demonstration, we're using mock data
    const mockHistory = [
        {
            date: '2023-03-15',
            description: 'Assinatura Premium',
            amount: 1000,
            status: 'approved'
        },
        {
            date: '2023-03-14',
            description: 'Consumo de Síntese de Voz',
            amount: -215,
            status: 'completed'
        },
        {
            date: '2023-03-10',
            description: 'Pacote Adicional',
            amount: 500,
            status: 'approved'
        },
        {
            date: '2023-03-05',
            description: 'Consumo de Transcrição',
            amount: -150,
            status: 'completed'
        }
    ];
    
    const rows = mockHistory.map(item => {
        // Format date
        const date = new Date(item.date).toLocaleDateString('pt-BR');
        
        // Amount class (positive/negative)
        const amountClass = item.amount >= 0 ? 'text-success' : 'text-danger';
        const amountSign = item.amount >= 0 ? '+' : '';
        
        // Status badge
        let statusBadge;
        switch (item.status) {
            case 'approved':
                statusBadge = '<span class="badge bg-success">Aprovado</span>';
                break;
            case 'pending':
                statusBadge = '<span class="badge bg-warning text-dark">Pendente</span>';
                break;
            case 'rejected':
                statusBadge = '<span class="badge bg-danger">Rejeitado</span>';
                break;
            case 'completed':
                statusBadge = '<span class="badge bg-info">Concluído</span>';
                break;
            default:
                statusBadge = `<span class="badge bg-secondary">${item.status}</span>`;
        }
        
        return `
            <tr>
                <td>${date}</td>
                <td>${item.description}</td>
                <td class="${amountClass}">${amountSign}${item.amount}</td>
                <td>${statusBadge}</td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = rows || '<tr><td colspan="4" class="text-center">Nenhum histórico de créditos.</td></tr>';
}

/**
 * Load current balance and usage statistics
 */
function loadCurrentBalance() {
    // For demonstration, we're using mock data
    const mockBalance = {
        total: 1135,
        usage: {
            voiceSynthesis: 215,
            audioTranscription: 150,
            intentAnalysis: 80,
            messageSending: 120
        }
    };
    
    // Update balance display
    document.getElementById('current-balance').textContent = mockBalance.total;
    
    // Update usage statistics
    document.getElementById('voice-synthesis-usage').textContent = mockBalance.usage.voiceSynthesis;
    document.getElementById('audio-transcription-usage').textContent = mockBalance.usage.audioTranscription;
    document.getElementById('intent-analysis-usage').textContent = mockBalance.usage.intentAnalysis;
    document.getElementById('message-sending-usage').textContent = mockBalance.usage.messageSending;
}

/**
 * Update balance
 * @param {number} amount - Amount to add to balance
 */
function updateBalance(amount) {
    const currentBalance = parseInt(document.getElementById('current-balance').textContent);
    const newBalance = currentBalance + amount;
    
    document.getElementById('current-balance').textContent = newBalance;
    document.getElementById('new-balance-value').textContent = newBalance;
    
    // In a real app, you would send this update to your API
    console.log('Balance updated:', {
        previousBalance: currentBalance,
        amount: amount,
        newBalance: newBalance
    });
    
    // Refresh history
    loadCreditsHistory();
}