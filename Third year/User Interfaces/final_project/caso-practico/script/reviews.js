/* ===================================
   Reviews - Sistema de Reseñas
   =================================== */

const ReviewsManager = {
    // Get all reviews for a destination
    getDestinationReviews(destinationId) {
        const reviews = JSON.parse(localStorage.getItem('destinationReviews') || '{}');
        return reviews[destinationId] || [];
    },
    
    // Get all reviews by user
    getUserReviews(userEmail) {
        console.log('getUserReviews called for:', userEmail);
        const allReviews = JSON.parse(localStorage.getItem('destinationReviews') || '{}');
        console.log('All reviews in localStorage:', allReviews);
        
        const userReviews = [];
        
        Object.keys(allReviews).forEach(destinationId => {
            const destReviews = allReviews[destinationId];
            destReviews.forEach(review => {
                if (review.userEmail === userEmail) {
                    userReviews.push({
                        ...review,
                        destinationId: destinationId
                    });
                }
            });
        });
        
        console.log('User reviews found:', userReviews.length);
        return userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    
    // Add a review
    addReview(destinationId, destinationName, rating, comment) {
        console.log('addReview called:', { destinationId, destinationName, rating, comment });
        
        if (!AuthManager.isAuthenticated()) {
            console.warn('User not authenticated');
            if (typeof AuthModal !== 'undefined') {
                AuthModal.show();
            } else {
                alert('Debes iniciar sesión para escribir reseñas');
            }
            return false;
        }
        
        const user = AuthManager.getCurrentUser();
        console.log('Current user:', user);
        
        const reviews = JSON.parse(localStorage.getItem('destinationReviews') || '{}');
        console.log('Existing reviews:', reviews);
        
        if (!reviews[destinationId]) {
            reviews[destinationId] = [];
        }
        
        // Check if user already reviewed this destination
        const existingReview = reviews[destinationId].find(r => r.userEmail === user.email);
        if (existingReview) {
            alert('Ya has escrito una reseña para este destino. Puedes editarla desde tu perfil.');
            return false;
        }
        
        const newReview = {
            id: 'REV' + Date.now(),
            userEmail: user.email,
            username: user.username,
            destinationName: destinationName,
            rating: rating,
            comment: comment,
            createdAt: new Date().toISOString()
        };
        
        console.log('Saving new review:', newReview);
        reviews[destinationId].push(newReview);
        localStorage.setItem('destinationReviews', JSON.stringify(reviews));
        
        console.log('Review saved successfully');
        this.showNotification('¡Reseña publicada correctamente!', 'success');
        return true;
    },
    
    // Update a review
    updateReview(destinationId, reviewId, rating, comment) {
        const reviews = JSON.parse(localStorage.getItem('destinationReviews') || '{}');
        
        if (reviews[destinationId]) {
            const reviewIndex = reviews[destinationId].findIndex(r => r.id === reviewId);
            if (reviewIndex !== -1) {
                reviews[destinationId][reviewIndex].rating = rating;
                reviews[destinationId][reviewIndex].comment = comment;
                reviews[destinationId][reviewIndex].updatedAt = new Date().toISOString();
                
                localStorage.setItem('destinationReviews', JSON.stringify(reviews));
                this.showNotification('Reseña actualizada', 'success');
                return true;
            }
        }
        
        return false;
    },
    
    // Delete a review
    deleteReview(destinationId, reviewId) {
        const reviews = JSON.parse(localStorage.getItem('destinationReviews') || '{}');
        
        if (reviews[destinationId]) {
            reviews[destinationId] = reviews[destinationId].filter(r => r.id !== reviewId);
            localStorage.setItem('destinationReviews', JSON.stringify(reviews));
            this.showNotification('Reseña eliminada', 'info');
            return true;
        }
        
        return false;
    },
    
    // Get average rating for a destination
    getAverageRating(destinationId) {
        const reviews = this.getDestinationReviews(destinationId);
        if (reviews.length === 0) return 0;
        
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    },
    
    // Show notification
    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
};

// Initialize and add test data if empty (for development)
if (typeof AuthManager !== 'undefined') {
    console.log('ReviewsManager loaded');
    
    // Add test reviews if localStorage is empty (only for development/testing)
    const existingReviews = localStorage.getItem('destinationReviews');
    if (!existingReviews || existingReviews === '{}') {
        console.log('No reviews found in localStorage. You can add reviews by:');
        console.log('1. Completing a booking and marking it as past');
        console.log('2. Clicking "✍️ Escribir reseña" on a past trip');
        console.log('3. Or use this test command in console: ReviewsManager.addReview("paris-francia", "París", 5, "¡Increíble ciudad!")');
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.ReviewsManager = ReviewsManager;
}
