/* ===================================
   PROFILE PAGE FUNCTIONALITY
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure AuthManager is fully initialized
    setTimeout(() => {
        // Check if user is authenticated
        if (typeof AuthManager === 'undefined' || !AuthManager.isAuthenticated()) {
            console.log('No authenticated user, redirecting to home');
            // Redirect to home if not logged in
            window.location.href = '../index.html';
            return;
        }
        
        console.log('User authenticated:', AuthManager.currentUser);
        
        // Initialize profile page
        loadUserProfile();
        initializeTabs();
        loadUserData();
        
        // Check if we need to show a specific tab from URL hash
        checkUrlHash();
    }, 100);
    
    // Event listeners
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    document.getElementById('edit-profile-btn').addEventListener('click', handleEditProfile);
});

document.addEventListener('languageChanged', () => {
    // Reload user data or update UI elements based on new language
    loadUserProfile();
    loadUserData();
    initializeTabs();
    updateButtonTexts();
    checkUrlHash();
});

// Actualizar texto de botones según el idioma
function updateButtonTexts() {
    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) {
        editBtn.textContent = currentLanguage === 'es' ? '⚙️ Configuración' : '⚙️ Settings';
    }
}

// Check URL hash and activate corresponding tab
function checkUrlHash() {
    const hash = window.location.hash.substring(1); // Remove the #
    if (hash) {
        // Find the tab button with this data-tab value
        const tabButton = document.querySelector(`[data-tab="${hash}"]`);
        if (tabButton) {
            tabButton.click();
        }
    }
}

// Load user profile information
function loadUserProfile() {
    const user = AuthManager.currentUser;
    
    if (!user) return;
    
    // Update profile header
    document.getElementById('profile-name').textContent = user.username;
    document.getElementById('profile-username').textContent = `@${user.username}`;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('avatar-initial').textContent = user.username.charAt(0).toUpperCase();
    
    // Update page title
    document.title = `${user.username} - Perfil | Nomad Trails`;
}

// Initialize tabs functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            activateTab(tabName);
        });
    });
    
    // Also handle clicks on favorites link in header when on profile page
    const favoritesLink = document.getElementById('favorites-link');
    if (favoritesLink && favoritesLink.getAttribute('href') === '#favorites') {
        favoritesLink.addEventListener('click', (e) => {
            e.preventDefault();
            activateTab('favorites');
        });
    }
}

// Activate a specific tab
function activateTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Remove active class from all buttons and contents
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked button and corresponding content
    const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
    const targetContent = document.getElementById(`${tabName}-tab`);
    
    if (targetButton && targetContent) {
        targetButton.classList.add('active');
        targetContent.classList.add('active');
        
        // Update URL hash without scrolling
        history.replaceState(null, null, `#${tabName}`);
    }
}

// Load user data (trips, favorites, reviews)
function loadUserData() {
    loadFavorites();
    loadReviews();
    loadStats();
    loadUserTrips();
}

// Load user reviews
function loadReviews() {
    console.log('loadReviews called');
    
    if (typeof ReviewsManager === 'undefined') {
        console.error('ReviewsManager not loaded');
        return;
    }
    
    const user = AuthManager.getCurrentUser();
    if (!user) {
        console.error('No current user found');
        return;
    }
    
    console.log('Getting reviews for user:', user.email);
    const reviews = ReviewsManager.getUserReviews(user.email);
    console.log('Reviews found:', reviews.length, reviews);
    
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) {
        console.error('reviews-list element not found');
        return;
    }
    
    if (reviews.length === 0) {
        if (currentLanguage === 'es') {
            reviewsList.innerHTML = '<p class="empty-state">No has escrito ninguna reseña todavía. <a href="explore.html">¡Visita destinos y comparte tu experiencia!</a></p>';
        } else {
            reviewsList.innerHTML = '<p class="empty-state">You have not written any reviews yet. <a href="explore.html">Visit destinations and share your experience!</a></p>';
        }
        return;
    }
    
    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <h3 class="review-destination">${review.destinationName}</h3>
                <div class="review-rating">${'⭐'.repeat(review.rating)}</div>
            </div>
            <p class="review-date">${new Date(review.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p class="review-text">${review.comment}</p>
            <div class="review-actions">
                <button class="btn-secondary" onclick="deleteReview('${review.destinationId}', '${review.id}')">🗑️ ${currentLanguage === 'es' ? 'Eliminar' : 'Delete'}</button>
            </div>
        </div>
    `).join('');
}

// Delete review
function deleteReview(destinationId, reviewId) {
    if (!confirm(currentLanguage === 'es' ? '¿Quieres eliminar esta reseña?' : 'Do you want to delete this review?')) return;
    
    if (typeof ReviewsManager !== 'undefined') {
        ReviewsManager.deleteReview(destinationId, reviewId);
        loadReviews();
        loadStats();
    }
}

// Load user trips from bookings
function loadUserTrips() {
    const user = AuthManager.getCurrentUser();
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const userBookings = bookings.filter(b => b.userId === user.email && b.status !== 'cancelled');
    
    // Separate upcoming and past trips
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcoming = userBookings.filter(b => {
        const checkOutDate = new Date(b.checkOut);
        checkOutDate.setHours(0, 0, 0, 0);
        return checkOutDate >= today; // Show if checkout is today or in the future
    });
    
    const past = userBookings.filter(b => {
        const checkOutDate = new Date(b.checkOut);
        checkOutDate.setHours(0, 0, 0, 0);
        return checkOutDate < today; // Show if checkout has passed
    });
    
    // Load upcoming trips
    loadBookingsToGrid(upcoming, 'upcoming-trips');
    
    // Load past trips
    loadBookingsToGrid(past, 'past-trips');
}

// Load bookings to grid
function loadBookingsToGrid(bookings, gridId) {
    const grid = document.getElementById(gridId);
    
    if (bookings.length === 0) {
        if (currentLanguage === 'es') {
            grid.innerHTML = '<p class="empty-state">No tienes viajes en esta categoría.</p>';
        } else {
            grid.innerHTML = '<p class="empty-state">There are no trips in this category.</p>';
        }
        return;
    }
    
    grid.innerHTML = bookings.map(booking => {
        // Handle image object or string
        const imageUrl = booking.destination.image?.url || booking.destination.image || '';
        let detailsText = currentLanguage === 'es' ? 'Ver Detalles' : 'See Details';
        let reviewText = currentLanguage === 'es' ? 'Escribir reseña' : 'Write Review';
        return `
        <div class="trip-card">
            <div class="trip-image" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;">
                ${!imageUrl ? '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 100%; height: 100%;"></div>' : ''}
            </div>
            <div class="trip-details">
                <h3 class="trip-name">${currentLanguage === 'es' ? booking.destination.name : booking.destination.enname}, ${currentLanguage === 'es' ? booking.destination.country : booking.destination.encountry}</h3>
                <p class="trip-date">📅 ${new Date(booking.checkIn).toLocaleDateString('es-ES')} - ${new Date(booking.checkOut).toLocaleDateString('es-ES')}</p>
                <div class="trip-actions">
                    <button class="btn-primary" onclick="window.location.href='reserva-detalle.html?id=${booking.id}'">${detailsText}</button>
                    ${gridId === 'past-trips' ? `<button class="btn-secondary" onclick="showReviewModal('${booking.destination.id}', '${currentLanguage === 'es' ? booking.destination.name : booking.destination.enname}')">✍️ ${reviewText}</button>` : ''}
                </div>
            </div>
        </div>
        `;
    }).join('');


}


// Load favorites from localStorage
function loadFavorites() {
    if (typeof FavoritesManager === 'undefined') {
        console.error('FavoritesManager not loaded');
        return;
    }
    
    const favorites = FavoritesManager.getUserFavorites();
    const favoritesGrid = document.getElementById('favorites-list');
    
    if (favorites.length === 0) {
        if (currentLanguage === 'es') {
            favoritesGrid.innerHTML = '<p class="empty-state">No tienes destinos favoritos aún. <a href="explore.html">¡Explora y añade algunos!</a></p>';
        } else {
            favoritesGrid.innerHTML = '<p class="empty-state">You have no favorite destinations yet. <a href="explore.html">Explore and add some!</a></p>';
        }
        return;
    }
    
    // Load destinations data
    fetch('images/ciudades-del-mundo.json')
        .then(response => response.json())
        .then(data => {
            // Flatten the nested structure
            const allCities = [];
            
            if (data.continents && Array.isArray(data.continents)) {
                data.continents.forEach(continent => {
                    if (continent.countries && Array.isArray(continent.countries)) {
                        continent.countries.forEach(country => {
                            if (country.cities && Array.isArray(country.cities)) {
                                country.cities.forEach(city => {
                                    allCities.push({
                                        ...city,
                                        country: country.name,
                                        encountry: country.encountry,
                                        encontinent: continent.encontinent,
                                        continent: continent.name,
                                        // Usar el mismo método que destinations.js
                                        id: `${city.name}-${country.name}`
                                            .toLowerCase()
                                            .normalize('NFD')
                                            .replace(/[\u0300-\u036f]/g, '')
                                            .replace(/[^a-z0-9]+/g, '-')
                                            .replace(/^-+|-+$/g, '')
                                    });
                                });
                            }
                        });
                    }
                });
            }
            
            const favoriteDestinations = allCities.filter(dest => favorites.includes(dest.id));
            
            if (favoriteDestinations.length === 0) {
                if (currentLanguage === 'es') {
                    favoritesGrid.innerHTML = '<p class="empty-state">No tienes destinos favoritos aún. <a href="explore.html">¡Explora y añade algunos!</a></p>';
                } else {
                    favoritesGrid.innerHTML = '<p class="empty-state">You have no favorite destinations yet. <a href="explore.html">Explore and add some!</a></p>';
                }
                return;
            }
            
            favoritesGrid.innerHTML = favoriteDestinations.map(dest => `
                <div class="favorite-card" data-id="${dest.id}">
                    <div class="favorite-image">
                        <img src="${dest.image?.url || ''}" 
                             alt="${currentLanguage === 'es' ? dest.name : dest.enname}"
                             onerror="this.style.background='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; this.style.display='block';">
                    </div>
                    <div class="favorite-info">
                        <h3 class="favorite-name">${currentLanguage === 'es' ? dest.name : dest.enname}</h3>
                        <p class="favorite-location">📍 ${currentLanguage === 'es' ? dest.country : dest.encountry}</p>
                        <div class="favorite-actions">
                            <button class="btn-primary" onclick="window.location.href='explore.html?destination=${dest.id}'">${currentLanguage === 'es' ? 'Ver Destino' : 'View Destination'}</button>
                            <button class="btn-delete" onclick="removeFavorite('${dest.id}')">${currentLanguage === 'es' ? 'Eliminar' : 'Delete'}</button>
                        </div>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error loading favorites:', error);
            favoritesGrid.innerHTML = `<p class="empty-state">${currentLanguage === 'es' ? 'Error al cargar favoritos.' : 'Error loading favorites.'}</p>`;
        });
}

// Load user stats
function loadStats() {
    const user = AuthManager.getCurrentUser();
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const userBookings = bookings.filter(b => b.userId === user.email && b.status === 'upcoming');
    
    let favoritesCount = 0;
    let reviewsCount = 0;
    
    if (typeof FavoritesManager !== 'undefined') {
        favoritesCount = FavoritesManager.getUserFavorites().length;
    }
    
    if (typeof ReviewsManager !== 'undefined') {
        reviewsCount = ReviewsManager.getUserReviews(user.email).length;
    }
    
    // Update stats
    document.getElementById('stat-trips').textContent = userBookings.length;
    document.getElementById('stat-favorites').textContent = favoritesCount;
    document.getElementById('stat-reviews').textContent = reviewsCount;
}

// Remove favorite
function removeFavorite(destinationId) {
    if (!confirm(`${currentLanguage === 'es' ? '¿Quieres eliminar este destino de tus favoritos?' : 'Do you want to remove this destination from your favorites?'}`)) return;
    
    if (typeof FavoritesManager !== 'undefined') {
        FavoritesManager.toggleFavorite(destinationId);
    }
    
    // Reload favorites
    loadFavorites();
    loadStats();
}

// Handle logout
function handleLogout() {
    showLogoutConfirmation();
}

// Show logout confirmation modal
function showLogoutConfirmation() {
    // Create modal (styles are in perfil.css)
    const modal = document.createElement('div');
    modal.className = 'logout-modal';
    modal.innerHTML = `
        <div class="logout-overlay"></div>
        <div class="logout-content">
            <div class="logout-icon">🚪</div>
            <h3 class="logout-title">${currentLanguage === 'es' ? '¿Cerrar sesión?' : 'Log out?'}</h3>
            <p class="logout-message">${currentLanguage === 'es' ? '¿Estás seguro de que deseas cerrar sesión?' : 'Are you sure you want to log out?'}</p>
            <div class="logout-actions">
                <button class="btn-cancel" id="logout-cancel">${currentLanguage === 'es' ? 'Cancelar' : 'Cancel'}</button>
                <button class="btn-confirm" id="logout-confirm">${currentLanguage === 'es' ? 'Cerrar sesión' : 'Log out'}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    const closeModal = () => {
        modal.style.animation = 'modalFadeIn 0.2s ease reverse';
        setTimeout(() => modal.remove(), 200);
    };
    
    document.getElementById('logout-cancel').addEventListener('click', closeModal);
    document.querySelector('.logout-overlay').addEventListener('click', closeModal);
    
    document.getElementById('logout-confirm').addEventListener('click', () => {
        closeModal();
        AuthManager.logout(true);
        window.location.href = 'index.html';
    });
}

// Handle edit profile
function handleEditProfile() {
    if (typeof showNotification !== 'undefined') {
        showNotification(currentLanguage === 'es' ? 'Función de edición de perfil próximamente' : 'Profile edit feature coming soon', 'info');
    }
}

// Show review modal
function showReviewModal(destinationId, destinationName) {
    const modal = document.createElement('div');
    modal.className = 'review-modal-overlay';
    modal.innerHTML = `
        <div class="review-modal">
            <div class="review-modal-header">
                <h3>${currentLanguage === 'es' ? 'Escribir Reseña' : 'Write Review'}</h3>
                <button class="close-modal" onclick="this.closest('.review-modal-overlay').remove()">&times;</button>
            </div>
            <div class="review-modal-body">
                <h4>${destinationName}</h4>
                <div class="rating-input">
                    <label>${currentLanguage === 'es' ? 'Calificación:' : 'Rating:'}</label>
                    <div class="stars-input" id="stars-input">
                        ${[1,2,3,4,5].map(star => `
                            <button class="star-btn" data-rating="${star}" onclick="selectRating(${star})">⭐</button>
                        `).join('')}
                    </div>
                </div>
                <textarea id="review-comment" placeholder="${currentLanguage === 'es' ? 'Comparte tu experiencia...' : 'Share your experience...'}" rows="5"></textarea>
                <button class="btn-primary" onclick="submitReview('${destinationId}', '${destinationName}')">${currentLanguage === 'es' ? 'Publicar Reseña' : 'Submit Review'}</button>
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .review-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        .review-modal {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
        }
        .review-modal-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1rem;
        }
        .close-modal {
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            color: #666;
        }
        .rating-input {
            margin: 1rem 0;
        }
        .stars-input {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        .star-btn {
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            filter: grayscale(100%);
        }
        .star-btn.active {
            filter: grayscale(0%);
        }
        #review-comment {
            width: 100%;
            padding: 1rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            margin: 1rem 0;
            font-family: inherit;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
}

let selectedRating = 0;

function selectRating(rating) {
    selectedRating = rating;
    const stars = document.querySelectorAll('.star-btn');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function submitReview(destinationId, destinationName) {
    const comment = document.getElementById('review-comment').value.trim();
    
    if (selectedRating === 0) {
        alert(currentLanguage === 'es' ? 'Por favor selecciona una calificación' : 'Please select a rating');
        return;
    }
    
    if (!comment) {
        alert(currentLanguage === 'es' ? 'Por favor escribe un comentario' : 'Please write a comment');
        return;
    }
    
    if (typeof ReviewsManager !== 'undefined') {
        const success = ReviewsManager.addReview(destinationId, destinationName, selectedRating, comment);
        
        if (success) {
            document.querySelector('.review-modal-overlay').remove();
            loadReviews();
            loadStats();
        }
    }
}

// Make functions global
window.showReviewModal = showReviewModal;
window.selectRating = selectRating;
window.submitReview = submitReview;
window.deleteReview = deleteReview;

// Load sample trips with real images from JSON (deprecated - replaced by loadUserTrips)
function loadSampleTripsOld() {
    fetch('images/ciudades-del-mundo.json')
        .then(response => response.json())
        .then(data => {
            // Flatten the nested structure: continents -> countries -> cities
            const allCities = [];
            
            if (data.continents && Array.isArray(data.continents)) {
                data.continents.forEach(continent => {
                    if (continent.countries && Array.isArray(continent.countries)) {
                        continent.countries.forEach(country => {
                            if (country.cities && Array.isArray(country.cities)) {
                                country.cities.forEach(city => {
                                    allCities.push({
                                        ...city,
                                        country: country.name,
                                        continent: continent.name,
                                        id: `${city.name.toLowerCase()}-${country.name.toLowerCase()}`.replace(/\s+/g, '-')
                                    });
                                });
                            }
                        });
                    }
                });
            }
            
            if (allCities.length === 0) {
                console.error('No cities found in JSON');
                return;
            }
            
            // Get some random destinations for upcoming trips (2 trips)
            const upcomingDestinations = getRandomDestinations(allCities, 2);
            const upcomingGrid = document.getElementById('upcoming-trips');
            
            if (upcomingDestinations.length > 0) {
                upcomingGrid.innerHTML = upcomingDestinations.map((dest, index) => {
                    const futureDate = new Date();
                    futureDate.setDate(futureDate.getDate() + (30 * (index + 1))); // +1 month, +2 months
                    const dateStr = futureDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
                    
                    return `
                        <div class="trip-card">
                            <div class="trip-image">
                                <img src="${dest.image?.url || ''}" 
                                     alt="${currentLanguage === 'es' ? dest.name : dest.enname}"
                                     onerror="this.style.background='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; this.style.display='block';">
                            </div>
                            <div class="trip-details">
                                <h3 class="trip-name">${currentLanguage === 'es' ? dest.name : dest.enname}, ${currentLanguage === 'es' ? dest.country : dest.encountry}</h3>
                                <p class="trip-date">📅 ${dateStr}</p>
                                <div class="trip-actions">
                                    <button class="btn-primary" onclick="window.location.href='explore.html?destination=${dest.id}'">${currentLanguage === 'es' ? 'Ver Detalles' : 'View Details'}</button>
                                    <button class="btn-secondary">✏️ ${currentLanguage === 'es' ? 'Contactar' : 'Contact'}</button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
            
            // Get some random destinations for past trips (3 trips)
            const pastDestinations = getRandomDestinations(allCities, 3);
            const pastGrid = document.getElementById('past-trips');
            
            if (pastDestinations.length > 0) {
                pastGrid.innerHTML = pastDestinations.map((dest, index) => {
                    const pastDate = new Date();
                    pastDate.setMonth(pastDate.getMonth() - (index + 1)); // -1 month, -2 months, -3 months
                    const dateStr = pastDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
                    
                    return `
                        <div class="trip-card">
                            <div class="trip-image">
                                <img src="${dest.image?.url || ''}" 
                                     alt="${currentLanguage === 'es' ? dest.name : dest.enname}"
                                     onerror="this.style.background='linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'; this.style.display='block';">
                            </div>
                            <div class="trip-details">
                                <h3 class="trip-name">${currentLanguage === 'es' ? dest.name : dest.enname}, ${currentLanguage === 'es' ? dest.country : dest.encountry}</h3>
                                <p class="trip-date">📅 ${dateStr}</p>
                                <div class="trip-actions">
                                    <button class="btn-secondary" onclick="window.location.href='explore.html?destination=${dest.id}'">${currentLanguage === 'es' ? 'Reservar de nuevo' : 'Book Again'}</button>
                                    <button class="btn-secondary">✍️ ${currentLanguage === 'es' ? 'Escribir reseña' : 'Write Review'}</button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        })
        .catch(error => {
            console.error('Error loading trips:', error);
        });
}

// Get random destinations from array
function getRandomDestinations(destinations, count) {
    if (!Array.isArray(destinations) || destinations.length === 0) {
        return [];
    }
    const shuffled = [...destinations].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, destinations.length));
}

// Export function for use in HTML
window.removeFavorite = removeFavorite;
