/* ===================================
   Destinations - Gestión de destinos
   =================================== */

let allDestinations = [];
let displayedDestinations = [];

// Load destinations from JSON
async function loadDestinations() {
    if (destinationsLoading || destinationsLoaded) {
        return allDestinations;
    }
    
    destinationsLoading = true;
    
    try {
        const response = await fetch('images/ciudades-del-mundo.json');
        const data = await response.json();
        
        // Flatten the structure to get all cities
        allDestinations = [];
        data.continents.forEach(continent => {
            continent.countries.forEach(country => {
                country.cities.forEach(city => {
                    // Create consistent ID based on city name and country
                    const consistentId = `${city.name}-${country.name}`
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '') // Remove accents
                        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
                        .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
                    
                    allDestinations.push({
                        name: city.name,
                        country: country.name,
                        continent: continent.name,
                        description: city.description,
                        enname: city.enname,
                        encountry: country.encountry,
                        encontinent: continent.encontinent,
                        endescription: city.endescription,
                        image: city.image,
                        price: Math.floor(Math.random() * (2000 - 500 + 1)) + 500, // Simulate prices
                        id: consistentId
                    });
                });
            });
        });
        
        destinationsLoaded = true;
        destinationsLoading = false;
        
        console.log('Destinations loaded successfully:', allDestinations.length);
        
        // Only render on home page
        if (typeof renderDestinations === 'function' && 
            (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/'))) {
            displayedDestinations = shuffleArray([...allDestinations]).slice(0, 6);
            renderDestinations(displayedDestinations);
        }
        
        return allDestinations;
    } catch (error) {
        console.error('Error loading destinations:', error);
        destinationsLoading = false;
        showToast('Error al cargar destinos', 'error');
        return [];
    }
}

// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Render destinations
function renderDestinations(destinations) {
    const grid = $('#destinations-grid');
    
    if (destinations.length === 0) {
        grid.html(`
            <div class="no-results">
                <p>${t('destinations.noResults') || 'No se encontraron destinos'}</p>
            </div>
        `);
        return;
    }
    
    const html = destinations.map(destination => createDestinationCard(destination)).join('');
    grid.html(html);
    
    // Attach event listeners
    attachDestinationEvents();
}

// Create destination card HTML
function createDestinationCard(destination) {
    const isFavorite = typeof FavoritesManager !== 'undefined' ? FavoritesManager.isFavorite(destination.id) : false;
    const heartIcon = isFavorite ? '❤️' : '🤍';
    
    return `
        <article class="destination-card" data-destination-id="${destination.id}">
            <div class="destination-card__image-wrapper">
                <img 
                    src="${destination.image.url}" 
                    alt="${destination.image.alt}"
                    class="destination-card__image"
                    loading="lazy"
                >
                <button 
                    class="destination-card__favorite" 
                    data-destination-id="${destination.id}"
                    aria-label="${isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}"
                >
                    ${heartIcon}
                </button>
            </div>
            <div class="destination-card__content">
                <h3 class="destination-card__title">${sanitizeHTML(currentLanguage === 'es' ? destination.name : destination.enname)}, ${sanitizeHTML(currentLanguage === 'es' ? destination.country : destination.encountry)}</h3>
                <p class="destination-card__price">${formatPrice(destination.price)}</p>
                <p class="destination-card__description">${sanitizeHTML(truncateText(currentLanguage === 'es' ? destination.description : destination.endescription, 100))}</p>
                <div class="destination-card__actions">
                    <button class="btn-book-now" data-destination-id="${destination.id}">${t('booking.bookNow') || 'Reservar ahora'}</button>
                </div>
            </div>
        </article>
    `;
}

// Attach event listeners to destination cards
function attachDestinationEvents() {
    // Favorite buttons
    $('.destination-card__favorite').off('click').on('click', function(e) {
        e.stopPropagation();
        const destinationId = $(this).data('destination-id');
        const destination = allDestinations.find(d => d.id === destinationId);
        
        if (typeof FavoritesManager !== 'undefined' && destination) {
            const destinationData = {
                id: destination.id,
                name: currentLanguage === 'es' ? destination.name : destination.enname,
                country: currentLanguage === 'es' ? destination.country : destination.encountry,
                image: destination.image
            };
            FavoritesManager.toggleFavorite(destinationId, destinationData);
        }
    });
    
    // Book now buttons
    $('.btn-book-now').off('click').on('click', function(e) {
        e.stopPropagation();
        
        // Check if user is logged in
        if (typeof AuthManager !== 'undefined' && !AuthManager.requireAuth()) {
            return;
        }
        
        const destinationId = $(this).data('destination-id');
        window.location.href = `checkout.html?destination=${destinationId}`;
    });
    
    // Card click
    $('.destination-card').off('click').on('click', function() {
        const destinationId = $(this).data('destination-id');
        showDestinationDetails(destinationId);
    });
}

// Show destination details - redirect to destination page
function showDestinationDetails(destinationId) {
    const destination = allDestinations.find(d => d.id === destinationId);
    if (destination) {
        window.location.href = `destination.html?id=${destinationId}`;
    }
}

// Filter destinations
function filterDestinations(query) {
    if (!query || query.trim() === '') {
        displayedDestinations = shuffleArray([...allDestinations]).slice(0, 6);
    } else {
        const lowerQuery = query.toLowerCase();
        displayedDestinations = allDestinations.filter(d => 
            d.name.toLowerCase().includes(lowerQuery) ||
            d.country.toLowerCase().includes(lowerQuery) ||
            d.continent.toLowerCase().includes(lowerQuery) ||
            d.description.toLowerCase().includes(lowerQuery) ||
            d.enname.toLowerCase().includes(lowerQuery) ||
            d.encountry.toLowerCase().includes(lowerQuery) ||
            d.encontinent.toLowerCase().includes(lowerQuery) ||
            d.endescription.toLowerCase().includes(lowerQuery)
        );
    }
    
    renderDestinations(displayedDestinations);
}

// Initialize destinations
let destinationsLoaded = false;
let destinationsLoading = false;

$(document).ready(function() {
    // Auto-load destinations if we're on index.html
    if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
        loadDestinations();
    } 
});

// Export load function to be called by other pages
window.ensureDestinationsLoaded = function() {
    return new Promise((resolve, reject) => {
        if (destinationsLoaded) {
            resolve(allDestinations);
        } else if (destinationsLoading) {
            // Wait for current load to finish
            const checkInterval = setInterval(() => {
                if (destinationsLoaded) {
                    clearInterval(checkInterval);
                    resolve(allDestinations);
                }
            }, 100);
        } else {
            loadDestinations().then(() => {
                resolve(allDestinations);
            }).catch(reject);
        }
    });
};
