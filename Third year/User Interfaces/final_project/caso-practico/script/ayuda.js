// ===========================
// HELP PAGE FUNCTIONALITY
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    initializeFAQ();
    initializeContactOptions();
    initializeHelpActions();
    initializeUserSession();
});

// FAQ Accordion Functionality
function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
            
            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

// Contact Options
function initializeContactOptions() {
    const faqBtn = document.getElementById('faq-btn');
    const chatBtn = document.getElementById('chat-btn');
    const phoneBtn = document.getElementById('phone-btn');
    
    if (faqBtn) {
        faqBtn.addEventListener('click', () => {
            document.querySelector('.faq-section').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });
    }
    
    if (chatBtn) {
        chatBtn.addEventListener('click', () => {
            openChatModal();
        });
    }
    
    if (phoneBtn) {
        phoneBtn.addEventListener('click', () => {
            openContactModal();
        });
    }
}

// Help Actions
function initializeHelpActions() {
    const startChatBtn = document.getElementById('start-chat');
    const sendEmailBtn = document.getElementById('send-email');
    
    if (startChatBtn) {
        startChatBtn.addEventListener('click', () => {
            openChatModal();
        });
    }
    
    if (sendEmailBtn) {
        sendEmailBtn.addEventListener('click', () => {
            openEmailModal();
        });
    }
}

// Open Chat Modal (Chatbot)
function openChatModal() {
    const modal = createModal(t('help.chatbot.title'), `
        <div class="chatbot-container">
            <div class="chatbot-messages" id="chatbot-messages">
                <div class="bot-message">
                    <div class="message-avatar">🤖</div>
                    <div class="message-content">
                        <p>${t('help.chatbot.greeting')}</p>
                        <div class="quick-options">
                            <button class="quick-btn" data-option="cancelar">${t('help.chatbot.quickOptions.cancel')}</button>
                            <button class="quick-btn" data-option="modificar">${t('help.chatbot.quickOptions.modify')}</button>
                            <button class="quick-btn" data-option="precio">${t('help.chatbot.quickOptions.price')}</button>
                            <button class="quick-btn" data-option="visa">${t('help.chatbot.quickOptions.visa')}</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="chatbot-input">
                <input type="text" id="chat-input" placeholder="${t('help.chatbot.inputPlaceholder')}">
                <button id="chat-send">${t('help.chatbot.sendButton')}</button>
            </div>
        </div>
        <style>
            .chatbot-container {
                display: flex;
                flex-direction: column;
                height: 500px;
                max-height: 70vh;
            }
            .chatbot-messages {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
                background: #f8f9fa;
            }
            .bot-message, .user-message {
                display: flex;
                gap: 0.75rem;
                margin-bottom: 1rem;
                animation: messageSlideIn 0.3s ease;
            }
            @keyframes messageSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .user-message {
                flex-direction: row-reverse;
            }
            .message-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: #8B4513;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                font-size: 1.2rem;
            }
            .user-message .message-avatar {
                background: #2c3e50;
            }
            .message-content {
                background: white;
                padding: 0.75rem 1rem;
                border-radius: 12px;
                max-width: 70%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .user-message .message-content {
                background: #8B4513;
                color: white;
            }
            .message-content p {
                margin: 0;
                line-height: 1.5;
            }
            .quick-options {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-top: 0.75rem;
            }
            .quick-btn {
                padding: 0.5rem 0.75rem;
                background: #f0f0f0;
                border: 1px solid #ddd;
                border-radius: 20px;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .quick-btn:hover {
                background: #8B4513;
                color: white;
                border-color: #8B4513;
            }
            .chatbot-input {
                display: flex;
                gap: 0.5rem;
                padding: 1rem;
                border-top: 1px solid #ddd;
                background: white;
            }
            .chatbot-input input {
                flex: 1;
                padding: 0.75rem;
                border: 1px solid #ddd;
                border-radius: 20px;
                font-family: inherit;
            }
            .chatbot-input input:focus {
                outline: none;
                border-color: #8B4513;
            }
            .chatbot-input button {
                padding: 0.75rem 1.5rem;
                background: #8B4513;
                color: white;
                border: none;
                border-radius: 20px;
                cursor: pointer;
                font-weight: 600;
                transition: background 0.2s ease;
            }
            .chatbot-input button:hover {
                background: #A0522D;
            }
            .typing-indicator {
                display: flex;
                gap: 0.25rem;
                padding: 0.5rem;
            }
            .typing-dot {
                width: 8px;
                height: 8px;
                background: #999;
                border-radius: 50%;
                animation: typingAnimation 1.4s infinite;
            }
            .typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }
            .typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }
            @keyframes typingAnimation {
                0%, 60%, 100% {
                    transform: translateY(0);
                }
                30% {
                    transform: translateY(-10px);
                }
            }
        </style>
    `);
    
    initializeChatbot();
}

// Chatbot Logic
function initializeChatbot() {
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const messagesContainer = document.getElementById('chatbot-messages');
    
    // Quick option buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const optionKey = btn.dataset.option;
            handleQuickOption(optionKey);
        });
    });
    
    // Send button
    chatSend.addEventListener('click', () => {
        sendMessage();
    });
    
    // Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        addUserMessage(message);
        chatInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Generate bot response
        setTimeout(() => {
            hideTypingIndicator();
            const response = generateBotResponse(message);
            addBotMessage(response);
        }, 1000 + Math.random() * 1000);
    }
    
    function handleQuickOption(optionKey) {
        const responses = {
            cancelar: {
                question: 'Quiero cancelar mi reserva',
                answer: 'Para cancelar tu reserva, ve a "Mis Reservas" en tu perfil. Las políticas de cancelación varían:<br><br>• <strong>Flexible:</strong> Hasta 24h antes con reembolso completo<br>• <strong>Moderada:</strong> Hasta 7 días con 50% de reembolso<br>• <strong>Estricta:</strong> No permite cancelaciones<br><br>¿Necesitas ayuda con algo más?'
            },
            modificar: {
                question: 'Necesito modificar las fechas',
                answer: 'Puedes modificar las fechas de tu viaje:<br><br>• <strong>+30 días:</strong> Cambio gratuito<br>• <strong>15-29 días:</strong> Cargo del 10%<br>• <strong>7-14 días:</strong> Cargo del 25%<br>• <strong>-7 días:</strong> Cargo del 50%<br><br>Contacta con nosotros para verificar disponibilidad.'
            },
            precio: {
                question: '¿Qué incluye el precio?',
                answer: 'Nuestros paquetes incluyen:<br><br>✅ Alojamiento<br>✅ Transporte local<br>✅ Guía turístico<br>✅ Entradas a atracciones<br>✅ Seguro básico<br><br>❌ No incluye: Vuelos internacionales, comidas (salvo especificación), propinas.'
            },
            visa: {
                question: 'Información sobre visas',
                answer: 'Los requisitos de visa dependen de tu nacionalidad y destino:<br><br>• <strong>UE:</strong> Sin visa para estadías cortas<br>• <strong>USA:</strong> ESTA o visa B1/B2<br>• <strong>Asia:</strong> Algunos con visa on arrival<br>• <strong>LATAM:</strong> Mayoría sin visa hasta 90 días<br><br>Consulta la página del destino para más detalles.'
            }
        };
        
        const selectedOption = responses[optionKey];
        if (selectedOption) {
            addUserMessage(selectedOption.question);
            showTypingIndicator();
            setTimeout(() => {
                hideTypingIndicator();
                addBotMessage(selectedOption.answer);
            }, 1200);
        }
    }
    
    function addUserMessage(text) {
        const messageHtml = `
            <div class="user-message">
                <div class="message-avatar">👤</div>
                <div class="message-content">
                    <p>${text}</p>
                </div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', messageHtml);
        scrollToBottom();
    }
    
    function addBotMessage(text) {
        const messageHtml = `
            <div class="bot-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p>${text}</p>
                </div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', messageHtml);
        scrollToBottom();
    }
    
    function showTypingIndicator() {
        const typingHtml = `
            <div class="bot-message typing-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', typingHtml);
        scrollToBottom();
    }
    
    function hideTypingIndicator() {
        const typingMessage = messagesContainer.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }
    
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function generateBotResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Cancelación
        if (lowerMessage.includes('cancelar') || lowerMessage.includes('cancelación')) {
            return 'Para cancelar tu reserva, accede a "Mis Reservas" en tu perfil. Recuerda que las políticas varían según el tipo de reserva (flexible, moderada o estricta). ¿Necesitas más información sobre alguna política específica?';
        }
        
        // Modificación
        if (lowerMessage.includes('modificar') || lowerMessage.includes('cambiar') || lowerMessage.includes('fecha')) {
            return 'Puedes modificar las fechas desde tu perfil. El cargo depende de cuándo hagas el cambio: sin cargo si es con más de 30 días de antelación, hasta un 50% si es con menos de 7 días. ¿Quieres que te ayude con algo más?';
        }
        
        // Precio
        if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('incluye') || lowerMessage.includes('pagar')) {
            return 'Los precios incluyen alojamiento, transporte local, guía turístico, entradas y seguro básico. No incluyen vuelos internacionales ni comidas (salvo especificación). ¿Te gustaría saber sobre algún destino en particular?';
        }
        
        // Visa
        if (lowerMessage.includes('visa') || lowerMessage.includes('pasaporte') || lowerMessage.includes('documentos')) {
            return 'Los requisitos de visa dependen de tu nacionalidad y destino. En cada página de destino encontrarás información específica, o puedes consultarnos directamente. ¿Sobre qué país necesitas información?';
        }
        
        // Mascotas
        if (lowerMessage.includes('mascota') || lowerMessage.includes('perro') || lowerMessage.includes('gato') || lowerMessage.includes('animal')) {
            return 'Algunos destinos aceptan mascotas pequeñas (hasta 10kg) con cargo adicional. Usa el filtro "Pet-friendly" en la búsqueda para ver opciones. Se requiere certificado de vacunación al día. ¿Buscas un destino específico?';
        }
        
        // Pago
        if (lowerMessage.includes('pago') || lowerMessage.includes('tarjeta') || lowerMessage.includes('efectivo')) {
            return 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard, Amex), PayPal y transferencia bancaria. El pago se procesa de forma segura. ¿Tienes alguna duda sobre métodos de pago?';
        }
        
        // Reembolso
        if (lowerMessage.includes('reembolso') || lowerMessage.includes('devolver') || lowerMessage.includes('devolución')) {
            return 'Los reembolsos dependen de la política de cancelación de tu reserva. Procesamos los reembolsos en 5-10 días hábiles. Si tienes una reserva específica, puedo ayudarte mejor si me das más detalles.';
        }
        
        // Contacto
        if (lowerMessage.includes('contacto') || lowerMessage.includes('teléfono') || lowerMessage.includes('email') || lowerMessage.includes('hablar')) {
            return 'Puedes contactarnos por:<br>📞 +34 900 123 456 (Lun-Vie 9-20h)<br>📧 soporte@nomadtrails.com<br>¿Prefieres que un agente te contacte?';
        }
        
        // Saludo
        if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('buenas')) {
            return '¡Hola! 👋 ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre reservas, cancelaciones, precios, visas y más.';
        }
        
        // Agradecimiento
        if (lowerMessage.includes('gracias') || lowerMessage.includes('thank')) {
            return '¡De nada! 😊 Si necesitas algo más, aquí estoy para ayudarte. ¡Que tengas un excelente día!';
        }
        
        // Respuesta por defecto
        return 'Entiendo tu consulta. Para ayudarte mejor, puedo informarte sobre:<br><br>• Cancelaciones y modificaciones<br>• Precios y lo que incluyen<br>• Requisitos de visa<br>• Políticas de mascotas<br>• Métodos de pago<br><br>¿Sobre qué tema necesitas información?';
    }
}

// Open Contact Modal
function openContactModal() {
    createModal('Información de Contacto', `
        <div class="contact-info">
            <div class="contact-item">
                <h3>📞 ${currentLanguage === 'es' ? 'Teléfono' : 'Phone'}</h3>
                <p><strong>${currentLanguage === 'es' ? 'España' : 'Spain'}:</strong> +34 900 123 456</p>
                <p><strong>${currentLanguage === 'es' ? 'Internacional' : 'International'}:</strong> +34 912 345 678</p>
                <p class="contact-hours">${currentLanguage === 'es' ? 'Lun-Vie' : 'Mon-Fri'}: 9:00 - 20:00 | ${currentLanguage === 'es' ? 'Sáb' : 'Sat'}: 10:00 - 14:00</p>
            </div>
            <div class="contact-item">
                <h3>📧 ${currentLanguage === 'es' ? 'Email' : 'Email'}</h3>
                <p><strong>${currentLanguage === 'es' ? 'Soporte general' : 'General Support'}:</strong> soporte@nomadtrails.com</p>
                <p><strong>${currentLanguage === 'es' ? 'Reservas' : 'Reservations'}:</strong> reservas@nomadtrails.com</p>
                <p><strong>${currentLanguage === 'es' ? 'Cancelaciones' : 'Cancellations'}:</strong> cancelaciones@nomadtrails.com</p>
            </div>
            <div class="contact-item">
                <h3>💬 ${currentLanguage === 'es' ? 'Redes Sociales' : 'Social Media'}</h3>
                <p>Twitter: @NomadTrails</p>
                <p>Instagram: @nomadtrails_oficial</p>
                <p>Facebook: /NomadTrailsOficial</p>
            </div>
        </div>
        <style>
            .contact-info {
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }
            .contact-item {
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 8px;
            }
            .contact-item h3 {
                margin-bottom: 1rem;
                color: #8B4513;
            }
            .contact-item p {
                margin-bottom: 0.5rem;
                color: #555;
            }
            .contact-hours {
                color: #888;
                font-size: 0.9rem;
                font-style: italic;
            }
        </style>
    `);
}

// Open Email Modal
function openEmailModal() {
    createModal('Enviar Correo', `
        <form class="email-form" id="email-form">
            <div class="form-group">
                <label for="email-subject">Asunto</label>
                <input type="text" id="email-subject" required placeholder="¿En qué podemos ayudarte?">
            </div>
            <div class="form-group">
                <label for="email-message">Mensaje</label>
                <textarea id="email-message" rows="6" required placeholder="Describe tu consulta..."></textarea>
            </div>
            <div class="form-group">
                <label for="email-contact">Tu email de contacto</label>
                <input type="email" id="email-contact" required placeholder="tu@email.com">
            </div>
            <button type="submit" class="btn-primary" style="width: 100%; margin-top: 1rem;">
                Enviar mensaje
            </button>
        </form>
        <style>
            .email-form {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            .form-group label {
                font-weight: 600;
                color: #2c3e50;
            }
            .form-group input,
            .form-group textarea {
                padding: 0.75rem;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-family: inherit;
                font-size: 1rem;
            }
            .form-group input:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #8B4513;
            }
        </style>
    `);
    
    // Handle form submission
    document.getElementById('email-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
        showNotification('Mensaje enviado correctamente. Te responderemos pronto.', 'success');
    });
}

// Create Modal
function createModal(title, content) {
    // Remove existing modal
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
        modal.remove();
    });
    
    return modal;
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// User Session (from explore.js)
function initializeUserSession() {
    const userSessionBtn = document.getElementById('user-session');
    
    if (userSessionBtn) {
        userSessionBtn.addEventListener('click', () => {
            showNotification('Función de inicio de sesión próximamente', 'info');
        });
    }
}

// Styles are now in ayuda.css
