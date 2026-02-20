/* ===================================
   Results Page - Funcionalidad
   =================================== */

let currentResults = [];
let filteredResults = [];
let currentPage = 1;
const resultsPerPage = 9;
let currentFilters = {
    priceMin: 0,
    priceMax: 3000,
    sortBy: 'relevance',
    continent: 'all'
};

// Initialize results page
$(document).ready(function() {
    // Get query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    if (query) {
        $('#search-input').val(query);
        loadSearchResults(query);
    } else {
        // No query, redirect to home
        window.location.href = 'index.html';
    }
    
    // Initialize filters
    initResultsFilters();
});

// Load search results
async function loadSearchResults(query) {
    // Wait for destinations to load
    if (allDestinations.length === 0) {
        setTimeout(() => loadSearchResults(query), 100);
        return;
    }
    
    // Search destinations
    currentResults = searchDestinations(query);
    filteredResults = [...currentResults];
    
    // Update UI
    updateResultsTitle(query);
    updateResultsCount();
    applyFilters();
    renderResults();
}

// Search destinations
function searchDestinations(query) {
    const lowerQuery = query.toLowerCase();
    const results = [];
    
    allDestinations.forEach(destination => {
        let score = 0;
        
        // Name match (highest priority)
        if (destination.name.toLowerCase().includes(lowerQuery)) {
            score += 10;
        }
        
        // Exact name match
        if (destination.name.toLowerCase() === lowerQuery) {
            score += 20;
        }
        
        // Country match
        if (destination.country.toLowerCase().includes(lowerQuery)) {
            score += 5;
        }
        
        // Continent match
        if (destination.continent.toLowerCase().includes(lowerQuery)) {
            score += 3;
        }
        
        // Description match
        if (destination.description.toLowerCase().includes(lowerQuery)) {
            score += 1;
        }
        
        if (score > 0) {
            results.push({ ...destination, searchScore: score });
        }
    });
    
    // Sort by score
    return results.sort((a, b) => b.searchScore - a.searchScore);
}

// Update results title
function updateResultsTitle(query) {
    const $title = $('#results-title');
    const titleText = currentLanguage === 'es' 
        ? `Resultados para "${query}"` 
        : `Results for "${query}"`;
    $title.html(`<span>${sanitizeHTML(titleText)}</span>`);
}

// Update results count
function updateResultsCount() {
    const $count = $('#results-count');
    const count = filteredResults.length;
    
    if (count === 0) {
        const text = currentLanguage === 'es' 
            ? 'No se encontraron resultados' 
            : 'No results found';
        $count.html(`<span class="results-count__empty">${text}</span>`);
    } else {
        const text = currentLanguage === 'es' 
            ? `${count} destino${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}` 
            : `${count} destination${count !== 1 ? 's' : ''} found`;
        $count.html(`<span class="results-count__number">${text}</span>`);
    }
}

// Initialize filters
function initResultsFilters() {
    // Price range
    $('#price-min, #price-max').on('input', function() {
        const minPrice = parseInt($('#price-min').val());
        const maxPrice = parseInt($('#price-max').val());
        
        // Ensure min is not greater than max
        if (minPrice > maxPrice) {
            if (this.id === 'price-min') {
                $('#price-min').val(maxPrice);
            } else {
                $('#price-max').val(minPrice);
            }
        }
        
        currentFilters.priceMin = parseInt($('#price-min').val());
        currentFilters.priceMax = parseInt($('#price-max').val());
        
        $('#price-min-label').text(formatPrice(currentFilters.priceMin));
        $('#price-max-label').text(formatPrice(currentFilters.priceMax));
        
        applyFilters();
    });
    
    // Sort
    $('#sort-select').on('change', function() {
        currentFilters.sortBy = $(this).val();
        applyFilters();
    });
    
    // Continent filters
    $('.filter-chip').on('click', function() {
        const filter = $(this).data('filter');
        
        $('.filter-chip').removeClass('filter-chip--active');
        $(this).addClass('filter-chip--active');
        
        currentFilters.continent = filter;
        applyFilters();
    });
    
    // Clear filters
    $('#clear-filters').on('click', function() {
        currentFilters = {
            priceMin: 0,
            priceMax: 3000,
            sortBy: 'relevance',
            continent: 'all'
        };
        
        $('#price-min').val(0);
        $('#price-max').val(3000);
        $('#price-min-label').text('$0');
        $('#price-max-label').text('$3000');
        $('#sort-select').val('relevance');
        
        $('.filter-chip').removeClass('filter-chip--active');
        $('.filter-chip[data-filter="all"]').addClass('filter-chip--active');
        
        applyFilters();
        showToast('Filtros eliminados', 'info');
    });
}

// Apply filters
function applyFilters() {
    filteredResults = [...currentResults];
    
    // Filter by price
    filteredResults = filteredResults.filter(d => 
        d.price >= currentFilters.priceMin && d.price <= currentFilters.priceMax
    );
    
    // Filter by continent
    if (currentFilters.continent !== 'all') {
        filteredResults = filteredResults.filter(d => 
            d.continent === currentFilters.continent
        );
    }
    
    // Sort
    switch (currentFilters.sortBy) {
        case 'price-asc':
            filteredResults.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredResults.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredResults.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'relevance':
        default:
            filteredResults.sort((a, b) => b.searchScore - a.searchScore);
            break;
    }
    
    // Reset to page 1
    currentPage = 1;
    
    updateResultsCount();
    renderResults();
}

// Render results
function renderResults() {
    const $grid = $('#results-grid');
    
    if (filteredResults.length === 0) {
        $grid.html(`
            <div class="no-results">
                <div class="no-results__icon">🔍</div>
                <h3 class="no-results__title">${currentLanguage === 'es' ? 'No se encontraron resultados' : 'No results found'}</h3>
                <p class="no-results__text">${currentLanguage === 'es' ? 'Intenta con otros términos de búsqueda o ajusta los filtros' : 'Try other search terms or adjust the filters'}</p>
                <a href="index.html" class="btn-primary">${currentLanguage === 'es' ? 'Volver al inicio' : 'Back to home'}</a>
            </div>
        `);
        $('#pagination').attr('hidden', true);
        return;
    }
    
    // Pagination
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);
    
    // Render cards
    const html = paginatedResults.map(destination => createDestinationCard(destination)).join('');
    $grid.html(html);
    
    // Attach events
    attachDestinationEvents();
    
    // Render pagination
    renderPagination();
}

// Render pagination
function renderPagination() {
    const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
    
    if (totalPages <= 1) {
        $('#pagination').attr('hidden', true);
        return;
    }
    
    $('#pagination').removeAttr('hidden');
    
    const $pages = $('#pagination-pages');
    const $prevBtn = $('#prev-page');
    const $nextBtn = $('#next-page');
    
    // Prev button
    if (currentPage === 1) {
        $prevBtn.prop('disabled', true).addClass('pagination__btn--disabled');
    } else {
        $prevBtn.prop('disabled', false).removeClass('pagination__btn--disabled');
    }
    
    // Next button
    if (currentPage === totalPages) {
        $nextBtn.prop('disabled', true).addClass('pagination__btn--disabled');
    } else {
        $nextBtn.prop('disabled', false).removeClass('pagination__btn--disabled');
    }
    
    // Page numbers
    let pagesHtml = '';
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    if (startPage > 1) {
        pagesHtml += `<button class="pagination__number" data-page="1">1</button>`;
        if (startPage > 2) {
            pagesHtml += `<span class="pagination__ellipsis">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'pagination__number--active' : '';
        pagesHtml += `<button class="pagination__number ${activeClass}" data-page="${i}">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pagesHtml += `<span class="pagination__ellipsis">...</span>`;
        }
        pagesHtml += `<button class="pagination__number" data-page="${totalPages}">${totalPages}</button>`;
    }
    
    $pages.html(pagesHtml);
    
    // Attach events
    $('.pagination__number').on('click', function() {
        const page = parseInt($(this).data('page'));
        goToPage(page);
    });
    
    $prevBtn.off('click').on('click', function() {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    });
    
    $nextBtn.off('click').on('click', function() {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    });
}

// Go to page
function goToPage(page) {
    currentPage = page;
    renderResults();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Add styles for results page
if (!document.getElementById('results-styles')) {
    const style = document.createElement('style');
    style.id = 'results-styles';
    style.textContent = `
        .search-bar-section {
            background: var(--color-surface);
            padding: var(--spacing-lg) 0;
            box-shadow: var(--shadow-sm);
            margin-bottom: var(--spacing-xl);
        }
        
        .search-box--results {
            max-width: 800px;
            margin: 0 auto var(--spacing-md);
        }
        
        .search-filters {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-sm);
            justify-content: center;
            margin-top: var(--spacing-md);
        }
        
        .results-main {
            padding: var(--spacing-xl) 0;
        }
        
        .results-header {
            margin-bottom: var(--spacing-xl);
        }
        
        .results-title {
            font-family: var(--font-display);
            font-size: clamp(1.75rem, 4vw, 2.5rem);
            font-weight: 700;
            color: var(--color-primary-dark);
            margin-bottom: var(--spacing-sm);
        }
        
        .results-count {
            font-size: 1.125rem;
            color: var(--color-text-muted);
        }
        
        .results-count__loading {
            opacity: 0.6;
        }
        
        .results-count__number {
            font-weight: 600;
            color: var(--color-primary);
        }
        
        .results-content {
            display: grid;
            grid-template-columns: 250px 1fr;
            gap: var(--spacing-xl);
        }
        
        .results-sidebar {
            position: sticky;
            top: 100px;
            height: fit-content;
            background: var(--color-surface);
            padding: var(--spacing-lg);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
        }
        
        .sidebar-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--color-text);
            margin-bottom: var(--spacing-md);
        }
        
        .filter-group {
            margin-bottom: var(--spacing-lg);
            padding-bottom: var(--spacing-lg);
            border-bottom: 1px solid var(--color-neutral-lighter);
        }
        
        .filter-group:last-of-type {
            border-bottom: none;
        }
        
        .filter-group__title {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--color-text-light);
            margin-bottom: var(--spacing-sm);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .price-range {
            position: relative;
            padding: var(--spacing-md) 0;
        }
        
        .price-slider {
            width: 100%;
            margin: var(--spacing-xs) 0;
            -webkit-appearance: none;
            height: 4px;
            background: var(--color-neutral-lighter);
            border-radius: var(--radius-full);
            outline: none;
        }
        
        .price-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            background: var(--color-primary);
            border-radius: 50%;
            cursor: pointer;
        }
        
        .price-slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: var(--color-primary);
            border-radius: 50%;
            cursor: pointer;
            border: none;
        }
        
        .price-labels {
            display: flex;
            justify-content: space-between;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--color-primary);
        }
        
        .sort-select {
            width: 100%;
            padding: var(--spacing-sm);
            border: 1px solid var(--color-neutral-lighter);
            border-radius: var(--radius-sm);
            font-size: 0.875rem;
            background: var(--color-surface);
            color: var(--color-text);
            cursor: pointer;
        }
        
        .sort-select:focus {
            outline: none;
            border-color: var(--color-primary);
        }
        
        .btn-clear-filters {
            width: 100%;
            padding: var(--spacing-sm);
            background: var(--color-bg-alt);
            color: var(--color-text);
            font-weight: 600;
            border-radius: var(--radius-sm);
            transition: var(--transition-base);
        }
        
        .btn-clear-filters:hover {
            background: var(--color-neutral-lighter);
        }
        
        .no-results {
            grid-column: 1 / -1;
            text-align: center;
            padding: var(--spacing-xxl);
        }
        
        .no-results__icon {
            font-size: 4rem;
            margin-bottom: var(--spacing-md);
            opacity: 0.5;
        }
        
        .no-results__title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--color-text);
            margin-bottom: var(--spacing-sm);
        }
        
        .no-results__text {
            color: var(--color-text-muted);
            margin-bottom: var(--spacing-lg);
        }
        
        .pagination {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-sm);
            margin-top: var(--spacing-xl);
        }
        
        .pagination__btn {
            padding: var(--spacing-sm) var(--spacing-md);
            background: var(--color-surface);
            border: 1px solid var(--color-neutral-lighter);
            border-radius: var(--radius-sm);
            font-weight: 600;
            color: var(--color-text);
            transition: var(--transition-base);
        }
        
        .pagination__btn:hover:not(:disabled) {
            background: var(--color-primary);
            color: white;
            border-color: var(--color-primary);
        }
        
        .pagination__btn--disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }
        
        .pagination__pages {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
        }
        
        .pagination__number {
            width: 40px;
            height: 40px;
            background: var(--color-surface);
            border: 1px solid var(--color-neutral-lighter);
            border-radius: var(--radius-sm);
            font-weight: 600;
            color: var(--color-text);
            transition: var(--transition-base);
        }
        
        .pagination__number:hover {
            background: var(--color-primary-light);
            color: white;
            border-color: var(--color-primary-light);
        }
        
        .pagination__number--active {
            background: var(--color-primary);
            color: white;
            border-color: var(--color-primary);
        }
        
        .pagination__ellipsis {
            padding: 0 var(--spacing-xs);
            color: var(--color-text-muted);
        }
        
        @media (max-width: 768px) {
            .results-content {
                grid-template-columns: 1fr;
            }
            
            .results-sidebar {
                position: static;
            }
            
            .search-filters {
                overflow-x: auto;
                justify-content: flex-start;
                padding-bottom: var(--spacing-xs);
            }
        }
        
        @media (max-width: 430px) {
            .pagination__btn span {
                display: none;
            }
            
            .pagination__btn {
                padding: var(--spacing-sm);
            }
            
            .pagination__number {
                width: 36px;
                height: 36px;
            }
        }
    `;
    document.head.appendChild(style);
}
