/* ===================================
   Community Page - JavaScript
   =================================== */

// Sample posts data (will be stored in localStorage)
let communityPosts = [];
let currentUser = {
    name: 'Usuario',
    avatar: '👤'
};

// Update current user from auth
function updateCurrentUser() {
    if (typeof AuthManager !== 'undefined') {
        const user = AuthManager.getCurrentUser();
        if (user) {
            currentUser = {
                name: user.name || user.email.split('@')[0],
                avatar: user.avatar || '👤',
                email: user.email
            };
            console.log('Current user loaded:', currentUser);
        }
    }
}

// Initialize page
$(document).ready(function() {
    console.log('Community page initialized');
    updateCurrentUser();
    
    // Load destinations for filters
    if (typeof window.ensureDestinationsLoaded === 'function') {
        window.ensureDestinationsLoaded().then(() => {
            populateDestinationFilters();
            loadPosts();
            initializePage();
        });
    } else {
        setTimeout(() => {
            populateDestinationFilters();
            loadPosts();
            initializePage();
        }, 500);
    }
});

document.addEventListener('languageChanged', function() {
    populateDestinationFilters();
    loadPosts();
    initializePage();
    // Fix header "Iniciar Sesión" overriding username after i18n refresh
    if (typeof AuthManager !== 'undefined') {
        AuthManager.updateUIForAllPages();
    }
});

// Initialize page functionality
function initializePage() {
    // Create post button
    $('#create-post-btn').on('click', function() {
        if (typeof AuthManager !== 'undefined') {
            AuthManager.requireAuth(openCreatePostModal);
        } else {
            openCreatePostModal();
        }
    });
    
    // Modal controls
    $('#close-modal-btn, .modal__overlay, #cancel-post-btn').on('click', closeCreatePostModal);
    
    // Prevent modal close when clicking inside
    $('.modal__content').on('click', function(e) {
        e.stopPropagation();
    });
    
    // Form submission
    $('#create-post-form').on('submit', handlePostSubmit);
    
    // Rating stars
    $('.rating-star').on('click', handleRatingClick);
    
    // Character counter
    $('#post-description').on('input', updateCharCounter);
    
    // Filters
    $('#filter-destination, #filter-sort').on('change', filterAndSortPosts);
}

// Populate destination filters
function populateDestinationFilters() {
    const $filterSelect = $('#filter-destination');
    const $postSelect = $('#post-destination');
    
    // Clear existing options (except "all")
    $filterSelect.find('option:not(:first)').remove();
    $postSelect.find('option:not(:first)').remove();
    
    // Add destinations
    allDestinations.forEach(destination => {
        const optionHtml = `<option value="${destination.id}">${currentLanguage === 'es' ? destination.name : destination.enname}, ${currentLanguage === 'es' ? destination.country : destination.encountry}</option>`;
        $filterSelect.append(optionHtml);
        $postSelect.append(optionHtml);
    });
}

// Load posts from localStorage
function loadPosts() {
    const storedPosts = localStorage.getItem('communityPosts');
    if (storedPosts) {
        communityPosts = JSON.parse(storedPosts);
    } else {
        // Generate sample posts
        generateSamplePosts();
    }
    
    renderPosts();
}

// Generate sample posts
function generateSamplePosts() {
    const sampleUsers = [
        { name: 'María García', avatar: '👩' },
        { name: 'Juan Pérez', avatar: '👨' },
        { name: 'Ana López', avatar: '👩‍🦰' },
        { name: 'Carlos Ruiz', avatar: '👨‍🦱' },
        { name: 'Laura Martín', avatar: '👱‍♀️' }
    ];
    
    const sampleDescriptions = [
        'Una experiencia inolvidable. La ciudad superó todas mis expectativas. La gente es muy amable y la comida deliciosa.',
        'Lugares impresionantes y cultura fascinante. Definitivamente volveré. ¡Altamente recomendado!',
        'Perfecto para unas vacaciones relajantes. Las vistas son espectaculares y el clima ideal.',
        'Rica historia y arquitectura impresionante. Cada rincón tiene algo especial que ofrecer.',
        'Increíble aventura, volveré sin duda. Una experiencia que recordaré por siempre.'
    ];
    
    // Create 10 sample posts
    for (let i = 0; i < 10; i++) {
        const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
        const randomDestination = allDestinations[Math.floor(Math.random() * allDestinations.length)];
        const randomDescription = sampleDescriptions[Math.floor(Math.random() * sampleDescriptions.length)];
        const randomRating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
        const randomDaysAgo = Math.floor(Math.random() * 30);
        
        // Get image URL correctly
        let imageUrl = '';
        if (randomDestination.image) {
            if (typeof randomDestination.image === 'object' && randomDestination.image.url) {
                imageUrl = randomDestination.image.url;
            } else if (typeof randomDestination.image === 'string') {
                imageUrl = randomDestination.image;
            }
        }
        
        communityPosts.push({
            id: Date.now() + i,
            user: randomUser,
            destination: {
                id: randomDestination.id,
                name: currentLanguage === 'es' ? randomDestination.name : randomDestination.enname,
                country: currentLanguage === 'es' ? randomDestination.country : randomDestination.encountry
            },
            rating: randomRating,
            description: randomDescription,
            image: imageUrl,
            date: new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000).toISOString(),
            likes: Math.floor(Math.random() * 50),
            comments: Math.floor(Math.random() * 20),
            likedByUser: false
        });
    }
    
    savePosts();
}

// Save posts to localStorage
function savePosts() {
    localStorage.setItem('communityPosts', JSON.stringify(communityPosts));
}

// Render posts
function renderPosts() {
    const $feed = $('#posts-feed');
    const $loadingState = $('#loading-state');
    const $emptyState = $('#empty-state');

    $loadingState.attr('hidden', true);

    if (communityPosts.length === 0) {
        $feed.empty();
        $emptyState.removeAttr('hidden');
        return;
    }
    
    $emptyState.attr('hidden', true);

    const html = communityPosts.map(post => createPostCard(post)).join('');
    $feed.html(html);
    
    // Attach event listeners
    attachPostEvents();
}

// Create post card HTML
function createPostCard(post) {
    const timeAgo = getTimeAgo(post.date);
    const stars = '★'.repeat(post.rating) + '☆'.repeat(5 - post.rating);
    const dest = allDestinations.find(d => d.id === post.destination.id);
    
    return `
        <article class="post-card" data-post-id="${post.id}">
            <div class="post-card__header">
                <div class="post-card__avatar">${post.user.avatar}</div>
                <div class="post-card__user-info">
                    <div class="post-card__username">${post.user.name}</div>
                    <div class="post-card__date">${timeAgo}</div>
                </div>
                <div class="post-card__destination">
                    📍 ${currentLanguage === 'es' ? dest.name : dest.enname}, ${currentLanguage === 'es' ? dest.country : dest.encountry}
                </div>
            </div>
            
            ${post.image ? `<img src="${post.image}" alt="${currentLanguage === 'es' ? dest.name : dest.enname}" class="post-card__image">` : ''}
            
            <div class="post-card__body">
                <div class="post-card__rating">
                    ${Array.from({length: 5}, (_, i) => 
                        `<span class="post-card__rating-star ${i < post.rating ? '' : 'post-card__rating-star--empty'}">${i < post.rating ? '★' : '☆'}</span>`
                    ).join('')}

                </div>
                <p class="post-card__description">${post.description}</p>
            </div>
            
            <div class="post-card__footer">
                <button class="post-action post-action--like ${post.likedByUser ? 'post-action--liked' : ''}" data-post-id="${post.id}">
                    <span class="post-action__icon">${post.likedByUser ? '❤️' : '🤍'}</span>
                    <span class="post-action__count">${post.likes}</span>
                </button>
                <button class="post-action post-action--comment" data-post-id="${post.id}">
                    <span class="post-action__icon">💬</span>
                    <span class="post-action__count">${post.comments}</span>
                </button>
                <button class="post-action post-action--share" data-post-id="${post.id}">
                    <span class="post-action__icon">🔗</span>
                    <span class="post-action__text">${currentLanguage === 'es' ? 'Compartir' : 'Share'}</span>
                </button>
            </div>
        </article>
    `;
}

// Attach post event listeners
function attachPostEvents() {
    $('.post-action--like').on('click', handleLike);
    $('.post-action--comment').on('click', handleComment);
    $('.post-action--share').on('click', handleShare);
}

// Handle like
function handleLike(e) {
    if (typeof AuthManager !== 'undefined' && !AuthManager.isAuthenticated()) {
        AuthManager.requireAuth(() => handleLike(e));
        return;
    }
    
    const postId = parseInt($(e.currentTarget).data('post-id'));
    const post = communityPosts.find(p => p.id === postId);
    
    if (!post) return;
    
    post.likedByUser = !post.likedByUser;
    post.likes += post.likedByUser ? 1 : -1;
    
    savePosts();
    renderPosts();
}

// Handle comment
function handleComment(e) {
    const postId = parseInt($(e.currentTarget).data('post-id'));
    showToast('Función de comentarios próximamente', 'info');
}

// Handle share
function handleShare(e) {
    const postId = parseInt($(e.currentTarget).data('post-id'));
    const post = communityPosts.find(p => p.id === postId);
    
    if (!post) return;
    
    const shareText = currentLanguage === 'es' ? `¡Mira esta experiencia en ${post.destination.name}!` : `Check out this experience in ${post.destination.enname}!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Nomad Trails',
            text: shareText,
            url: window.location.href
        }).catch(() => {});
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            showToast(currentLanguage === 'es' ? 'Enlace copiado al portapapeles' : 'Link copied to clipboard', 'success');
        });
    }
}

// Get time ago string
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return currentLanguage === 'es' ? 'Hace un momento' : 'Just now';
    if (seconds < 3600) return currentLanguage === 'es' ? `Hace ${Math.floor(seconds / 60)} minutos` : `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return currentLanguage === 'es' ? `Hace ${Math.floor(seconds / 3600)} horas` : `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return currentLanguage === 'es' ? `Hace ${Math.floor(seconds / 86400)} días` : `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 2592000) return currentLanguage === 'es' ? `Hace ${Math.floor(seconds / 604800)} semanas` : `${Math.floor(seconds / 604800)} weeks ago`;
    return currentLanguage === 'es' ? `Hace ${Math.floor(seconds / 2592000)} meses` : `${Math.floor(seconds / 2592000)} months ago`;
}

// Open create post modal
function openCreatePostModal() {
    $('#create-post-modal').removeAttr('hidden');
    $('body').css('overflow', 'hidden');
}

// Close create post modal
function closeCreatePostModal() {
    $('#create-post-modal').attr('hidden', true);
    $('body').css('overflow', '');
    $('#create-post-form')[0].reset();
    $('#post-rating').val(0);
    $('.rating-star').removeClass('active').text('☆');
    updateCharCounter();
}

// Handle rating click
function handleRatingClick(e) {
    const rating = parseInt($(e.currentTarget).data('rating'));
    $('#post-rating').val(rating);
    
    $('.rating-star').each(function(index) {
        if (index < rating) {
            $(this).addClass('active').text('★');
        } else {
            $(this).removeClass('active').text('☆');
        }
    });
}

// Update character counter
function updateCharCounter() {
    const length = $('#post-description').val().length;
    $('#char-count').text(length);
}

// Handle post submission
function handlePostSubmit(e) {
    e.preventDefault();
    
    // Update current user to ensure we have the latest info
    updateCurrentUser();
    
    const destinationId = $('#post-destination').val();
    const rating = parseInt($('#post-rating').val());
    const description = $('#post-description').val();
    const imageUrl = $('#post-image').val();
    
    if (!destinationId) {
        showToast(currentLanguage === 'es' ? 'Por favor selecciona un destino' : 'Please select a destination', 'error');
        return;
    }
    
    const destination = allDestinations.find(d => d.id === destinationId);
    
    // Get image URL correctly
    let finalImageUrl = imageUrl;
    if (!finalImageUrl && destination.image) {
        if (typeof destination.image === 'object' && destination.image.url) {
            finalImageUrl = destination.image.url;
        } else if (typeof destination.image === 'string') {
            finalImageUrl = destination.image;
        }
    }
    
    const newPost = {
        id: Date.now(),
        user: currentUser,
        destination: {
            id: destination.id,
            name: destination.name,
            country: destination.country
        },
        rating: rating,
        description: description,
        image: finalImageUrl,
        date: new Date().toISOString(),
        likes: 0,
        comments: 0,
        likedByUser: false
    };
    
    console.log('Creating post with user:', currentUser);
    
    communityPosts.unshift(newPost);
    savePosts();
    
    // Also save as a review
    if (typeof ReviewsManager !== 'undefined') {
        console.log('Saving community post as review...');
        const reviewSaved = ReviewsManager.addReview(
            destination.id,
            `${destination.name}, ${destination.country}`,
            rating,
            description
        );
        console.log('Review saved from community post:', reviewSaved);
    } else {
        console.warn('ReviewsManager not available');
    }
    
    renderPosts();
    closeCreatePostModal();
    showToast('¡Publicación creada exitosamente!', 'success');
}

// Filter and sort posts
function filterAndSortPosts() {
    const destinationFilter = $('#filter-destination').val();
    const sortBy = $('#filter-sort').val();
    
    // Filter
    let filtered = [...communityPosts];
    if (destinationFilter !== 'all') {
        filtered = filtered.filter(post => post.destination.id === destinationFilter);
    }
    
    // Sort
    switch (sortBy) {
        case 'recent':
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'popular':
            filtered.sort((a, b) => b.likes - a.likes);
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
    }
    
    // Update display
    const originalPosts = [...communityPosts];
    communityPosts = filtered;
    renderPosts();
    communityPosts = originalPosts;
}

// Toast notification (reuse from other scripts)
function showToast(message, type = 'info') {
    const toast = $(`
        <div class="toast toast--${type}">
            <span>${message}</span>
        </div>
    `);
    
    $('body').append(toast);
    
    setTimeout(() => {
        toast.addClass('toast--show');
    }, 100);
    
    setTimeout(() => {
        toast.removeClass('toast--show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
