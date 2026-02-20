// Checkout Management
class CheckoutManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5; // 5 steps + confirmation
        this.bookingData = {
            destination: null,
            travelers: 1,
            checkIn: null,
            checkOut: null,
            accommodation: 'hotel-4',
            specialRequests: '',
            hasPet: false,
            petType: '',
            petWeight: 0,
            pricing: {
                basePrice: 0,
                total: 0
            }
        };
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

            console.log('User authenticated, initializing checkout');
            this.loadDestinationAndContinue();
        }, 100);
    }

    loadDestinationAndContinue() {
        // Load destination from URL
        const params = new URLSearchParams(window.location.search);
        const destinationId = params.get('destination');
        
        if (!destinationId) {
            alert('No se ha seleccionado un destino');
            window.location.href = 'explore.html';
            return;
        }

        this.loadDestination(destinationId);
        this.setupEventListeners();
        this.setMinDates();
    }

    async loadDestination(destinationId) {
        try {
            // Ensure destinations are loaded
            if (typeof window.ensureDestinationsLoaded === 'function') {
                await window.ensureDestinationsLoaded();
            }
            
            // Find destination in allDestinations array
            const destination = allDestinations.find(d => d.id === destinationId);
            
            if (!destination) {
                console.error('Destination not found:', destinationId);
                console.log('Available destinations:', allDestinations.map(d => d.id).join(', '));
                alert('Destino no encontrado');
                window.location.href = 'explore.html';
                return;
            }

            this.bookingData.destination = destination;
            this.displayDestination();
            this.calculatePricing();
        } catch (error) {
            console.error('Error loading destination:', error);
            alert('Error al cargar el destino');
        }
    }

    displayDestination() {
        const dest = this.bookingData.destination;
        
        document.getElementById('destination-name').textContent = currentLanguage === 'es' ? dest.name : dest.enname;
        document.getElementById('destination-location').textContent = `${currentLanguage === 'es' ? dest.country : dest.encountry}, ${currentLanguage === 'es' ? dest.continent : dest.encontinent}`;
        document.getElementById('destination-display').value = `${currentLanguage === 'es' ? dest.name : dest.enname}, ${currentLanguage === 'es' ? dest.country : dest.encountry}`;
        
        const imageEl = document.getElementById('summary-image');
        // Handle image object or string
        const imageUrl = dest.image?.url || dest.image || '';
        if (imageUrl) {
            imageEl.style.backgroundImage = `url(${imageUrl})`;
        } else {
            imageEl.style.background = 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)';
        }
    }

    setMinDates() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        document.getElementById('check-in').min = todayStr;
        document.getElementById('check-out').min = tomorrowStr;
        document.getElementById('check-in').value = todayStr;
        document.getElementById('check-out').value = tomorrowStr;
    }

    setupEventListeners() {
        // Step 1: Destino y Fechas
        document.getElementById('destination-dates-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStep1();
            this.nextStep();
        });

        // Step 2: Pasajeros
        document.getElementById('passengers-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStep2();
            this.nextStep();
        });

        // Step 3: Mascota
        document.getElementById('pet-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStep3();
            this.nextStep();
        });

        // Step 4: Preferencias
        document.getElementById('preferences-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStep4();
            this.nextStep();
        });

        // Step 5: Pago
        document.getElementById('payment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPayment();
        });

        // Date Validation
        document.getElementById('check-in').addEventListener('change', (e) => {
            const checkInDate = new Date(e.target.value);
            const checkOutInput = document.getElementById('check-out');
            const checkOutDate = new Date(checkOutInput.value);
            if (checkOutDate <= checkInDate) {
                const newCheckOutDate = new Date(checkInDate);
                // Set to next day automatically
                newCheckOutDate.setDate(newCheckOutDate.getDate() + 1);
                checkOutInput.value = newCheckOutDate.toISOString().split('T')[0];
            }
            this.updateSummary();
        });

        // Pet checkbox toggle
        document.getElementById('has-pet').addEventListener('change', (e) => {
            const petDetails = document.getElementById('pet-details');
            petDetails.style.display = e.target.checked ? 'block' : 'none';
            
            if (e.target.checked) {
                document.getElementById('pet-type').required = true;
                document.getElementById('pet-weight').required = true;
            } else {
                document.getElementById('pet-type').required = false;
                document.getElementById('pet-weight').required = false;
            }
            
            this.updateSummary();
        });

        // Form inputs that affect pricing
        document.getElementById('travelers').addEventListener('input', () => this.updateSummary());
        document.getElementById('check-in').addEventListener('change', () => this.updateSummary());
        document.getElementById('check-out').addEventListener('change', () => this.updateSummary());
        document.getElementById('accommodation').addEventListener('change', () => this.updateSummary());

        // Card number formatting
        document.getElementById('card-number').addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });

        // Expiry formatting
        document.getElementById('card-expiry').addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });

        // CVV validation
        document.getElementById('card-cvv').addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    saveStep1() {
        this.bookingData.checkIn = document.getElementById('check-in').value;
        this.bookingData.checkOut = document.getElementById('check-out').value;
        this.updateSummary();
    }

    saveStep2() {
        this.bookingData.travelers = parseInt(document.getElementById('travelers').value);
        this.updateSummary();
    }

    saveStep3() {
        this.bookingData.hasPet = document.getElementById('has-pet').checked;
        if (this.bookingData.hasPet) {
            this.bookingData.petType = document.getElementById('pet-type').value;
            this.bookingData.petWeight = parseInt(document.getElementById('pet-weight').value) || 0;
        }
        this.updateSummary();
    }

    saveStep4() {
        this.bookingData.accommodation = document.getElementById('accommodation').value;
        this.bookingData.specialRequests = document.getElementById('special-requests').value;
        this.updateSummary();
    }

    calculatePricing() {
        const dest = this.bookingData.destination;
        if (!dest) return;

        // Base price from destination
        this.bookingData.pricing.basePrice = dest.price || 500;

        this.updateSummary();
    }

    updateSummary() {
        const travelers = parseInt(document.getElementById('travelers').value) || 1;
        const checkIn = document.getElementById('check-in').value;
        const checkOut = document.getElementById('check-out').value;
        const accommodation = document.getElementById('accommodation').value;
        const hasPet = document.getElementById('has-pet').checked;

        // Calculate nights
        let nights = 0;
        if (checkIn && checkOut) {
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            nights = Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        }

        // Accommodation multipliers
        const accommodationMultipliers = {
            'hostel': 50,
            'hotel-3': 80,
            'hotel-4': 120,
            'hotel-5': 200
        };

        const accommodationNames = {
            'hostel': 'Hostel',
            'hotel-3': 'Hotel 3★',
            'hotel-4': 'Hotel 4★',
            'hotel-5': 'Hotel 5★'
        };

        // Calculate prices
        const basePrice = this.bookingData.pricing.basePrice;
        const nightlyRate = accommodationMultipliers[accommodation] || 120;
        const accommodationTotal = nightlyRate * nights;
        const travelersExtra = (travelers - 1) * 50 * nights; // Extra per additional traveler
        const petFee = hasPet ? 25 * nights : 0; // €25 per night with pet
        
        const fees = travelersExtra + petFee;
        const subtotal = basePrice + accommodationTotal + fees;
        const total = subtotal;

        // Update summary display
        document.getElementById('summary-checkin').textContent = checkIn ? new Date(checkIn).toLocaleDateString('es-ES') : '-';
        document.getElementById('summary-checkout').textContent = checkOut ? new Date(checkOut).toLocaleDateString('es-ES') : '-';
        document.getElementById('summary-travelers').textContent = travelers;
        document.getElementById('summary-pet').textContent = hasPet ? currentLanguage === 'es' ? 'Sí' : 'Yes' : currentLanguage === 'es' ? 'No' : 'No';
        document.getElementById('summary-accommodation').textContent = accommodationNames[accommodation];
        
        document.getElementById('price-subtotal').textContent = `€${subtotal.toLocaleString()}`;
        document.getElementById('price-total').textContent = `€${total.toLocaleString()}`;

        // Save to booking data with detailed pricing breakdown
        this.bookingData.pricing = {
            basePrice: basePrice,
            accommodationPrice: accommodationTotal,
            fees: fees,
            total: total
        };
        this.bookingData.nights = nights;
    }

    nextStep() {
        if (this.currentStep <= this.totalSteps) {
            // Hide current step
            document.getElementById(`step-${this.currentStep}`).classList.remove('active');
            const currentStepEl = document.querySelector(`.step[data-step="${this.currentStep}"]`);
            if (currentStepEl) {
                currentStepEl.classList.remove('active');
                currentStepEl.classList.add('completed');
            }
            
            // Show next step
            this.currentStep++;
            document.getElementById(`step-${this.currentStep}`).classList.add('active');
            const nextStepEl = document.querySelector(`.step[data-step="${this.currentStep}"]`);
            if (nextStepEl) {
                nextStepEl.classList.add('active');
            }
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    processPayment() {
        // Simulate payment processing
        const cardNumber = document.getElementById('card-number').value;
        const cardName = document.getElementById('card-name').value;
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCvv = document.getElementById('card-cvv').value;

        // Basic validation
        if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
            alert('Por favor completa todos los campos de pago');
            return;
        }

        // Simulate processing delay
        const submitBtn = document.querySelector('#payment-form button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = currentLanguage === 'es' ? 'Procesando...' : 'Processing...';

        setTimeout(() => {
            // Save booking (without card data)
            const bookingId = this.saveBooking();
            
            // Show success popup
            this.showPaymentSuccessPopup(bookingId);
            
            submitBtn.disabled = false;
            submitBtn.textContent = currentLanguage === 'es' ? 'Confirmar Pago →' : 'Confirm Payment →';
        }, 2000);
    }

    saveBooking() {
        const currentUser = AuthManager.getCurrentUser();
        
        // Generate booking ID
        const bookingId = 'BK' + Date.now().toString().slice(-8);
        
        // Create booking object (NO credit card data saved for security)
        const booking = {
            id: bookingId,
            userId: currentUser.email,
            destination: this.bookingData.destination,
            travelers: this.bookingData.travelers,
            checkIn: this.bookingData.checkIn,
            checkOut: this.bookingData.checkOut,
            nights: this.bookingData.nights,
            accommodation: this.bookingData.accommodation,
            specialRequests: this.bookingData.specialRequests,
            hasPet: this.bookingData.hasPet,
            petType: this.bookingData.petType,
            petWeight: this.bookingData.petWeight,
            pricing: this.bookingData.pricing,
            status: 'upcoming',
            createdAt: new Date().toISOString(),
            paymentMethod: 'credit-card'
            // NOTE: Card data is NOT saved for security reasons
        };

        // Save to localStorage
        let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        console.log('Booking saved:', bookingId);
        return bookingId;
    }
    
    showPaymentSuccessPopup(bookingId) {
        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.className = 'payment-success-overlay';
        overlay.style.cssText = `
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
            animation: fadeIn 0.3s ease;
        `;
        
        // Create popup
        const popup = document.createElement('div');
        popup.className = 'payment-success-popup';
        popup.style.cssText = `
            background: white;
            padding: 3rem;
            border-radius: 20px;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
        `;
        if (currentLanguage === 'es'){
        popup.innerHTML = `
            <div style="font-size: 4rem; color: #4CAF50; margin-bottom: 1rem;">✓</div>
            <h2 style="color: #2c3e50; margin-bottom: 1rem; font-size: 2rem;">¡Pago Completado!</h2>
            <p style="color: #666; margin-bottom: 0.5rem; font-size: 1.1rem;">Tu reserva ha sido confirmada correctamente.</p>
            <p style="color: #8B4513; font-weight: bold; margin-bottom: 2rem; font-size: 1.2rem;">ID de Reserva: ${bookingId}</p>
            <p style="color: #666; margin-bottom: 2rem;">Podrás ver los detalles de tu reserva en la página de Reservas</p>
            <button id="go-to-reservas" style="
                background: #8B4513;
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 8px;
                font-size: 1.1rem;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='#6d3410'" onmouseout="this.style.background='#8B4513'">
                Ver Mis Reservas →
            </button>
        `;} else {
        popup.innerHTML = `
            <div style="font-size: 4rem; color: #4CAF50; margin-bottom: 1rem;">✓</div>
            <h2 style="color: #2c3e50; margin-bottom: 1rem; font-size: 2rem;">Payment Completed!</h2>
            <p style="color: #666; margin-bottom: 0.5rem; font-size: 1.1rem;">Your booking has been successfully confirmed.</p>
            <p style="color: #8B4513; font-weight: bold; margin-bottom: 2rem; font-size: 1.2rem;">Booking ID: ${bookingId}</p>
            <p style="color: #666; margin-bottom: 2rem;">You can view your booking details on the Bookings page</p>
            <button id="go-to-reservas" style="
                background: #8B4513;
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 8px;
                font-size: 1.1rem;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='#6d3410'" onmouseout="this.style.background='#8B4513'">
                View My Bookings →
            </button>
        `;}
        
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Redirect on button click
        document.getElementById('go-to-reservas').addEventListener('click', () => {
            window.location.href = 'reservas.html';
        });
        
        // Auto redirect after 5 seconds if user doesn't click
        setTimeout(() => {
            window.location.href = 'reservas.html';
        }, 5000);
    }
}

function previousStep() {
    if (checkoutManager.currentStep > 1 && checkoutManager.currentStep <= checkoutManager.totalSteps + 1) {
        // Hide current step
        document.getElementById(`step-${checkoutManager.currentStep}`).classList.remove('active');
        const currentStepEl = document.querySelector(`.step[data-step="${checkoutManager.currentStep}"]`);
        if (currentStepEl) {
            currentStepEl.classList.remove('active');
        }
        
        // Show previous step
        checkoutManager.currentStep--;
        document.getElementById(`step-${checkoutManager.currentStep}`).classList.add('active');
        const prevStepEl = document.querySelector(`.step[data-step="${checkoutManager.currentStep}"]`);
        if (prevStepEl) {
            prevStepEl.classList.add('active');
            prevStepEl.classList.remove('completed');
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Initialize on page load
let checkoutManager;
document.addEventListener('DOMContentLoaded', () => {
    checkoutManager = new CheckoutManager();
});
