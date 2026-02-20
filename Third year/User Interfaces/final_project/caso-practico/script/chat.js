/* ===================================
   Chat - Asistencia y FAQs
   =================================== */

const chatResponses = {
    // Greetings
    'hola': '¡Hola! 👋 ¿En qué puedo ayudarte hoy?',
    'hello': 'Hello! 👋 How can I help you today?',
    'buenos días': '¡Buenos días! ☀️ ¿Cómo puedo asistirte?',
    'good morning': 'Good morning! ☀️ How can I assist you?',
    
    // Bookings
    'reserv': 'Para hacer una reserva, haz clic en el botón "🎫 Reservas" en el menú principal. Allí podrás seleccionar tu destino, fechas y completar tu información.',
    'book': 'To make a booking, click on the "🎫 Bookings" button in the main menu. There you can select your destination, dates, and complete your information.',
    'billete': 'Puedes comprar billetes desde la sección de Reservas. Te guiaremos paso a paso en el proceso de compra.',
    'ticket': 'You can purchase tickets from the Bookings section. We\'ll guide you through the purchase process step by step.',
    
    // Destinations
    'destino': 'Tenemos destinos increíbles en todos los continentes. Usa el buscador para encontrar tu lugar ideal o explora nuestros destinos destacados.',
    'destination': 'We have amazing destinations on all continents. Use the search bar to find your ideal place or explore our featured destinations.',
    'ciudad': 'Puedes buscar ciudades por nombre en el buscador de arriba. También puedes filtrar por continente o tipo de destino.',
    'city': 'You can search for cities by name in the search bar above. You can also filter by continent or destination type.',
    
    // Prices
    'precio': 'Los precios varían según el destino y la temporada. Cada destino muestra su precio estimado en la tarjeta. Para más detalles, haz clic en el destino.',
    'price': 'Prices vary by destination and season. Each destination shows its estimated price on the card. For more details, click on the destination.',
    'barato': 'Puedes encontrar destinos económicos usando nuestros filtros de precio. ¡Tenemos opciones para todos los presupuestos!',
    'cheap': 'You can find budget-friendly destinations using our price filters. We have options for all budgets!',
    
    // Account
    'cuenta': 'Para gestionar tu cuenta, haz clic en "Iniciar Sesión" en la parte superior derecha. Desde ahí podrás ver tu perfil y reservas.',
    'account': 'To manage your account, click on "Sign In" in the top right. From there you can view your profile and bookings.',
    'perfil': 'Tu perfil te permite ver tu historial de reservas, favoritos y configurar tus preferencias de viaje.',
    'profile': 'Your profile allows you to view your booking history, favorites, and configure your travel preferences.',
    
    // Itinerary
    'itinerario': 'Puedes crear itinerarios personalizados desde la sección "📋 Itinerarios". Organiza tus días de viaje y actividades.',
    'itinerary': 'You can create custom itineraries from the "📋 Itineraries" section. Organize your travel days and activities.',
    'planificar': 'Nuestro planificador de itinerarios te ayuda a organizar cada día de tu viaje. ¡Añade actividades, lugares y notas!',
    'plan': 'Our itinerary planner helps you organize each day of your trip. Add activities, places, and notes!',
    
    // Favorites
    'favorito': 'Haz clic en el corazón 🤍 de cualquier destino para añadirlo a tus favoritos. Podrás ver todos tus favoritos en tu perfil.',
    'favorite': 'Click the heart 🤍 on any destination to add it to your favorites. You can see all your favorites in your profile.',
    
    // Language
    'idioma': 'Puedes cambiar el idioma haciendo clic en el botón 🌐 en la parte superior derecha. Soportamos Español e Inglés.',
    'language': 'You can change the language by clicking the 🌐 button in the top right. We support Spanish and English.',
    
    // Help
    'ayuda': '¿En qué necesitas ayuda? Puedo asistirte con reservas, destinos, itinerarios, cuenta o cualquier otra consulta.',
    'help': 'What do you need help with? I can assist you with bookings, destinations, itineraries, account, or any other question.',
    
    // Default
    'default': 'Lo siento, no entendí tu pregunta. ¿Puedes reformularla? Puedo ayudarte con reservas, destinos, itinerarios y más.'
};

let chatHistory = loadFromStorage('chatHistory', []);

// Initialize chat
function initChat() {
    const $chatToggle = $('#chat-toggle');
    const $chatWindow = $('#chat-window');
    const $chatClose = $('#chat-close');
    const $chatInput = $('#chat-input');
    const $chatSend = $('#chat-send');
    
    // Check if chat elements exist before initializing
    if ($chatToggle.length === 0) {
        return; // Chat not present on this page
    }
    
    // Load chat history
    loadChatHistory();
    
    // Toggle chat window
    $chatToggle.on('click', function() {
        $chatWindow.removeAttr('hidden');
        $chatInput.focus();
    });
    
    // Close chat
    $chatClose.on('click', function() {
        $chatWindow.attr('hidden', true);
    });
    
    // Send message on button click
    $chatSend.on('click', function() {
        sendChatMessage();
    });
    
    // Send message on Enter
    $chatInput.on('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendChatMessage();
        }
    });
}

// Send chat message
function sendChatMessage() {
    const $chatInput = $('#chat-input');
    const message = $chatInput.val().trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    
    // Clear input
    $chatInput.val('');
    
    // Get bot response
    setTimeout(() => {
        const response = getBotResponse(message);
        addChatMessage(response, 'bot');
    }, 500);
}

// Add chat message
function addChatMessage(message, type) {
    const $messages = $('#chat-messages');
    const $message = $(`
        <div class="chat-message chat-message--${type}">
            <p>${sanitizeHTML(message)}</p>
        </div>
    `);
    
    $messages.append($message);
    
    // Scroll to bottom
    $messages.scrollTop($messages[0].scrollHeight);
    
    // Save to history
    chatHistory.push({ message, type, timestamp: Date.now() });
    
    // Keep only last 50 messages
    if (chatHistory.length > 50) {
        chatHistory = chatHistory.slice(-50);
    }
    
    saveToStorage('chatHistory', chatHistory);
}

// Get bot response
function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for keyword matches
    for (const [keyword, response] of Object.entries(chatResponses)) {
        if (keyword !== 'default' && lowerMessage.includes(keyword)) {
            return response;
        }
    }
    
    // Default response
    return chatResponses.default;
}

// Load chat history
function loadChatHistory() {
    const $messages = $('#chat-messages');
    
    // Clear existing messages except welcome
    $messages.find('.chat-message--user, .chat-message--bot:not(:first)').remove();
    
    // Add history messages (show only last 10)
    const recentHistory = chatHistory.slice(-10);
    recentHistory.forEach(item => {
        const $message = $(`
            <div class="chat-message chat-message--${item.type}">
                <p>${sanitizeHTML(item.message)}</p>
            </div>
        `);
        $messages.append($message);
    });
    
    // Scroll to bottom
    $messages.scrollTop($messages[0].scrollHeight);
}

// Clear chat history
function clearChatHistory() {
    chatHistory = [];
    saveToStorage('chatHistory', chatHistory);
    loadChatHistory();
    showToast('Historial de chat eliminado', 'info');
}

// Initialize
$(document).ready(function() {
    // Only initialize if chat elements exist
    if ($('#chat-toggle').length > 0) {
        initChat();
    }
});
