/* ===================================
   Favorites - Gestión de favoritos
   =================================== */

// Favorites Manager
const FavoritesManager = {
    // Prevent rapid duplicate toggles
    _toggleInProgress: {},
    // Get user's favorites
    getUserFavorites() {
        if (!AuthManager.isAuthenticated()) {
            console.log('[Favorites] User not authenticated');
            return [];
        }
        const userId = AuthManager.getCurrentUser().email;
        const rawStorage = localStorage.getItem('userFavorites');
        console.log('[Favorites] Raw localStorage value:', rawStorage);
        
        const allFavorites = JSON.parse(rawStorage || '{}');
        console.log('[Favorites] Parsed allFavorites:', allFavorites);
        
        const userFavorites = allFavorites[userId] || [];
        console.log(`[Favorites] getUserFavorites for ${userId}:`, userFavorites);
        console.log(`[Favorites] Array length: ${userFavorites.length}, Array type: ${Array.isArray(userFavorites)}`);
        
        return userFavorites;
    },
    
    // Save user's favorites
    saveUserFavorites(favorites) {
        if (!AuthManager.isAuthenticated()) return;
        const userId = AuthManager.getCurrentUser().email;
        
        console.log(`[Favorites] saveUserFavorites called with:`, favorites);
        console.log(`[Favorites] Array length: ${favorites.length}, Is Array: ${Array.isArray(favorites)}`);
        
        const allFavorites = JSON.parse(localStorage.getItem('userFavorites') || '{}');
        allFavorites[userId] = favorites;
        
        const stringified = JSON.stringify(allFavorites);
        console.log(`[Favorites] Stringified data (${stringified.length} chars):`, stringified);
        
        localStorage.setItem('userFavorites', stringified);
        console.log(`[Favorites] Saved to localStorage for ${userId}:`, favorites);
        console.log('[Favorites] All favorites in storage:', allFavorites);
        
        // Verify save was successful
        const verification = JSON.parse(localStorage.getItem('userFavorites') || '{}');
        const savedFavorites = verification[userId] || [];
        console.log(`[Favorites] Verification - Retrieved array length: ${savedFavorites.length}`);
        
        if (JSON.stringify(savedFavorites) !== JSON.stringify(favorites)) {
            console.error('[Favorites] ❌ SAVE VERIFICATION FAILED!');
            console.error('[Favorites] Expected:', favorites);
            console.error('[Favorites] Got:', savedFavorites);
            console.error('[Favorites] Difference in length:', favorites.length - savedFavorites.length);
        } else {
            console.log('[Favorites] ✅ Save verified successfully');
        }
    },
    
    // Check if destination is favorite
    isFavorite(destinationId) {
        const favorites = this.getUserFavorites();
        const result = favorites.includes(destinationId);
        console.log(`[Favorites] isFavorite(${destinationId}):`, result);
        return result;
    },
    
    // Toggle favorite
    toggleFavorite(destinationId, destinationData = null) {
        // Prevent duplicate rapid clicks
        if (this._toggleInProgress[destinationId]) {
            console.warn(`[Favorites] Toggle already in progress for ${destinationId}, ignoring duplicate call`);
            return false;
        }
        
        if (!AuthManager.isAuthenticated()) {
            if (typeof AuthModal !== 'undefined') {
                AuthModal.show();
            } else {
                alert('Debes iniciar sesión para guardar favoritos');
            }
            return false;
        }
        
        // Mark toggle as in progress
        this._toggleInProgress[destinationId] = true;
        
        let favorites = this.getUserFavorites();
        const wasAlreadyFavorite = favorites.includes(destinationId);
        
        console.log(`[Favorites] Toggle for ${destinationId}. Was favorite: ${wasAlreadyFavorite}`);
        console.log('[Favorites] Current favorites:', favorites);
        
        if (wasAlreadyFavorite) {
            // Remove from favorites
            favorites = favorites.filter(id => id !== destinationId);
            console.log('[Favorites] Removed from favorites. New list:', favorites);
            this.showNotification('Eliminado de favoritos', 'info');
        } else {
            // Add to favorites (check if already in array to avoid duplicates)
            if (!favorites.includes(destinationId)) {
                favorites.push(destinationId);
                console.log('[Favorites] Added to favorites. New list:', favorites);
            } else {
                console.warn('[Favorites] Destination already in favorites array!');
            }
            
            // Save destination data for later retrieval
            if (destinationData) {
                this.saveFavoriteData(destinationId, destinationData);
            }
            
            this.showNotification('Añadido a favoritos ❤️', 'success');
        }
        
        this.saveUserFavorites(favorites);
        
        // Update UI with the NEW state (opposite of what it was)
        const isNowFavorite = !wasAlreadyFavorite;
        this.updateFavoriteButton(destinationId, isNowFavorite);
        this.updateFavoritesCount();
        
        console.log(`[Favorites] Final state for ${destinationId}: ${isNowFavorite ? 'IS favorite' : 'NOT favorite'}`);
        
        // Clear the toggle in progress flag after a short delay
        setTimeout(() => {
            delete this._toggleInProgress[destinationId];
        }, 300);
        
        return true;
    },
    
    // Save favorite destination data
    saveFavoriteData(destinationId, data) {
        const favoritesData = JSON.parse(localStorage.getItem('favoritesData') || '{}');
        favoritesData[destinationId] = data;
        localStorage.setItem('favoritesData', JSON.stringify(favoritesData));
    },
    
    // Get favorite destination data
    getFavoriteData(destinationId) {
        const favoritesData = JSON.parse(localStorage.getItem('favoritesData') || '{}');
        return favoritesData[destinationId] || null;
    },
    
    // Update favorite button UI
    updateFavoriteButton(destinationId, isFavorite) {
        console.log(`[Favorites] updateFavoriteButton(${destinationId}, ${isFavorite})`);
        
        // Update all favorite buttons with this destination ID
        const buttons = document.querySelectorAll(`[data-destination-id="${destinationId}"]`);
        console.log(`[Favorites] Found ${buttons.length} elements with data-destination-id="${destinationId}"`);
        
        buttons.forEach(button => {
            // Check if it's a favorite button (not the card itself)
            if (button.classList.contains('destination-card__favorite') || 
                button.classList.contains('btn-icon') ||
                button.classList.contains('btn-icon-round') ||
                button.classList.contains('tooltip-favorite-btn') ||
                button.id === 'favorite-btn' ||
                button.id === 'map-info-favorite') {
                
                console.log(`[Favorites] Updating button:`, button.className || button.id);
                
                // Find icon element or use button itself
                const icon = button.querySelector('.icon');
                if (icon) {
                    icon.textContent = isFavorite ? '❤️' : '🤍';
                } else {
                    // Button contains emoji directly
                    button.textContent = isFavorite ? '❤️' : '🤍';
                }
                
                button.setAttribute('aria-label', isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos');
                button.setAttribute('title', isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos');
                
                // Add animation
                if (isFavorite) {
                    button.classList.add('heartbeat');
                    setTimeout(() => button.classList.remove('heartbeat'), 300);
                }
            }
        });
    },
    
    // Update favorites count in header
    updateFavoritesCount() {
        const count = this.getUserFavorites().length;
        const countElements = document.querySelectorAll('#favorites-count');
        countElements.forEach(el => el.textContent = count);
        
        // Update heart icon in header
        const heartIcons = document.querySelectorAll('.icon-heart');
        heartIcons.forEach(icon => {
            icon.textContent = count > 0 ? '❤️' : '🤍';
        });
    },
    
    // Show notification
    showNotification(message, type = 'info') {
        // Try to use existing notification system
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            // Fallback to alert
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    },
    
    // Initialize favorites
    init() {
        this.updateFavoritesCount();
    }
};

// Initialize on page load
if (typeof AuthManager !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            FavoritesManager.init();
        }, 150);
    });
}
