/* ===================================
   Main - Inicialización principal
   =================================== */

// Initialize application
$(document).ready(function() {
    console.log('🧭 Nomad Trails initialized');
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize filters
    initFilters();
    
    // Initialize scroll effects
    initScrollEffects();
    
    // Check for stored user session
    checkUserSession();
});

// Mobile menu toggle
function initMobileMenu() {
    const $menuToggle = $('.header__menu-toggle');
    const $nav = $('.header__nav');
    
    $menuToggle.on('click', function() {
        const isExpanded = $(this).attr('aria-expanded') === 'true';
        
        $(this).attr('aria-expanded', !isExpanded);
        $nav.toggleClass('active');
        
        // Animate hamburger icon
        $(this).toggleClass('active');
    });
    
    // Close menu when clicking nav links
    $('.nav__link').on('click', function() {
        $nav.removeClass('active');
        $menuToggle.attr('aria-expanded', 'false').removeClass('active');
    });
}

// Initialize filters
function initFilters() {
    $('.filter-chip').on('click', function() {
        const filter = $(this).data('filter');
        
        // Update active state
        $('.filter-chip').removeClass('filter-chip--active');
        $(this).addClass('filter-chip--active');
        
        // Apply filter (placeholder for now)
        console.log('Filter applied:', filter);
        
        if (filter === 'all') {
            filterDestinations('');
        } else {
            // Filter by continent or type
            filterDestinations(filter);
        }
    });
}

// Initialize scroll effects
function initScrollEffects() {
    let lastScroll = 0;
    const $header = $('.header');
    
    $(window).on('scroll', function() {
        const currentScroll = $(this).scrollTop();
        
        // Hide/show header on scroll
        if (currentScroll > lastScroll && currentScroll > 100) {
            $header.css('transform', 'translateY(-100%)');
        } else {
            $header.css('transform', 'translateY(0)');
        }
        
        lastScroll = currentScroll;
        
        // Add shadow when scrolled
        if (currentScroll > 10) {
            $header.css('box-shadow', 'var(--shadow-md)');
        } else {
            $header.css('box-shadow', 'var(--shadow-sm)');
        }
    });
    
    // Add smooth transition to header
    $header.css('transition', 'transform 0.3s ease, box-shadow 0.3s ease');
}

// Check user session - Now handled by auth.js
function checkUserSession() {
    // Session management is now handled by AuthManager in auth.js
    // This function is kept for compatibility but does nothing
}

// Smooth scroll to sections
$('a[href^="#"]').on('click', function(e) {
    const target = $(this).attr('href');
    
    if (target !== '#' && $(target).length) {
        e.preventDefault();
        
        $('html, body').animate({
            scrollTop: $(target).offset().top - 80
        }, 500);
    }
});

// Log welcome message
console.log(`
╔═══════════════════════════════════╗
║                                   ║
║        🧭 NOMAD TRAILS 🗺️        ║
║                                   ║
║    Tu próxima aventura            ║
║    comienza aquí                  ║
║                                   ║
╚═══════════════════════════════════╝
`);
