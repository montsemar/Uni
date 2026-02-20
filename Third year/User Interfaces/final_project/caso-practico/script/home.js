/* ===================================
   Index/Home Page - Protected Actions
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Protect "Reservar ahora" buttons
    protectBookingButtons();
    
    // Protect favorites button in header
    protectFavoritesButton();
    
    // Protect any card action buttons
    protectCardActions();

    // Update protections on language change
    document.addEventListener('languageChanged', function(e) {
        protectBookingButtons();
        protectFavoritesButton();
        protectCardActions();
        AuthManager.updateUIForAllPages();
    });
});

// Protect booking buttons
function protectBookingButtons() {
    const bookingButtons = document.querySelectorAll('[href*="reservar"], [href*="booking"], .btn-book, .book-now');
    
    bookingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (typeof AuthManager !== 'undefined' && !AuthManager.isAuthenticated()) {
                e.preventDefault();
                AuthManager.requireAuth(() => {
                    // After login, proceed with booking
                    window.location.href = button.href || 'reservas.html';
                });
            }
        });
    });
}

// Protect favorites button
function protectFavoritesButton() {
    const favoritesBtn = document.querySelector('#favorites-count, [href="#favorites"], .btn-favorites');
    
    if (favoritesBtn) {
        favoritesBtn.addEventListener('click', function(e) {
            if (typeof AuthManager !== 'undefined' && !AuthManager.isAuthenticated()) {
                e.preventDefault();
                AuthManager.requireAuth(() => {
                    // After login, show favorites
                    showFavorites();
                });
            }
        });
    }
}

// Protect card action buttons (likes, favorites in cards)
function protectCardActions() {
    // Look for favorite/like buttons in destination cards
    const actionButtons = document.querySelectorAll('.card-favorite, .card-like, .favorite-btn, .like-btn');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (typeof AuthManager !== 'undefined' && !AuthManager.isAuthenticated()) {
                e.preventDefault();
                e.stopPropagation();
                AuthManager.requireAuth(() => {
                    // After login, execute the original action
                    button.click();
                });
            }
        });
    });
}

// Show favorites (placeholder function)
function showFavorites() {
    // This would navigate to a favorites page or show a modal
    window.location.href = 'explore.html#favorites';
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.protectAction = function(callback) {
        if (typeof AuthManager !== 'undefined' && !AuthManager.isAuthenticated()) {
            AuthManager.requireAuth(callback);
        } else {
            callback();
        }
    };
}
