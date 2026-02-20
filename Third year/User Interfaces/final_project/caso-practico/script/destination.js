/* ===================================
   Destination Page - Funcionalidad
   =================================== */

let currentDestination = null;

// Initialize destination page
$(document).ready(function() {
    console.log('Destination page initialized');
    
    // Get destination ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const destinationId = urlParams.get('id');
    
    console.log('Destination ID from URL:', destinationId);
    
    if (destinationId) {
        // Ensure destinations are loaded first
        if (typeof window.ensureDestinationsLoaded === 'function') {
            console.log('Ensuring destinations are loaded...');
            window.ensureDestinationsLoaded().then((destinations) => {
                console.log('Destinations ready, total:', destinations.length);
                loadDestination(destinationId);
            }).catch(error => {
                console.error('Error ensuring destinations loaded:', error);
                showToast('Error al cargar destinos', 'error');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            });
        } else {
            console.log('ensureDestinationsLoaded not available, trying direct load');
            loadDestination(destinationId);
        }
    } else {
        // No ID, redirect to home
        console.log('No destination ID, redirecting to home');
        window.location.href = 'index.html';
    }
    
    // Initialize accordions
    initAccordions();
    
    // Initialize calculator
    initCalculator();
    
    // Share button
    $('#share-btn').on('click', shareDestination);
    
    // Favorite button
    $('#favorite-btn').on('click', function() {
        if (currentDestination && typeof FavoritesManager !== 'undefined') {
            const destinationData = {
                id: currentDestination.id,
                name: currentLanguage === 'es' ? currentDestination.name : currentDestination.enname,
                country: currentLanguage === 'es' ? currentDestination.country : currentDestination.encountry,
                image: currentDestination.image
            };
            FavoritesManager.toggleFavorite(currentDestination.id, destinationData);
            updateFavoriteButton();
        }
    });
    
    // Book now button
    $('#book-now').on('click', function() {
        console.log('Book now clicked, checking auth...');
        // Check if user is logged in
        if (typeof AuthManager === 'undefined' || !AuthManager.isAuthenticated()) {
            console.log('Not authenticated, showing modal');
            AuthModal.show();
            return;
        }
        
        console.log('User authenticated, redirecting to checkout');
        if (currentDestination) {
            // Redirect to checkout with destination ID
            const destinationId = currentDestination.id;
            window.location.href = `checkout.html?destination=${destinationId}`;
        }
    });
    
    
    // Contact support
    $('#contact-support').on('click', function() {
        // Open chat widget
        $('#chat-window').removeAttr('hidden');
        $('#chat-input').focus();
        
        // Add support message
        setTimeout(() => {
            const supportMsg = currentLanguage === 'es' 
                ? '¿Necesitas ayuda con este destino? Estoy aquí para ayudarte.' 
                : 'Need help with this destination? I\'m here to help.';
            addChatMessage(supportMsg, 'bot');
        }, 300);
    });

    document.addEventListener('languageChanged', function(e) {
        console.log('Language changed to:', e.detail.language);
        if (currentDestination) {
            // Update the language variable
            currentLanguage = e.detail.language;
            // Re-render destination with new language
            renderDestination(currentDestination);
        }
    });
});

// Load destination
function loadDestination(destinationId) {
    console.log('Loading destination with ID:', destinationId);
    console.log('Available destinations:', allDestinations.length);
    
    // Find destination
    currentDestination = allDestinations.find(d => d.id === destinationId);
    
    if (!currentDestination) {
        console.error('Destination not found with ID:', destinationId);
        console.log('Available IDs:', allDestinations.map(d => d.id).join(', '));
        showToast('Destino no encontrado', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    console.log('Destination found:', currentDestination.name);
    
    // Render destination
    renderDestination(currentDestination);
}

// Render destination
function renderDestination(destination) {
    // Update page title
    document.title = `${currentLanguage === 'es' ? destination.name : destination.enname}, ${currentLanguage === 'es' ? destination.country : destination.encountry} - Nomad Trails`;
    
    // Hero section
    $('#hero-image').attr('src', destination.image.url).attr('alt', destination.image.alt);
    $('#destination-title').text(currentLanguage === 'es' ? destination.name : destination.enname);
    $('#destination-location').html(`📍 ${sanitizeHTML(currentLanguage === 'es' ? destination.country : destination.encountry)}, ${sanitizeHTML(currentLanguage === 'es' ? destination.continent : destination.encontinent)}`);
    
    // Generate tags
    const tags = generateTags(destination);
    const tagsHtml = tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');
    $('#destination-tags').html(tagsHtml);
    
    // Description
    $('#destination-description').text(currentLanguage === 'es' ? destination.description : destination.endescription);
    
    // Price
    $('#booking-price').text(formatPrice(destination.price));
    
    // Update favorite button
    updateFavoriteButton();
    
    // Remove skeleton loaders
    $('.skeleton-text').removeClass('skeleton-text skeleton-text--hero skeleton-text--short');
}

// Generate tags based on destination properties
function generateTags(destination) {
    const tags = [];
    
    // Add continent
    tags.push(currentLanguage === 'es' ? destination.continent : destination.encontinent);
    
    // Add descriptive tags based on description keywords
    const description = (currentLanguage === 'es' ? destination.description : destination.endescription).toLowerCase();
    
    if (description.includes('playa') || description.includes('beach')) {
        tags.push(currentLanguage === 'es' ? '🏖️ Playa' : '🏖️ Beach');
    }
    if (description.includes('montaña') || description.includes('mountain')) {
        tags.push(currentLanguage === 'es' ? '⛰️ Montaña' : '⛰️ Mountain');
    }
    if (description.includes('ciudad') || description.includes('city')) {
        tags.push(currentLanguage === 'es' ? '🏙️ Ciudad' : '🏙️ City');
    }
    if (description.includes('museo') || description.includes('museum') || description.includes('cultura')) {
        tags.push(currentLanguage === 'es' ? '🎨 Cultura' : '🎨 Culture');
    }
    if (description.includes('naturaleza') || description.includes('nature') || description.includes('parque')) {
        tags.push(currentLanguage === 'es' ? '🌿 Naturaleza' : '🌿 Nature');
    }
    if (description.includes('aventura') || description.includes('adventure')) {
        tags.push(currentLanguage === 'es' ? '🧗 Aventura' : '🧗 Adventure');
    }
    
    return tags;
}

// Update favorite button
function updateFavoriteButton() {
    if (!currentDestination || typeof FavoritesManager === 'undefined') return;
    
    const isFavorite = FavoritesManager.isFavorite(currentDestination.id);
    const $btn = $('#favorite-btn');
    const $icon = $btn.find('.icon');
    
    $icon.text(isFavorite ? '❤️' : '🤍');
    $btn.attr('aria-label', isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos');
    $btn.attr('data-destination-id', currentDestination.id);
    
    if (isFavorite) {
        $btn.addClass('btn-icon--active');
    } else {
        $btn.removeClass('btn-icon--active');
    }
}

// Share destination
function shareDestination() {
    if (!currentDestination) return;
    
    const url = window.location.href;
    const title = `${currentLanguage === 'es' ? currentDestination.name : currentDestination.enname}, ${currentLanguage === 'es' ? currentDestination.country : currentDestination.encountry} - Nomad Trails`;
    const text = (currentLanguage === 'es' ? currentDestination.description : currentDestination.endescription).substring(0, 100) + '...';
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url
        })
        .then(() => showToast('Compartido exitosamente', 'success'))
        .catch(() => copyToClipboard(url));
    } else {
        // Fallback: copy to clipboard
        copyToClipboard(url);
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    showToast('Enlace copiado al portapapeles', 'success');
}

// Initialize accordions
function initAccordions() {
    $('.accordion-header').on('click', function() {
        const $header = $(this);
        const $content = $header.next('.accordion-content');
        const isExpanded = $header.attr('aria-expanded') === 'true';
        
        // Toggle this accordion
        $header.attr('aria-expanded', !isExpanded);
        $content.attr('hidden', isExpanded);
        
        // Rotate icon
        $header.find('.accordion-icon').css('transform', isExpanded ? 'rotate(0deg)' : 'rotate(180deg)');
    });
}

// Initialize calculator
function initCalculator() {
    const $inputs = $('.calculator-input');
    
    // Calculate on input change
    $inputs.on('input', calculateTotal);
    
    // Initial calculation
    calculateTotal();
}

// Calculate total
function calculateTotal() {
    const nights = parseInt($('#calc-nights').val()) || 0;
    const hotelPerNight = parseInt($('#calc-hotel').val()) || 0;
    const mealsPerDay = parseInt($('#calc-meals').val()) || 0;
    const carRental = parseInt($('#calc-car').val()) || 0;
    const transport = parseInt($('#calc-transport').val()) || 0;
    
    // Formula: Total = nights × (hotel + meals) + car × nights + transport
    const total = nights * (hotelPerNight + mealsPerDay) + (carRental * nights) + transport;
    
    $('#calc-total').text(formatPrice(total));
    
    // Add animation
    $('#calc-total').addClass('calculator-result--updated');
    setTimeout(() => {
        $('#calc-total').removeClass('calculator-result--updated');
    }, 300);
}

// Make booking card sticky on scroll
$(window).on('scroll', function() {
    const $bookingCard = $('#booking-card');
    const scrollTop = $(window).scrollTop();
    const headerHeight = $('.header').outerHeight();
    
    if (scrollTop > headerHeight + 100) {
        $bookingCard.addClass('booking-card--sticky');
    } else {
        $bookingCard.removeClass('booking-card--sticky');
    }
});
