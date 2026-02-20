// Booking Detail Management
class BookingDetailManager {
    constructor() {
        this.booking = null;
        this.init();
    }

    init() {
        // Wait for AuthManager to be ready
        setTimeout(() => {
            // Require authentication
            if (typeof AuthManager === 'undefined' || !AuthManager.isAuthenticated()) {
                console.log('User not authenticated, redirecting to home');
                window.location.href = '../index.html';
                return;
            }

            console.log('User authenticated, loading booking');
            
            // Load booking from URL
            const params = new URLSearchParams(window.location.search);
            const bookingId = params.get('id');
            
            if (!bookingId) {
                alert('No se ha especificado una reserva');
                window.location.href = 'reservas.html';
                return;
            }

            this.loadBooking(bookingId);
            this.setupEventListeners();
        }, 100);
    }

    loadBooking(bookingId) {
        const currentUser = AuthManager.getCurrentUser();
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        
        // Find booking by ID and verify ownership
        this.booking = bookings.find(b => b.id === bookingId && b.userId === currentUser.email);
        
        if (!this.booking) {
            alert('Reserva no encontrada');
            window.location.href = 'reservas.html';
            return;
        }

        this.displayBooking();
    }

    displayBooking() {
        const b = this.booking;
        
        // Header
        const header = document.getElementById('booking-header');
        header.innerHTML = `
            <div class="booking-status">
                <span class="status-badge" id="status-badge">Próxima</span>
                <h1 class="booking-title">${currentLanguage === 'es' ? 'Reserva #' : 'Reservation #'}<span id="booking-id">${b.id}</span></h1>
            </div>
            <div class="booking-actions" id="booking-actions">
                <button class="btn-secondary" onclick="window.print()">${currentLanguage === 'es' ? '📄 Descargar PDF' : '📄 Download PDF'}</button>
                <button class="btn-danger" id="cancel-booking-btn">${currentLanguage === 'es' ? '❌ Cancelar Reserva' : '❌ Cancel Reservation'}</button>
            </div>
        `;
        
        // Status badge
        const statusBadge = document.getElementById('status-badge');
        const statusText = {
            'upcoming': currentLanguage === 'es' ? 'Próxima' : 'Upcoming',
            'past': currentLanguage === 'es' ? 'Completada' : 'Completed',
            'cancelled': currentLanguage === 'es' ? 'Cancelada' : 'Cancelled'
        };
        statusBadge.textContent = statusText[b.status] || 'Próxima';
        statusBadge.classList.add(b.status);
        
        // Hide cancel button for past/cancelled bookings
        if (b.status !== 'upcoming') {
            document.getElementById('cancel-booking-btn').style.display = 'none';
        }
        
        // Destination
        document.getElementById('destination-name').textContent = currentLanguage === 'es' ? b.destination.name : b.destination.enname;
        document.getElementById('destination-location').textContent = currentLanguage === 'es' ? `${b.destination.country}, ${b.destination.continent}` : `${b.destination.encountry}, ${b.destination.encontinent}`;
        document.getElementById('destination-description').textContent = currentLanguage === 'es' ? (b.destination.description || 'Descubre este increíble destino con Nomad Trails.') : (b.destination.endescription || 'Discover this amazing destination with Nomad Trails.');
        
        const imageEl = document.getElementById('destination-image');
        // Handle image object or string
        const imageUrl = b.destination.image?.url || b.destination.image || '';
        if (imageUrl) {
            imageEl.style.backgroundImage = `url(${imageUrl})`;
        } else {
            imageEl.style.background = 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)';
        }
        
        // Travel details
        const accommodationNames = {
            'hostel': 'Hostel',
            'hotel-3': 'Hotel 3★',
            'hotel-4': 'Hotel 4★',
            'hotel-5': 'Hotel 5★'
        };
        
        document.getElementById('check-in-date').textContent = new Date(b.checkIn).toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : 'en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        document.getElementById('check-out-date').textContent = new Date(b.checkOut).toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : 'en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        document.getElementById('nights').textContent = b.nights;
        document.getElementById('travelers').textContent = b.travelers + (b.travelers === 1 ? (currentLanguage === 'es' ? ' persona' : ' passenger') : (currentLanguage === 'es' ? ' personas' : ' passengers'));
        document.getElementById('accommodation').textContent = accommodationNames[b.accommodation] || b.accommodation;
        document.getElementById('booking-date').textContent = new Date(b.createdAt).toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : 'en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Pet information
        if (b.hasPet) {
            document.getElementById('pet-info-section').style.display = 'flex';
            const petInfo = `${b.petType || 'Mascota'}${b.petWeight ? ' (' + b.petWeight + ')' : ''}`;
            document.getElementById('pet-info').textContent = petInfo;
        }
        
        // Special requests
        if (b.specialRequests && b.specialRequests.trim()) {
            document.getElementById('special-requests-section').style.display = 'block';
            document.getElementById('special-requests-text').textContent = b.specialRequests;
        }
        
        // Pricing
        document.getElementById('price-base').textContent = `€${(b.pricing.basePrice || 0).toLocaleString()}`;
        document.getElementById('price-accommodation').textContent = `€${(b.pricing.accommodationPrice || 0).toLocaleString()}`;
        document.getElementById('price-fees').textContent = `€${(b.pricing.fees || 0).toLocaleString()}`;
        document.getElementById('price-total').textContent = `€${(b.pricing.total || 0).toLocaleString()}`;
        
        // Timeline
        document.getElementById('timeline-confirmed').textContent = new Date(b.createdAt).toLocaleDateString('es-ES');
        document.getElementById('timeline-travel-date').textContent = new Date(b.checkIn).toLocaleDateString('es-ES');
        
        // Mark upcoming timeline item as completed if past
        const checkInDate = new Date(b.checkIn);
        const today = new Date();
        if (checkInDate <= today) {
            document.getElementById('timeline-upcoming').classList.add('completed');
        }
    }

    setupEventListeners() {
        // Cancel booking button
        document.getElementById('cancel-booking-btn')?.addEventListener('click', () => {
            this.cancelBooking();
        });

        // Itinerary planner
        this.setupItineraryPlanner();
    }

    setupItineraryPlanner() {
        // Initialize activities from booking
        if (!this.booking.itinerary) {
            this.booking.itinerary = [];
        }
        this.renderActivities();

        // Add activity button
        document.getElementById('add-activity-btn').addEventListener('click', () => {
            this.addActivity();
        });

        // Enter key in input
        document.getElementById('activity-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addActivity();
            }
        });
    }

    addActivity() {
        const input = document.getElementById('activity-input');
        const text = input.value.trim();

        if (!text) return;

        const activity = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.booking.itinerary.push(activity);
        this.saveItinerary();
        this.renderActivities();
        input.value = '';
    }

    renderActivities() {
        const list = document.getElementById('activities-list');
        const empty = document.getElementById('itinerary-empty');

        empty.innerHTML = `
            <p>${currentLanguage === 'es' ? '📝 No hay actividades planificadas todavía' : '📝 No activities planned yet'}</p>
            <small>${currentLanguage === 'es' ? 'Añade actividades para organizar tu viaje' : 'Add activities to organize your trip'}</small>
        `;
        
        if (this.booking.itinerary.length === 0) {
            list.innerHTML = '';
            empty.classList.add('show');
            return;
        }

        empty.classList.remove('show');
        
        list.innerHTML = this.booking.itinerary.map((activity, index) => `
            <div class="activity-item ${activity.completed ? 'completed' : ''}" data-id="${activity.id}" draggable="true">
                <span class="activity-drag-handle">☰</span>
                <input type="checkbox" class="activity-checkbox" ${activity.completed ? 'checked' : ''} 
                    onchange="bookingDetailManager.toggleActivity('${activity.id}')">
                <span class="activity-text">${this.escapeHtml(activity.text)}</span>
                <div class="activity-actions">
                    <button class="activity-btn delete" onclick="bookingDetailManager.deleteActivity('${activity.id}')" title="Eliminar">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');

        // Setup drag and drop
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const items = document.querySelectorAll('.activity-item');
        let draggedItem = null;

        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                item.style.opacity = '0.5';
            });

            item.addEventListener('dragend', (e) => {
                item.style.opacity = '1';
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedItem !== item) {
                    const allItems = [...items];
                    const draggedIndex = allItems.indexOf(draggedItem);
                    const targetIndex = allItems.indexOf(item);

                    // Reorder array
                    const [removed] = this.booking.itinerary.splice(draggedIndex, 1);
                    this.booking.itinerary.splice(targetIndex, 0, removed);

                    this.saveItinerary();
                    this.renderActivities();
                }
            });
        });
    }

    toggleActivity(id) {
        const activity = this.booking.itinerary.find(a => a.id === id);
        if (activity) {
            activity.completed = !activity.completed;
            this.saveItinerary();
            this.renderActivities();
        }
    }

    deleteActivity(id) {
        if (!confirm(currentLanguage === 'es' ? '¿Eliminar esta actividad?' : 'Delete this activity?')) return;
        
        this.booking.itinerary = this.booking.itinerary.filter(a => a.id !== id);
        this.saveItinerary();
        this.renderActivities();
    }

    saveItinerary() {
        const currentUser = AuthManager.getCurrentUser();
        let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        
        const index = bookings.findIndex(b => b.id === this.booking.id && b.userId === currentUser.email);
        
        if (index !== -1) {
            bookings[index].itinerary = this.booking.itinerary;
            localStorage.setItem('bookings', JSON.stringify(bookings));
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    cancelBooking() {
        this.showCancelConfirmation();
    }

    showCancelConfirmation() {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'cancel-booking-modal';
        modal.innerHTML = `
            <div class="cancel-overlay"></div>
            <div class="cancel-content">
                <div class="cancel-icon">⚠️</div>
                <h3 class="cancel-title">${currentLanguage === 'es' ? '¿Cancelar Reserva?' : 'Cancel Booking?'}</h3>
                <p class="cancel-message">
                    ${currentLanguage === 'es' ? 'Esta acción no se puede deshacer y la reserva será eliminada permanentemente.' : 'This action cannot be undone and the booking will be permanently deleted.'}
                </p>
                <p class="cancel-warning">${currentLanguage === 'es' ? '¿Estás seguro de que deseas continuar?' : 'Are you sure you want to continue?'}</p>
                <div class="cancel-actions">
                    <button class="btn-keep" id="cancel-keep">${currentLanguage === 'es' ? 'No, mantener reserva' : 'No, keep booking'}</button>
                    <button class="btn-delete" id="cancel-confirm">${currentLanguage === 'es' ? 'Sí, cancelar reserva' : 'Yes, cancel booking'}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        const closeModal = () => {
            modal.style.animation = 'cancelFadeIn 0.2s ease reverse';
            setTimeout(() => modal.remove(), 200);
        };
        
        document.getElementById('cancel-keep').addEventListener('click', closeModal);
        document.querySelector('.cancel-overlay').addEventListener('click', closeModal);
        
        document.getElementById('cancel-confirm').addEventListener('click', () => {
            closeModal();
            this.performCancellation();
        });
    }

    performCancellation() {
        const currentUser = AuthManager.getCurrentUser();
        let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        
        // Find and remove booking
        const index = bookings.findIndex(b => b.id === this.booking.id && b.userId === currentUser.email);
        
        if (index !== -1) {
            // Remove booking from array
            bookings.splice(index, 1);
            localStorage.setItem('bookings', JSON.stringify(bookings));
            
            // Show notification
            const notification = document.createElement('div');
            notification.className = 'notification success';
            notification.textContent = currentLanguage === 'es' ? 'Reserva cancelada y eliminada correctamente' : 'Booking cancelled and deleted successfully';
            document.body.appendChild(notification);
            
            setTimeout(() => notification.remove(), 3000);
            
            // Redirect to reservas page
            setTimeout(() => {
                window.location.href = 'reservas.html';
            }, 1500);
        }
    }
}

// Initialize on page load
let bookingDetailManager;
document.addEventListener('DOMContentLoaded', () => {
    bookingDetailManager = new BookingDetailManager();
});

document.addEventListener('languageChanged', () => {
    if (bookingDetailManager && bookingDetailManager.booking) {
        bookingDetailManager.displayBooking();
        bookingDetailManager.renderActivities();
    }
});
