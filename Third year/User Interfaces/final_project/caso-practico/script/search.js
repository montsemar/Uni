/* ===================================
   Search - Funcionalidad de búsqueda
   =================================== */

let searchHistory = loadFromStorage('searchHistory', []);
let currentSuggestionIndex = -1;

// Initialize search
function initSearch() {
    const $searchInput = $('#search-input');
    const $searchClear = $('#search-clear');
    const $suggestions = $('#search-suggestions');
    
    // Debounced search function
    const debouncedSearch = debounce(handleSearch, 300);
    
    // Input event
    $searchInput.on('input', function() {
        const query = $(this).val();
        
        if (query.length > 0) {
            $searchClear.removeAttr('hidden');
            debouncedSearch(query);
        } else {
            $searchClear.attr('hidden', true);
            hideSuggestions();
            // Only filter in home page
            if (typeof filterDestinations === 'function') {
                filterDestinations('');
            }
        }
    });
    
    // Clear button
    $searchClear.on('click', function() {
        $searchInput.val('').focus();
        $(this).attr('hidden', true);
        hideSuggestions();
        // Only filter in home page
        if (typeof filterDestinations === 'function') {
            filterDestinations('');
        }
    });
    
    // Keyboard navigation
    $searchInput.on('keydown', function(e) {
        const $visibleSuggestions = $suggestions.find('.search-suggestion');
        
        if ($visibleSuggestions.length === 0) return;
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                currentSuggestionIndex = Math.min(currentSuggestionIndex + 1, $visibleSuggestions.length - 1);
                updateSuggestionHighlight($visibleSuggestions);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                currentSuggestionIndex = Math.max(currentSuggestionIndex - 1, -1);
                updateSuggestionHighlight($visibleSuggestions);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (currentSuggestionIndex >= 0) {
                    $visibleSuggestions.eq(currentSuggestionIndex).click();
                } else {
                    const query = $(this).val();
                    performSearch(query);
                }
                break;
                
            case 'Escape':
                hideSuggestions();
                break;
        }
    });
    
    // Click outside to close
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.search-box').length) {
            hideSuggestions();
        }
    });
    
    // Search icon click
    $('.search-box__icon').on('click', function() {
        const query = $searchInput.val().trim();
        if (query.length > 0) {
            performSearch(query);
        }
    });
}

// Handle search
function handleSearch(query) {
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    
    const suggestions = getSuggestions(query);
    displaySuggestions(suggestions);
    
    // Only filter in home page, not in results page
    // Results page will handle its own filtering
}

// Get suggestions
function getSuggestions(query) {
    const lowerQuery = query.toLowerCase();
    const matches = [];
    
    allDestinations.forEach(destination => {
        let score = 0;
        
        // Name match (highest priority)
        if (destination.name.toLowerCase().includes(lowerQuery)) {
            score += 10;
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
            matches.push({ ...destination, score });
        }
    });
    
    // Sort by score and return top 5
    return matches
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
}

// Display suggestions
function displaySuggestions(suggestions) {
    const $suggestions = $('#search-suggestions');
    
    if (suggestions.length === 0) {
        hideSuggestions();
        return;
    }
    
    const html = suggestions.map(suggestion => `
        <li 
            class="search-suggestion" 
            role="option" 
            data-destination-id="${suggestion.id}"
            tabindex="-1"
        >
            <div class="search-suggestion__name">${sanitizeHTML(suggestion.name)}</div>
            <div class="search-suggestion__location">${sanitizeHTML(suggestion.country)}, ${sanitizeHTML(suggestion.continent)}</div>
        </li>
    `).join('');
    
    $suggestions.html(html).removeAttr('hidden');
    $('#search-input').attr('aria-expanded', 'true');
    
    // Attach click events
    $('.search-suggestion').on('click', function() {
        const destinationId = $(this).data('destination-id');
        const destination = allDestinations.find(d => d.id === destinationId);
        if (destination) {
            performSearch(destination.name);
        }
    });
    
    currentSuggestionIndex = -1;
}

// Hide suggestions
function hideSuggestions() {
    $('#search-suggestions').attr('hidden', true).empty();
    $('#search-input').attr('aria-expanded', 'false');
    currentSuggestionIndex = -1;
}

// Update suggestion highlight
function updateSuggestionHighlight($suggestions) {
    $suggestions.removeAttr('aria-selected');
    
    if (currentSuggestionIndex >= 0) {
        const $current = $suggestions.eq(currentSuggestionIndex);
        $current.attr('aria-selected', 'true');
        $current[0].scrollIntoView({ block: 'nearest' });
    }
}

// Perform search - redirect to results page
function performSearch(query) {
    if (!query || query.trim() === '') return;
    
    // Add to search history
    addToSearchHistory(query);
    
    // Redirect to results page with query parameter
    window.location.href = `results.html?q=${encodeURIComponent(query)}`;
}

// Add to search history
function addToSearchHistory(query) {
    if (!query || query.trim() === '') return;
    
    // Remove duplicates
    searchHistory = searchHistory.filter(item => 
        item.toLowerCase() !== query.toLowerCase()
    );
    
    // Add to beginning
    searchHistory.unshift(query);
    
    // Keep only last 10
    searchHistory = searchHistory.slice(0, 10);
    
    // Save to storage
    saveToStorage('searchHistory', searchHistory);
}

// Initialize
$(document).ready(function() {
    initSearch();
});
