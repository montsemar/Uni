// Reservas Management
class ReservasManager {
    constructor() {
        this.bookings = [];
        this.init();
    }

    init() {
        // Wait for AuthManager to be ready
        setTimeout(() => {
            // Require authentication
            if (typeof AuthManager === 'undefined' || !AuthManager.isAuthenticated()) {
                console.log('User not authenticated, showing modal');
                AuthModal.show();
                document.addEventListener('authmodal:close', () => {
                    if (!AuthManager.isAuthenticated()) {
                        console.log('User still not authenticated, redirecting to home');
                        window.location.href = './index.html';
                    }});
                document.removeEventListener('authmodal:close', this);
                // window.location.href = './index.html';
                return;
            }

            console.log('User authenticated, loading bookings');
            this.loadBookings();
            this.displayBookings();
        }, 100);
    }

    loadBookings() {
        const currentUser = AuthManager.getCurrentUser();
        const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        
        // Filter bookings for current user (exclude cancelled)
        this.bookings = allBookings.filter(b => b.userId === currentUser.email && b.status !== 'cancelled');
        
        // Update status based on dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        this.bookings.forEach(booking => {
            const checkOutDate = new Date(booking.checkOut);
            checkOutDate.setHours(0, 0, 0, 0);
            
            if (booking.status === 'upcoming' && checkOutDate < today) {
                booking.status = 'past';
            }
        });
        
        // Save updated bookings
        const allUpdated = JSON.parse(localStorage.getItem('bookings') || '[]');
        allUpdated.forEach(b => {
            const updated = this.bookings.find(ub => ub.id === b.id);
            if (updated) {
                b.status = updated.status;
            }
        });
        localStorage.setItem('bookings', JSON.stringify(allUpdated));
    }

    displayBookings() {
        // Get container
        const container = document.getElementById('all-bookings');
        
        // Clear container
        container.innerHTML = '';
        
        // Show empty state if no bookings
        if (this.bookings.length === 0) {
            const emptyState = this.createEmptyState();
            container.appendChild(emptyState);
            return;
        }
        
        // Display bookings
        this.bookings.forEach(booking => {
            const card = this.createBookingCard(booking);
            container.appendChild(card);
        });
    }

    createEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state active';
       
        if (currentLanguage === 'es') {
            emptyState.innerHTML = `
                <div class="empty-icon">🗓️</div>
                <h3>No tienes reservas</h3>
                <p>¿Listo para tu próxima aventura?</p>
                <a href="explore.html" class="btn-primary">Explorar Destinos</a>
            `;
        } else {
            emptyState.innerHTML = `
                <div class="empty-icon">🗓️</div>
                <h3>You have no bookings</h3>
                <p>Ready for your next adventure?</p>
                <a href="explore.html" class="btn-primary">Explore Destinations</a>
            `;
        }    
        return emptyState;
    }

    createBookingCard(booking) {
        const card = document.createElement('div');
        card.className = 'booking-card';
        
        const accommodationNames = {
            'hostel': 'Hostel',
            'hotel-3': 'Hotel 3★',
            'hotel-4': 'Hotel 4★',
            'hotel-5': 'Hotel 5★'
        };
        
        // Handle image object or string
        const imageUrl = booking.destination.image?.url || booking.destination.image || '';
        const imageStyle = imageUrl 
            ? `background-image: url(${imageUrl})`
            : 'background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%)';
        
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);
        
        card.innerHTML = `
            <div class="booking-image" style="${imageStyle}"></div>
            <div class="booking-info">
                <div class="booking-header-info">
                    <h3 class="booking-destination">${currentLanguage === 'es' ? booking.destination.name : booking.destination.enname}</h3>
                    <p class="booking-location">${currentLanguage === 'es' ? booking.destination.country : booking.destination.encountry}</p>
                </div>
                
                <div class="booking-details">
                    <div class="booking-detail">
                        <span class="detail-icon">📅</span>
                        <span>${checkInDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${checkOutDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div class="booking-detail">
                        <span class="detail-icon">🏨</span>
                        <span>${accommodationNames[booking.accommodation]}</span>
                    </div>
                    <div class="booking-detail">
                        <span class="detail-icon">👥</span>
                        <span>${booking.travelers} ${booking.travelers === 1 ? (currentLanguage === 'es' ? 'viajero' : 'passenger') : (currentLanguage === 'es' ? 'viajeros' : 'passengers')}</span>
                    </div>
                    <div class="booking-detail">
                        <span class="detail-icon">🌙</span>
                        <span>${booking.nights} ${booking.nights === 1 ? (currentLanguage === 'es' ? 'noche' : 'night') : (currentLanguage === 'es' ? 'noches' : 'nights')}</span>
                    </div>
                </div>
                
                <div class="booking-footer">
                    <div class="booking-price">
                        <span class="price-label">Total:</span>
                        <span class="price-value">€${booking.pricing.total.toLocaleString()}</span>
                    </div>
                    <button class="btn-secondary" onclick="window.location.href='reserva-detalle.html?id=${booking.id}'">
                        ${currentLanguage === 'es' ? 'Ver Detalles →' : 'View Details →'}
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new ReservasManager();
});

document.addEventListener('languageChanged', () => {
    new ReservasManager();
});