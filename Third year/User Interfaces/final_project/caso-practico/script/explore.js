/* ===================================
   Explore Page - Funcionalidad Avanzada
   =================================== */

let currentView = 'map';
let filteredExploreDestinations = [];
let selectedContinent = 'all';
let selectedDestination = null;
let mapScale = 1;
let mapTranslateX = 0;
let mapTranslateY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

// Coordenadas geográficas aproximadas en el mapa (basadas en proyección Mercator)
// Estas coordenadas se ajustarán a la imagen del mapamundi
const cityCoordinates = {
    // Europa (adjusted -50x, -50y to shift map southeast)
    'viena-austria': { x: 470, y: 130 },
    'brujas-belgica': { x: 450, y: 125 },
    'copenhague-dinamarca': { x: 465, y: 110 },
    'liubliana-eslovenia': { x: 475, y: 140 },
    'tallin-estonia': { x: 490, y: 100 },
    'helsinki-finlandia': { x: 495, y: 95 },
    'paris-francia': { x: 450, y: 135 },
    'atenas-grecia': { x: 490, y: 160 },
    'budapest-hungria': { x: 480, y: 135 },
    'reikiavik-islandia': { x: 410, y: 80 },
    'dublin-irlanda': { x: 425, y: 120 },
    'roma-italia': { x: 465, y: 155 },
    'riga-letonia': { x: 490, y: 105 },
    'vilna-lituania': { x: 490, y: 108 },
    'luxemburgo-luxemburgo': { x: 455, y: 133 },
    'la-valeta-malta': { x: 475, y: 170 },
    'oslo-noruega': { x: 462, y: 100 },
    'amsterdam-paises-bajos': { x: 452, y: 122 },
    'varsovia-polonia': { x: 482, y: 122 },
    'lisboa-portugal': { x: 425, y: 160 },
    'praga-republica-checa': { x: 475, y: 130 },
    'bucarest-rumania': { x: 495, y: 145 },
    'moscu-rusia': { x: 515, y: 110 },
    'belgrado-serbia': { x: 482, y: 145 },
    'bratislava-eslovaquia': { x: 477, y: 133 },
    'estocolmo-suecia': { x: 470, y: 100 },
    'berna-suiza': { x: 458, y: 138 },
    'kiev-ucrania': { x: 500, y: 130 },
    'londres-reino-unido': { x: 440, y: 122 },
    'barcelona-espana': { x: 452, y: 155 },
    'sevilla-espana': { x: 435, y: 165 },
    'florencia-italia': { x: 467, y: 150 },
    'venecia-italia': { x: 468, y: 142 },
    'bergen-noruega': { x: 457, y: 95 },
    'oporto-portugal': { x: 420, y: 155 },
    'edimburgo-reino-unido': { x: 438, y: 112 },
    'lucerna-suiza': { x: 460, y: 138 },
    'zurich-suiza': { x: 462, y: 136 },
    
    // Asia
    'phuket-tailandia': { x: 690, y: 220 },
    'bali-indonesia': { x: 725, y: 240 },
    'tokio-japon': { x: 770, y: 170 },
    'dubai-emiratos-arabes-unidos': { x: 580, y: 190 },
    'estambul-turquia': { x: 538, y: 155 },
    'singapur-singapur': { x: 700, y: 230 },
    'hong-kong-china': { x: 725, y: 190 },
    'seul-corea-del-sur': { x: 755, y: 165 },
    'beijing-china': { x: 725, y: 160 },
    'hanoi-vietnam': { x: 705, y: 205 },
    'manila-filipinas': { x: 750, y: 210 },
    'bombay-india': { x: 640, y: 205 },
    'katmandu-nepal': { x: 660, y: 192 },
    'male-maldivas': { x: 640, y: 230 },
    'colombo-sri-lanka': { x: 655, y: 220 },
    'teheran-iran': { x: 570, y: 170 },
    'jerusalem-israel': { x: 550, y: 175 },
    'beirut-libano': { x: 550, y: 172 },
    'kuala-lumpur-malasia': { x: 700, y: 230 },
    'mascate-oman': { x: 585, y: 195 },
    'doha-qatar': { x: 570, y: 192 },
    'riad-arabia-saudita': { x: 570, y: 192 },
    'bangkok-tailandia': { x: 695, y: 210 },
    'jaipur-india': { x: 650, y: 195 },
    'kioto-japon': { x: 765, y: 172 },
    'luang-prabang-laos': { x: 700, y: 202 },
    'chiang-mai-tailandia': { x: 690, y: 205 },
    
    // África
    'ciudad-del-cabo-sudafrica': { x: 500, y: 370 },
    'marrakech-marruecos': { x: 460, y: 215 },
    'el-cairo-egipto': { x: 530, y: 215 },
    'nairobi-kenia': { x: 545, y: 275 },
    'casablanca-marruecos': { x: 455, y: 212 },
    'tunez-tunez': { x: 492, y: 207 },
    'argel-argelia': { x: 480, y: 208 },
    'dakar-senegal': { x: 440, y: 250 },
    'accra-ghana': { x: 470, y: 265 },
    'lagos-nigeria': { x: 480, y: 265 },
    'adis-abeba-etiopia': { x: 545, y: 260 },
    'dar-es-salaam-tanzania': { x: 545, y: 285 },
    'kampala-uganda': { x: 535, y: 272 },
    'luanda-angola': { x: 505, y: 285 },
    'maputo-mozambique': { x: 535, y: 335 },
    'antananarivo-madagascar': { x: 565, y: 315 },
    'chefchaouen-marruecos': { x: 462, y: 212 },
    
    // América del Norte
    'nueva-york-estados-unidos': { x: 215, y: 155 },
    'san-francisco-estados-unidos': { x: 130, y: 165 },
    'los-angeles-estados-unidos': { x: 135, y: 172 },
    'chicago-estados-unidos': { x: 200, y: 155 },
    'miami-estados-unidos': { x: 220, y: 195 },
    'las-vegas-estados-unidos': { x: 145, y: 170 },
    'washington-estados-unidos': { x: 220, y: 160 },
    'seattle-estados-unidos': { x: 130, y: 135 },
    'boston-estados-unidos': { x: 225, y: 150 },
    'toronto-canada': { x: 215, y: 145 },
    'vancouver-canada': { x: 125, y: 135 },
    'montreal-canada': { x: 220, y: 140 },
    'ciudad-de-mexico-mexico': { x: 170, y: 205 },
    'cancun-mexico': { x: 200, y: 205 },
    'la-habana-cuba': { x: 220, y: 195 },
    'san-jose-costa-rica': { x: 195, y: 220 },
    'ciudad-de-panama-panama': { x: 215, y: 225 },
    'ciudad-de-quebec-canada': { x: 222, y: 138 },
    'san-miguel-de-allende-mexico': { x: 175, y: 205 },
    
    // América del Sur
    'buenos-aires-argentina': { x: 265, y: 360 },
    'rio-de-janeiro-brasil': { x: 290, y: 320 },
    'sao-paulo-brasil': { x: 285, y: 325 },
    'lima-peru': { x: 235, y: 290 },
    'santiago-chile': { x: 250, y: 355 },
    'bogota-colombia': { x: 240, y: 265 },
    'caracas-venezuela': { x: 255, y: 255 },
    'quito-ecuador': { x: 235, y: 265 },
    'la-paz-bolivia': { x: 255, y: 305 },
    'montevideo-uruguay': { x: 270, y: 360 },
    'asuncion-paraguay': { x: 270, y: 325 },
    'brasilia-brasil': { x: 285, y: 305 },
    'cartagena-colombia': { x: 242, y: 258 },
    'cuzco-peru': { x: 240, y: 295 },
    
    // Oceanía
    'sidney-australia': { x: 795, y: 345 },
    'melbourne-australia': { x: 785, y: 355 },
    'brisbane-australia': { x: 800, y: 325 },
    'perth-australia': { x: 735, y: 340 },
    'auckland-nueva-zelanda': { x: 850, y: 365 },
    'wellington-nueva-zelanda': { x: 855, y: 375 },
    'suva-fiyi': { x: 865, y: 295 },
    'papeete-polinesia-francesa': { x: 930, y: 295 },
    'queenstown-nueva-zelanda': { x: 857, y: 378 }
};

// City positions for individual destinations (will be calculated)
let cityPositions = {};

// Initialize explore page
$(document).ready(function() {
    console.log('Explore page initialized - Advanced version');

    // Load destinations
    if (typeof window.ensureDestinationsLoaded === 'function') {
        window.ensureDestinationsLoaded().then(() => {
            console.log('Destinations loaded for explore:', allDestinations?.length || 0);
            initExplore();
        }).catch(error => {
            console.error('Error loading destinations:', error);
            // Try to initialize anyway after a delay
            setTimeout(() => {
                if (typeof allDestinations !== 'undefined' && allDestinations.length > 0) {
                    initExplore();
                } else {
                    console.error('No destinations available');
                }
            }, 1000);
        });
    } else {
        console.warn('ensureDestinationsLoaded not found, waiting...');
        setTimeout(() => {
            if (typeof allDestinations !== 'undefined' && allDestinations.length > 0) {
                initExplore();
            } else {
                console.error('Destinations not loaded');
            }
        }, 1000);
    }
    document.addEventListener('languageChanged', function(e) {
        console.log('Language changed to:', e.detail.language);
        renderExploreGrid();
        AuthManager.updateUIForAllPages();
    });
});

// Initialize explore functionality
function initExplore() {
    if (typeof allDestinations === 'undefined' || !allDestinations || allDestinations.length === 0) {
        console.error('Cannot initialize explore: no destinations available');
        return;
    }
    
    filteredExploreDestinations = [...allDestinations];
    
    console.log('Initializing explore with', allDestinations.length, 'destinations');
    
    // Render city points on map
    renderCityPoints();
    
    // Render grid
    renderExploreGrid();
    
    // Initialize view toggles
    initViewToggles();
    
    // Initialize search
    initExploreSearch();
    
    // Initialize filters
    initContinentFilters();
    
    // Initialize sort
    initExploreSort();
    
    // Initialize map interactions
    initMapInteractions();
    
    // Initialize zoom controls
    initZoomControls();
    
    // Initialize pan/drag
    initMapPan();
    
    // Update statistics
    updateMapStatistics();
}

// Continent regions on the map (approximate boundaries) - Expanded for better distribution
const continentRegions = {
    'Europa': { minX: 470, maxX: 570, minY: 120, maxY: 230 },
    'Asia': { minX: 570, maxX: 820, minY: 90, maxY: 310 },
    'África': { minX: 430, maxX: 610, minY: 200, maxY: 400 },
    'América del Norte': { minX: 100, maxX: 330, minY: 100, maxY: 290 },
    'América del Sur': { minX: 190, maxX: 360, minY: 270, maxY: 430 },
    'Oceanía': { minX: 730, maxX: 920, minY: 290, maxY: 430 }
};

// Cache for generated positions
const generatedPositions = {};

// Get city position - generate if not exists
function getCityPosition(destination) {
    const destinationId = typeof destination === 'string' ? destination : destination.id;
    
    // Check cache first
    if (generatedPositions[destinationId]) {
        return generatedPositions[destinationId];
    }
    
    // Try to get from cityCoordinates
    if (cityCoordinates[destinationId]) {
        generatedPositions[destinationId] = cityCoordinates[destinationId];
        console.log(`✓ Using predefined coordinates for: ${destinationId}`);
        return cityCoordinates[destinationId];
    }
    
    console.log(`⚠ Generating random position for: ${destinationId}`);
    
    // Generate position based on continent
    const dest = typeof destination === 'string' 
        ? allDestinations.find(d => d.id === destinationId) 
        : destination;
    
    if (!dest) {
        console.warn(`Destination not found: ${destinationId}`);
        return null;
    }
    
    const region = continentRegions[dest.continent];
    if (!region) {
        console.warn(`No region found for continent: ${dest.continent}`);
        return null;
    }
    
    // Generate random position within continent region with better spacing
    // Try up to 10 times to find a position not too close to existing points
    let position;
    let attempts = 0;
    const minDistance = 15; // Minimum distance between points
    
    do {
        const x = region.minX + Math.random() * (region.maxX - region.minX);
        const y = region.minY + Math.random() * (region.maxY - region.minY);
        position = { x: Math.round(x), y: Math.round(y) };
        
        // Check if too close to existing points
        const tooClose = Object.values(generatedPositions).some(existingPos => {
            const dx = existingPos.x - position.x;
            const dy = existingPos.y - position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < minDistance;
        });
        
        if (!tooClose) break;
        attempts++;
    } while (attempts < 10);
    
    generatedPositions[destinationId] = position;
    
    return position;
}

// Render map points (continent indicators)
function renderMapPoints() {
    const $pointsContainer = $('#destination-points');
    $pointsContainer.empty();
    
    // Group destinations by continent
    const destinationsByContinent = {};
    allDestinations.forEach(destination => {
        if (!destinationsByContinent[destination.continent]) {
            destinationsByContinent[destination.continent] = [];
        }
        destinationsByContinent[destination.continent].push(destination);
    });
    
    // Create point for each continent
    Object.keys(destinationsByContinent).forEach(continent => {
        const position = continentPositions[continent];
        if (!position) return;
        
        const destinations = destinationsByContinent[continent];
        const count = destinations.length;
        
        // Calculate color intensity based on number of destinations
        const intensity = Math.min(count / 10, 1);
        const color = interpolateColor('#DAA520', '#D2691E', intensity);
        
        // Create group for continent
        const $group = $(`
            <g class="map-point-group" data-continent="${continent}">
                <!-- Outer pulse circle -->
                <circle 
                    class="map-point-pulse" 
                    cx="${position.x}" 
                    cy="${position.y}" 
                    r="12" 
                    fill="none"
                    stroke="${color}"
                    stroke-width="2"
                    opacity="0.6"
                />
                <!-- Inner pulse circle -->
                <circle 
                    class="map-point-pulse-2" 
                    cx="${position.x}" 
                    cy="${position.y}" 
                    r="12" 
                    fill="none"
                    stroke="${color}"
                    stroke-width="1.5"
                    opacity="0.4"
                />
                <!-- Main point -->
                <circle 
                    class="map-point" 
                    cx="${position.x}" 
                    cy="${position.y}" 
                    r="10" 
                    fill="${color}"
                    stroke="#8B4513"
                    stroke-width="2.5"
                    data-continent="${continent}"
                    style="cursor: pointer;"
                />
                <!-- Count badge -->
                <circle 
                    cx="${position.x + 12}" 
                    cy="${position.y - 12}" 
                    r="10" 
                    fill="#C97132"
                    stroke="white"
                    stroke-width="2"
                />
                <text 
                    x="${position.x + 12}" 
                    y="${position.y - 9}" 
                    text-anchor="middle" 
                    font-size="11" 
                    font-weight="bold" 
                    fill="white"
                >${count}</text>
                <!-- Label -->
                <text 
                    x="${position.x}" 
                    y="${position.y - 25}" 
                    text-anchor="middle" 
                    font-size="13" 
                    font-weight="bold" 
                    fill="#3E2723"
                    class="map-point-label"
                    style="text-shadow: 0 1px 3px rgba(255,255,255,0.9), 0 0 10px rgba(255,255,255,0.7);"
                >${continent}</text>
            </g>
        `);
        
        $pointsContainer.append($group);
    });
}

// Render individual city points
function renderCityPoints() {
    const $cityContainer = $('#city-points');
    if ($cityContainer.length === 0) {
        console.error('❌ City container #city-points not found!');
        return;
    }
    
    // Remove only city points, keep test points
    $cityContainer.find('.city-point-group').remove();
    
    console.log('Starting to render city points...');
    console.log('allDestinations available?', typeof allDestinations !== 'undefined');
    console.log('allDestinations length:', allDestinations ? allDestinations.length : 'undefined');
    
    if (typeof allDestinations === 'undefined' || !allDestinations || allDestinations.length === 0) {
        console.error('❌ allDestinations is not available or empty!');
        console.error('Window scope check:', typeof window.allDestinations);
        return;
    }
    
    let renderedCount = 0;
    let notFoundCount = 0;
    
    allDestinations.forEach(destination => {
        const position = getCityPosition(destination);
        if (!position) {
            notFoundCount++;
            console.warn(`No position for: ${destination.id} (${destination.name}, ${destination.continent})`);
            return;
        }
        console.log(`✅ Rendering ${destination.name} at (${position.x}, ${position.y})`);
        
        // Determine if destination is favorite
        const isFavorite = typeof FavoritesManager !== 'undefined' ? FavoritesManager.isFavorite(destination.id) : false;
        
        // Create city point with pin marker style - VERY VISIBLE
        const pointColor = isFavorite ? '#FF0000' : '#FF6B35';
        
        // Use proper SVG namespace for element creation
        const svgNS = "http://www.w3.org/2000/svg";
        const container = $cityContainer[0];
        
        // Create group
        const group = document.createElementNS(svgNS, 'g');
        group.setAttribute('class', 'city-point-group');
        group.setAttribute('data-destination-id', destination.id);
        group.setAttribute('data-continent', currentLanguage === 'es' ? destination.continent : destination.encontinent);
        
        // Pulse circle
        const pulseCircle = document.createElementNS(svgNS, 'circle');
        pulseCircle.setAttribute('class', 'city-pulse');
        pulseCircle.setAttribute('cx', position.x);
        pulseCircle.setAttribute('cy', position.y);
        pulseCircle.setAttribute('r', '15');
        pulseCircle.setAttribute('fill', pointColor);
        pulseCircle.setAttribute('opacity', '0.6');
        group.appendChild(pulseCircle);
        
        // Main point
        const mainCircle = document.createElementNS(svgNS, 'circle');
        mainCircle.setAttribute('class', 'city-point');
        mainCircle.setAttribute('cx', position.x);
        mainCircle.setAttribute('cy', position.y);
        mainCircle.setAttribute('r', '8');
        mainCircle.setAttribute('fill', pointColor);
        mainCircle.setAttribute('stroke', '#FFFFFF');
        mainCircle.setAttribute('stroke-width', '3');
        mainCircle.style.cursor = 'pointer';
        
        // Add click event to show info panel
        mainCircle.addEventListener('click', function() {
            showMapInfo(destination);
        });
        
        // Add hover events for tooltip
        mainCircle.addEventListener('mouseenter', function() {
            showQuickTooltip(destination, mainCircle);
        });
        
        mainCircle.addEventListener('mouseleave', function() {
            hideQuickTooltip();
        });
        
        group.appendChild(mainCircle);
        
        // Inner dot
        const innerDot = document.createElementNS(svgNS, 'circle');
        innerDot.setAttribute('cx', position.x);
        innerDot.setAttribute('cy', position.y);
        innerDot.setAttribute('r', '3');
        innerDot.setAttribute('fill', 'white');
        innerDot.style.pointerEvents = 'none';
        group.appendChild(innerDot);
        
        // Title for tooltip
        const title = document.createElementNS(svgNS, 'title');
        title.textContent = `${currentLanguage === 'es' ? destination.name : destination.enname}, ${currentLanguage === 'es' ? destination.country : destination.encountry}`;
        group.appendChild(title);
        
        container.appendChild(group);
        renderedCount++;
    });
    
    console.log(`✅ Rendered ${renderedCount} city points, ${notFoundCount} not found`);
}

// Initialize map interactions
function initMapInteractions() {
    // Click on city point
    $(document).on('click', '.city-point', function(e) {
        e.stopPropagation();
        const destinationId = $(this).data('destination-id');
        const destination = allDestinations.find(d => d.id === destinationId);
        
        if (destination) {
            showMapInfo(destination);
            highlightCityPoint(destinationId);
        }
    });
    
    // Hover effects on city points
    let tooltipHideTimeout;
    $(document).on('mouseenter', '.city-point', function() {
        // Show tooltip
        clearTimeout(tooltipHideTimeout);
        const destinationId = $(this).data('destination-id');
        const destination = allDestinations.find(d => d.id === destinationId);
        if (destination) {
            showQuickTooltip(destination, this);
        }
    }).on('mouseleave', '.city-point', function() {
        // Delay hiding to allow mouse to move to tooltip
        tooltipHideTimeout = setTimeout(() => {
            const $tooltip = $('#quick-tooltip');
            if (!$tooltip.is(':hover')) {
                hideQuickTooltip();
            }
        }, 100);
    });
    
    // Keep tooltip visible when hovering over it
    $(document).on('mouseenter', '#quick-tooltip', function() {
        clearTimeout(tooltipHideTimeout);
    }).on('mouseleave', '#quick-tooltip', function() {
        hideQuickTooltip();
    });
    
    // Handle favorite button in tooltip
    $(document).on('click', '.tooltip-favorite-btn', function(e) {
        e.stopPropagation();
        const destinationId = $(this).data('destination-id');
        const destination = allDestinations.find(d => d.id === destinationId);
        
        if (!destination) return;
        
        if (typeof FavoritesManager !== 'undefined') {
            FavoritesManager.toggleFavorite(destinationId, destination);
            renderCityPoints(); // Re-render to update favorite colors
            
            // Update the button in the tooltip
            const cityPoint = $(`.city-point[data-destination-id="${destinationId}"]`)[0];
            if (cityPoint) {
                showQuickTooltip(destination, cityPoint);
            }
            
            // Also update map info if it's showing this destination
            if (selectedDestination && selectedDestination.id === destinationId) {
                updateMapInfoFavoriteButton();
            }
        }
    });
    
    // Close map info
    $('#close-map-info').on('click', function() {
        $('#map-info').attr('hidden', true);
        selectedDestination = null;
        $('.city-point-group').removeClass('city-point--selected');
    });
    
    // View details from map info
    $(document).on('click', '#map-info-view', function() {
        if (selectedDestination) {
            window.location.href = `destination.html?id=${selectedDestination.id}`;
        }
    });
    
    // Add to favorites from map info popup
    $(document).on('click', '#map-info-favorite', function(e) {
        e.stopPropagation();
        console.log('Map info favorite button clicked');
        
        if (!selectedDestination) {
            console.warn('No destination selected');
            return;
        }
        
        if (typeof FavoritesManager === 'undefined') {
            console.error('FavoritesManager not loaded');
            return;
        }
        
        console.log('Toggling favorite for:', selectedDestination.id);
        FavoritesManager.toggleFavorite(selectedDestination.id, selectedDestination);
        updateMapInfoFavoriteButton();
        renderCityPoints(); // Re-render to update favorite colors
    });
}

// Show city points for a specific continent
function showCityPoints(continent) {
    if (continent === 'all') {
        $('.city-point-group').css('opacity', '1');
    } else {
        $('.city-point-group').css('opacity', '0.3');
        $(`.city-point-group[data-continent="${continent}"]`).css('opacity', '1');
    }
}

// Highlight specific city point
function highlightCityPoint(destinationId) {
    $('.city-point-group').removeClass('city-point--selected');
    
    const $cityGroup = $(`.city-point-group[data-destination-id="${destinationId}"]`);
    $cityGroup.addClass('city-point--selected');
    
    // Make the selected point larger and golden
    $cityGroup.find('.city-point').attr('r', 9).css('stroke', '#FFD700').css('stroke-width', '3');
}

// Show quick tooltip on hover
function showQuickTooltip(destination, element) {
    const $tooltip = $('#quick-tooltip');
    if ($tooltip.length === 0) {
        $('body').append(`
            <div id="quick-tooltip" style="
                position: fixed;
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 10px 12px;
                border-radius: 8px;
                font-size: 12px;
                pointer-events: auto;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                max-width: 220px;
            "></div>
        `);
    }
    
    const isFav = typeof FavoritesManager !== 'undefined' ? FavoritesManager.isFavorite(destination.id) : false;
    
    const rect = element.getBoundingClientRect();
    $('#quick-tooltip').html(`
        <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px;">
            <div style="flex: 1;">
                <strong>${sanitizeHTML(currentLanguage === 'es' ? destination.name : destination.enname)}</strong><br>
                <small>${sanitizeHTML(currentLanguage === 'es' ? destination.country : destination.encountry)}</small><br>
                <span style="color: #DAA520;">${formatPrice(destination.price)}</span>
            </div>
            <button 
                class="tooltip-favorite-btn" 
                data-destination-id="${destination.id}"
                style="
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 4px;
                    line-height: 1;
                    transition: transform 0.2s;
                    border-radius: 4px;
                "
                onmouseenter="this.style.transform='scale(1.2)'"
                onmouseleave="this.style.transform='scale(1)'"
                title="${isFav ? t('explore.removeFromFavorites') : t('explore.addToFavorites')}"
            >${isFav ? '❤️' : '🤍'}</button>
        </div>
    `).css({
        left: rect.left + rect.width / 2 + 'px',
        top: rect.top - 10 + 'px',
        transform: 'translate(-50%, -100%)',
        display: 'block'
    });
}

// Hide quick tooltip
function hideQuickTooltip() {
    $('#quick-tooltip').css('display', 'none');
}

// Highlight continent on map (now just shows/hides city points)
function highlightContinent(continent) {
    showCityPoints(continent);
}

// Show map info panel
function showMapInfo(destination) {
    selectedDestination = destination;
    
    $('#map-info-image').attr('src', destination.image.url).attr('alt', destination.image.alt);
    $('#map-info-title').text(currentLanguage === 'es' ? destination.name : destination.enname);
    $('#map-info-location').html(`📍 ${sanitizeHTML(currentLanguage === 'es' ? destination.country : destination.encountry)}, ${sanitizeHTML(currentLanguage === 'es' ? destination.continent : destination.encontinent)}`);
    $('#map-info-description').text(truncateText(currentLanguage === 'es' ? destination.description : destination.endescription, 120));
    $('#map-info-price').text(formatPrice(destination.price));
    
    updateMapInfoFavoriteButton();
    
    $('#map-info').removeAttr('hidden');
}

// Update favorite button in map info
function updateMapInfoFavoriteButton() {
    if (!selectedDestination) return;
    
    const isFav = typeof FavoritesManager !== 'undefined' ? FavoritesManager.isFavorite(selectedDestination.id) : false;
    const $btn = $('#map-info-favorite');
    
    if ($btn.length > 0) {
        $btn.html(isFav ? '❤️' : '🤍');
        const favText = isFav ? t('explore.removeFromFavorites') : t('explore.addToFavorites');
        $btn.attr('aria-label', favText);
        $btn.attr('title', favText);
    }
}

// Filter by continent
function filterByContinent(continent) {
    selectedContinent = continent;
    
    if (continent === 'all') {
        filteredExploreDestinations = [...allDestinations];
        showCityPoints('all');
    } else {
        filteredExploreDestinations = allDestinations.filter(d => d.continent === continent);
        showCityPoints(continent);
    }
    
    // Update grid view
    renderExploreGrid();
    
    // Update continent button active state
    $('.continent-btn').removeClass('continent-btn--active');
    $(`.continent-btn[data-continent="${continent}"]`).addClass('continent-btn--active');
    
    // Update statistics
    updateMapStatistics();
}

// Initialize zoom controls
function initZoomControls() {
    $('#zoom-in').on('click', function() {
        zoomMap(1.2);
    });
    
    $('#zoom-out').on('click', function() {
        zoomMap(0.8);
    });
    
    // Zoom with mouse wheel (zoom to cursor position)
    $('.map-container').on('wheel', function(e) {
        e.preventDefault();
        const delta = e.originalEvent.deltaY;
        const zoomFactor = delta > 0 ? 0.95 : 1.05;
        
        // Get mouse position relative to container
        const rect = this.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        zoomMapToPoint(zoomFactor, mouseX, mouseY);
    });
    
    // Hover effects on zoom buttons
    $('.zoom-btn').on('mouseenter', function() {
        $(this).find('circle').attr('opacity', '0.2');
    }).on('mouseleave', function() {
        $(this).find('circle').attr('opacity', '0');
    });
}

// Zoom map (simple zoom from center, used by buttons)
function zoomMap(factor) {
    const $container = $('.map-container');
    const centerX = $container.width() / 2;
    const centerY = $container.height() / 2;
    zoomMapToPoint(factor, centerX, centerY);
}

// Zoom map to specific point (zoom toward mouse cursor)
function zoomMapToPoint(factor, pointX, pointY) {
    const oldScale = mapScale;
    mapScale *= factor;
    mapScale = Math.max(0.5, Math.min(3, mapScale)); // Limit zoom between 0.5x and 3x
    
    // Calculate the actual scale change (in case we hit limits)
    const scaleChange = mapScale / oldScale;
    
    // Adjust translation to zoom toward the point
    // The point should stay in the same position relative to the viewport
    mapTranslateX = pointX - (pointX - mapTranslateX) * scaleChange;
    mapTranslateY = pointY - (pointY - mapTranslateY) * scaleChange;
    
    applyMapTransform();
}

// Initialize pan/drag functionality
function initMapPan() {
    const $container = $('.map-container');
    let lastTouchX = 0;
    let lastTouchY = 0;
    
    // Mouse drag
    $container.on('mousedown', function(e) {
        // Don't drag if clicking on interactive elements
        if ($(e.target).hasClass('city-point') || 
            $(e.target).closest('.zoom-btn').length > 0 ||
            $(e.target).closest('#map-info').length > 0) {
            return;
        }
        
        isDragging = true;
        dragStartX = e.clientX - mapTranslateX;
        dragStartY = e.clientY - mapTranslateY;
        $container.css('cursor', 'grabbing');
        e.preventDefault();
    });
    
    $(document).on('mousemove', function(e) {
        if (!isDragging) return;
        
        mapTranslateX = e.clientX - dragStartX;
        mapTranslateY = e.clientY - dragStartY;
        
        applyMapTransform();
    });
    
    $(document).on('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            $('.map-container').css('cursor', 'grab');
        }
    });
    
    // Touch support for mobile
    $container.on('touchstart', function(e) {
        if ($(e.target).hasClass('city-point') || 
            $(e.target).closest('.zoom-btn').length > 0) {
            return;
        }
        
        const touch = e.originalEvent.touches[0];
        isDragging = true;
        dragStartX = touch.clientX - mapTranslateX;
        dragStartY = touch.clientY - mapTranslateY;
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
    });
    
    $container.on('touchmove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const touch = e.originalEvent.touches[0];
        mapTranslateX = touch.clientX - dragStartX;
        mapTranslateY = touch.clientY - dragStartY;
        
        applyMapTransform();
    });
    
    $container.on('touchend', function() {
        isDragging = false;
    });
    
    $container.css('cursor', 'grab');
}

// Apply transform to map
function applyMapTransform() {
    // Apply same transform to both background and SVG overlay
    const transform = `translate(${mapTranslateX}px, ${mapTranslateY}px) scale(${mapScale})`;
    
    // Transform background image
    $('.map-background-image').css({
        'transform': transform,
        'transform-origin': '0 0',
        'transition': isDragging ? 'none' : 'transform 0.15s ease-out',
        'will-change': isDragging ? 'transform' : 'auto'
    });
    
    // Transform SVG container (for map position and zoom)
    $('#city-points').attr('transform', `translate(${mapTranslateX}, ${mapTranslateY}) scale(${mapScale})`);
    
    // Counter-scale the markers so they stay the same size
    // Apply the inverse scale directly to each marker without translating
    const markerScale = 1 / mapScale;
    $('.city-point-group').each(function() {
        const $group = $(this);
        // Simply scale the group without any translation
        // This keeps markers at their correct positions but prevents size change
        $group.attr('transform', `scale(${markerScale})`);
        $group.css('transform-box', 'fill-box');
        $group.css('transform-origin', 'center');
    });
}

// Update map statistics
function updateMapStatistics() {
    const totalDestinations = allDestinations.length;
    const filteredCount = filteredExploreDestinations.length;
    const continentCount = [...new Set(allDestinations.map(d => d.continent))].length;
    
    // Update or create stats panel
    let $stats = $('#map-stats');
    if ($stats.length === 0) {
        $('.map-container').append(`
            <div id="map-stats" class="map-stats">
                <div class="map-stat">
                    <span class="map-stat__icon">🌍</span>
                    <div>
                        <div class="map-stat__value" id="stat-destinations">0</div>
                        <div class="map-stat__label" data-i18n="explore.stats.destinations">Destinos</div>
                    </div>
                </div>
                <div class="map-stat">
                    <span class="map-stat__icon">📍</span>
                    <div>
                        <div class="map-stat__value" id="stat-continents">0</div>
                        <div class="map-stat__label" data-i18n="explore.stats.continents">Continentes</div>
                    </div>
                </div>
                <div class="map-stat">
                    <span class="map-stat__icon">⭐</span>
                    <div>
                        <div class="map-stat__value" id="stat-favorites">0</div>
                        <div class="map-stat__label" data-i18n="explore.stats.favorites">Favoritos</div>
                    </div>
                </div>
            </div>
        `); 
    }
    
    $('#stat-destinations').text(filteredCount);
    $('#stat-continents').text(continentCount);
    $('#stat-favorites').text(loadFromStorage('favorites', []).length);
}

// Interpolate between two colors
function interpolateColor(color1, color2, factor) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    
    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);
    
    return rgbToHex(r, g, b);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Truncate text helper
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Initialize view toggles
function initViewToggles() {
    $('.view-toggle').on('click', function() {
        const view = $(this).data('view');
        switchView(view);
    });
}

// Switch between map and grid view
function switchView(view) {
    currentView = view;
    
    $('.view-toggle').removeClass('view-toggle--active');
    $(`.view-toggle[data-view="${view}"]`).addClass('view-toggle--active');
    
    if (view === 'map') {
        $('#map-view').removeAttr('hidden');
        $('#grid-view').attr('hidden', true);
    } else {
        $('#map-view').attr('hidden', true);
        $('#grid-view').removeAttr('hidden');
    }
}

// Initialize explore search
function initExploreSearch() {
    const $searchInput = $('#explore-search-input');
    const debouncedSearch = debounce(handleExploreSearch, 300);
    
    $searchInput.on('input', function() {
        const query = $(this).val();
        debouncedSearch(query);
    });
}

// Handle explore search
function handleExploreSearch(query) {
    if (!query || query.trim() === '') {
        filteredExploreDestinations = [...allDestinations];
    } else {
        const lowerQuery = query.toLowerCase();
        filteredExploreDestinations = allDestinations.filter(d =>
            d.name.toLowerCase().includes(lowerQuery) ||
            d.country.toLowerCase().includes(lowerQuery) ||
            d.continent.toLowerCase().includes(lowerQuery) ||
            d.description.toLowerCase().includes(lowerQuery)
        );
    }
    
    // Apply continent filter if active
    if (selectedContinent !== 'all') {
        filteredExploreDestinations = filteredExploreDestinations.filter(d => 
            d.continent === selectedContinent
        );
    }
    
    renderExploreGrid();
    updateMapStatistics();
}

// Initialize continent filters
function initContinentFilters() {
    $('.continent-btn').on('click', function() {
        const continent = $(this).data('continent');
        filterByContinent(continent);
    });
}

// Initialize sort
function initExploreSort() {
    $('#explore-sort').on('change', function() {
        const sortBy = $(this).val();
        sortExploreDestinations(sortBy);
    });
}

// Sort explore destinations
function sortExploreDestinations(sortBy) {
    switch (sortBy) {
        case 'name':
            filteredExploreDestinations.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price-asc':
            filteredExploreDestinations.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredExploreDestinations.sort((a, b) => b.price - a.price);
            break;
    }
    
    renderExploreGrid();
}

// Render explore grid
function renderExploreGrid() {
    const $grid = $('#explore-grid');
    
    // Update count
    const count = filteredExploreDestinations.length;
    const countLabel = count !== 1 ? t('explore.destinationCountPlural') : t('explore.destinationCount');
    const countText = `${count} ${countLabel}`;
    $('#destinations-count').text(countText);
    
    if (filteredExploreDestinations.length === 0) {
        $grid.html(`
            <div class="no-results">
                <div class="no-results__icon">🔍</div>
                <h3 class="no-results__title">${t('explore.noResults')}</h3>
                <p class="no-results__text">${t('explore.noResultsDesc')}</p>
            </div>
        `);
        return;
    }
    
    // Render cards
    const html = filteredExploreDestinations.map(destination => createDestinationCard(destination)).join('');
    $grid.html(html);
    
    // Attach events
    attachDestinationEvents();
}

// Add CSS animations and styles
if (!document.getElementById('explore-animations')) {
    const style = document.createElement('style');
    style.id = 'explore-animations';
    style.textContent = `
        @keyframes pulse {
            0%, 100% {
                r: 12;
                opacity: 0.6;
            }
            50% {
                r: 20;
                opacity: 0;
            }
        }
        
        @keyframes pulse2 {
            0%, 100% {
                r: 12;
                opacity: 0.4;
            }
            50% {
                r: 25;
                opacity: 0;
            }
        }
        
        .map-point-pulse {
            animation: pulse 2.5s ease-out infinite;
        }
        
        .map-point-pulse-2 {
            animation: pulse2 3s ease-out infinite 0.3s;
        }
        
        .map-point--selected {
            fill: #C97132 !important;
        }
        
        .city-point--selected {
            stroke: #FFD700 !important;
        }
        
        .nav__link--active {
            background-color: var(--color-bg-alt);
            color: var(--color-primary);
        }
        
        .btn-icon-round {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 2px solid var(--color-primary);
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-icon-round:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        #quick-tooltip {
            animation: tooltipFadeIn 0.2s ease;
            white-space: nowrap;
        }
        
        @keyframes tooltipFadeIn {
            from {
                opacity: 0;
                transform: translate(-50%, -100%) translateY(5px);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -100%);
            }
        }
        
        .continent-path {
            transition: all 0.3s ease !important;
        }
        
        .city-point-group[style*="opacity: 0.2"] {
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
}
