/* ===================================
   i18n - Internacionalización
   =================================== */

const translations = {
    es: {
        nav: {
            explore: '🧭 Explorar',
            booking: '🎫 Reservas',
            itinerary: '📋 Itinerarios',
            community: '💬 Comunidad',
            help: '❓ Ayuda'
        },
        lang: {
            current: 'ES'
        },
        header: {
            login: 'Iniciar Sesión',
            logout: 'Cerrar Sesión',
            profile: 'Mi Perfil',
            favorites: 'Ver favoritos',
            openMenu: 'Abrir menú',
            changeLanguage: 'Cambiar idioma'
        },
        hero: {
            title: 'Descubre tu próximo destino',
            subtitle: 'Explora el mundo con Nomad Trails'
        },
        search: {
            label: 'Buscar destino',
            placeholder: 'Buscar destinos...'
        },
        filters: {
            all: '🌍 Todos'
        },
        featured: {
            title: 'Destinos Destacados',
            viewAll: 'Ver todos →'
        },
        footer: {
            tagline: 'Tu compañero de viajes auténticos',
            links: 'Enlaces',
            explore: 'Explorar',
            community: 'Comunidad',
            bookings: 'Reservas',
            help: 'Ayuda',
            legal: 'Legal',
            privacy: 'Privacidad',
            terms: 'Términos',
            cookies: 'Cookies',
            contact: 'Contacto',
            rights: '© 2025 Nomad Trails. Todos los derechos reservados.'
        },
        chat: {
            title: 'Asistencia',
            welcome: '¡Hola! ¿En qué puedo ayudarte hoy?',
            inputLabel: 'Escribe tu mensaje',
            inputPlaceholder: 'Escribe tu mensaje...'
        },
        results: {
            title: 'Resultados de búsqueda',
            filters: 'Filtros',
            priceRange: 'Rango de precio',
            sortBy: 'Ordenar por',
            relevance: 'Relevancia',
            priceLowHigh: 'Precio: Menor a Mayor',
            priceHighLow: 'Precio: Mayor a Menor',
            name: 'Nombre A-Z',
            clearFilters: 'Limpiar filtros'
        },
        pagination: {
            previous: 'Anterior',
            next: 'Siguiente'
        },
        destination: {
            description: 'Descripción',
            included: 'Incluido',
            calculator: 'Calculadora de viaje',
            accessibility: 'Accesibilidad',
            cancellation: 'Política de cancelación',
            cancellationFree: 'Cancelación gratuita hasta 48 horas antes',
            cancellationPartial: '50% de reembolso entre 48-24 horas',
            cancellationNo: 'Sin reembolso con menos de 24 horas',
            help: 'Ayuda',
            helpText: '¿Necesitas ayuda con tu reserva? Contacta con nuestro equipo de soporte.',
            contactSupport: 'Contactar soporte'
        },
        calculator: {
            nights: 'Noches',
            hotelPerNight: 'Hotel por noche',
            mealsPerDay: 'Comidas por día',
            carRental: 'Alquiler de coche',
            transport: 'Transporte',
            total: 'Total estimado:'
        },
        booking: {
            from: 'Desde',
            perPerson: 'por persona',
            freeCancellation: 'Cancelación gratuita',
            reserveAdvance: 'Reserve con antelación',
            bestPrice: 'Mejor precio garantizado',
            bookNow: 'Reservar ahora'
        },
        explore: {
            title: 'Explorar Destinos',
            subtitle: 'Descubre lugares increíbles en el mapa interactivo',
            searchPlaceholder: 'Buscar en el mapa...',
            mapView: 'Mapa',
            gridView: 'Lista',
            legend: 'Leyenda',
            available: 'Disponible',
            selected: 'Seleccionado',
            viewDetails: 'Ver detalles',
            sortBy: 'Ordenar:',
            stats: {
                destinations: 'Destinos',
                continents: 'Continentes',
                favorites: 'Favoritos'
            },
            addToFavorites: 'Agregar a favoritos',
            removeFromFavorites: 'Quitar de favoritos',
            close: 'Cerrar',
            noResults: 'No se encontraron destinos',
            noResultsDesc: 'Intenta con otros filtros o términos de búsqueda',
            destinationCount: 'destino',
            destinationCountPlural: 'destinos',
            continents: {
                all: 'Todos',
                europe: 'Europa',
                asia: 'Asia',
                northAmerica: 'Norteamérica',
                southAmerica: 'Sudamérica',
                africa: 'África',
                oceania: 'Oceanía'
            }
        },
        community: {
            title: 'Comunidad de Viajeros',
            subtitle: 'Comparte tus experiencias y conecta con otros viajeros',
            shareExperience: '✏️ Crear publicación',
            writePost: 'Escribe una publicación',
            destinationLabel: 'Destino',
            destinationPlaceholder: 'Selecciona un destino',
            postPlaceholder: '¿Qué te gustaría compartir sobre tu viaje?',
            imageUrl: 'URL de imagen (opcional)',
            imagePlaceholder: 'https://ejemplo.com/imagen.jpg',
            publish: 'Publicar',
            cancel: 'Cancelar',
            allPosts: 'Todas las publicaciones',
            latestPosts: 'Últimas publicaciones',
            noPostsYet: 'No hay publicaciones todavía',
            beFirst: '¡Sé el primero en compartir una experiencia!',
            filterByDestination: 'Filtrar por destino:',
            allDestinations: 'Todos los destinos',
            mostRecent: 'Más recientes',
            mostPopular: 'Más populares',
            bestRated: 'Mejor valorados',
            newPost: 'Nueva Publicación',
            destinationLabel: 'Destino',
            destinationPlaceholder: 'Selecciona un destino',
            ratingLabel: 'Calificación',
            descriptionLabel: 'Descripción',
            descriptionPlaceholder: 'Comparte tu experiencia...',
            characters: 'caracteres',
            imageLabel: 'Imagen (opcional)',
            imagePlaceholder: 'URL de la imagen',
            publish: 'Publicar',
            cancel: 'Cancelar'
        },
        reservations: {
            title: 'Mis Reservas',
            noReservations: 'No tienes reservas',
            readyForAdventure: '¿Listo para tu próxima aventura?',
            exploreDestinations: 'Explorar Destinos',
            viewDetails: 'Ver Detalles',
            nights: 'noches',
            night: 'noche',
            travelers: 'viajeros',
            traveler: 'viajero'
        },
        bookingDetail: {
            backToReservations: '← Volver a Mis Reservas',
            reservation: 'Reserva',
            upcoming: 'Próxima',
            past: 'Pasada',
            downloadPdf: 'Descargar PDF',
            cancelReservation: 'Cancelar Reserva',
            destination: 'Destino',
            travelDetails: 'Detalles del Viaje',
            checkIn: 'Check-in',
            checkOut: 'Check-out',
            nights: 'Noches',
            travelers: 'Viajeros',
            accommodation: 'Alojamiento',
            pet: 'Mascota',
            reservationDate: 'Fecha de reserva',
            specialRequests: 'Solicitudes Especiales',
            itineraryPlanner: '📋 Planificador de Itinerario',
            addActivity: '➕ Añadir',
            activityPlaceholder: 'Añade una actividad (ej: Visitar la Torre Eiffel)',
            noActivitiesYet: '📝 No hay actividades planificadas todavía',
            addActivitiesToOrganize: 'Añade actividades para organizar tu viaje',
            paymentInfo: 'Información de Pago',
            basePrice: 'Precio base',
            accommodationPrice: 'Alojamiento',
            feesAndServices: 'Tasas y servicios',
            totalPaid: 'Total Pagado',
            paymentMethod: 'Método de pago',
            creditCard: 'Tarjeta de crédito',
            reservationStatus: 'Estado de la Reserva',
            reservationConfirmed: 'Reserva Confirmada',
            upcomingTrip: 'Viaje Próximo',
            enjoyYourTrip: 'Disfruta tu Viaje',
            haveAmazingExperience: '¡Que tengas una experiencia increíble!',
            needHelp: '¿Necesitas Ayuda?',
            contactSupport: 'Contacta con nuestro equipo de soporte',
            helpCenter: 'Centro de Ayuda'
        },
        profile: {
            myProfile: 'Mi Perfil',
            editProfile: 'Editar Perfil',
            logout: 'Cerrar Sesión',
            overview: 'Resumen',
            upcomingTrips: 'Viajes Próximos',
            pastTrips: 'Viajes Pasados',
            favorites: 'Favoritos',
            reviews: 'Reseñas',
            stats: 'Estadísticas',
            destinationsVisited: 'Destinos visitados',
            totalTrips: 'Viajes totales',
            reviewsWritten: 'Reseñas escritas',
            favoritesCount: 'Destinos favoritos',
            noTripsInCategory: 'No tienes viajes en esta categoría',
            noFavoritesYet: 'No tienes favoritos todavía',
            exploreAndSave: '¡Explora destinos y guarda tus favoritos!',
            noReviewsYet: 'No has escrito ninguna reseña todavía',
            visitAndShare: '¡Visita destinos y comparte tu experiencia!',
            writeReview: 'Escribir reseña',
            delete: 'Eliminar'
        },
        help: {
            title: 'Centro de Soporte',
            subtitle: 'Estamos aquí para ayudarte. Encuentra respuestas rápidas o contáctanos directamente',
            searchPlaceholder: 'Buscar en la ayuda...',
            faq: 'Preguntas frecuentes',
            faqTitle: 'Preguntas Frecuentes',
            faqDesc: 'Consulta las dudas más comunes',
            liveChat: 'Chat en vivo',
            liveChatDesc: 'Habla con nuestro equipo ahora',
            contactUs: 'Contacto',
            contactUsDesc: 'Llámanos o envía un email',
            categories: 'Categorías',
            generalQuestions: 'Preguntas Generales',
            bookings: 'Reservas',
            payments: 'Pagos',
            account: 'Cuenta',
            emailUs: 'Envíanos un email',
            callUs: 'Llámanos',
            needHelpTitle: '¿No encuentras lo que buscabas?',
            needHelpSubtitle: 'Nuestro equipo está disponible para ayudarte',
            startChat: 'Iniciar chat',
            sendEmail: 'Enviar correo',
            responseTime: 'Tiempo de respuesta promedio:',
            lessThan2Hours: 'menos de 2 horas',
            chatbot: {
                title: 'Asistente Virtual',
                greeting: '¡Hola! Soy tu asistente virtual de Nomad Trails. ¿En qué puedo ayudarte hoy?',
                quickOptions: {
                    cancel: 'Cancelar reserva',
                    modify: 'Modificar fechas',
                    price: 'Información de precios',
                    visa: 'Requisitos de visa'
                },
                inputPlaceholder: 'Escribe tu pregunta...',
                sendButton: 'Enviar'
            },
            faq: {
                q1: '¿Cómo puedo cancelar mi reserva?',
                a1: {
                    intro: 'Puedes cancelar tu reserva desde tu perfil en la sección "Mis Reservas". Las políticas de cancelación varían según el destino y el proveedor:',
                    flexible: 'Cancelación flexible:',
                    flexibleDesc: 'Hasta 24 horas antes del viaje con reembolso completo',
                    moderate: 'Cancelación moderada:',
                    moderateDesc: 'Hasta 7 días antes con reembolso del 50%',
                    strict: 'Cancelación estricta:',
                    strictDesc: 'No se permiten cancelaciones',
                    footer: 'Recuerda revisar los términos específicos de tu reserva antes de proceder.'
                },
                q2: '¿Qué incluye el precio del viaje?',
                a2: {
                    intro: 'Cada paquete de viaje incluye diferentes servicios. Generalmente incluyen:',
                    accommodation: 'Alojamiento según la categoría seleccionada',
                    transport: 'Transporte local o tickets de transporte',
                    guide: 'Guía turístico en idioma español/inglés',
                    tickets: 'Entradas a atracciones principales',
                    insurance: 'Seguro de viaje básico',
                    notIncluded: 'No incluye:',
                    notIncludedDesc: 'Vuelos internacionales, comidas (salvo especificación), propinas, gastos personales.'
                },
                q3: '¿Puedo viajar con mascotas?',
                a3: {
                    intro: 'La política de mascotas depende del destino y el alojamiento seleccionado:',
                    small: 'Algunos alojamientos aceptan mascotas pequeñas (hasta 10kg) con cargo adicional',
                    certificate: 'Se requiere certificado de vacunación y salud al día',
                    carrier: 'Las mascotas deben viajar en transportadora en vehículos compartidos',
                    quarantine: 'Algunos países requieren cuarentena o documentación especial',
                    footer: 'Usa el filtro "Pet-friendly" en la búsqueda para ver destinos que aceptan mascotas.'
                },
                q4: '¿Necesito visa para los destinos?',
                a4: {
                    intro: 'Los requisitos de visa varían según tu nacionalidad y el destino:',
                    eu: 'Unión Europea:',
                    euDesc: 'Ciudadanos UE no requieren visa para estadías cortas',
                    us: 'Estados Unidos:',
                    usDesc: 'Se requiere ESTA o visa B1/B2 según país de origen',
                    asia: 'Asia:',
                    asiaDesc: 'Algunos países ofrecen visa on arrival (Tailandia, Indonesia)',
                    latam: 'América Latina:',
                    latamDesc: 'Mayoría de países no requiere visa para turismo (hasta 90 días)',
                    footer: 'Consulta la página del destino para información específica o contacta con nuestro equipo.'
                },
                q5: '¿Qué pasa si mi vuelo se retrasa?',
                a5: {
                    intro: 'Si tu vuelo sufre retrasos o cancelaciones:',
                    contact: 'Contacta inmediatamente con nuestro equipo de soporte 24/7',
                    assistance: 'Proporcionamos asistencia para reorganizar transfers y primera noche de alojamiento',
                    insurance: 'El seguro de viaje cubre gastos adicionales por retrasos superiores a 6 horas',
                    noPenalty: 'No se aplican penalizaciones por llegadas tardías fuera de tu control',
                    footer: 'Guarda todos los documentos de la aerolínea para reclamaciones posteriores.'
                },
                q6: '¿Puedo modificar las fechas de mi viaje?',
                a6: {
                    intro: 'Sí, puedes modificar las fechas de tu viaje:',
                    days30: 'Hasta 30 días antes:',
                    days30Desc: 'Cambio gratuito sujeto a disponibilidad',
                    days15: '15-29 días antes:',
                    days15Desc: 'Cargo del 10% sobre el valor de la reserva',
                    days7: '7-14 días antes:',
                    days7Desc: 'Cargo del 25% sobre el valor de la reserva',
                    days6: 'Menos de 7 días:',
                    days6Desc: 'Cargo del 50% sobre el valor de la reserva',
                    footer: 'Los cambios están sujetos a disponibilidad y pueden requerir ajuste de precio si las tarifas han cambiado.'
                }
            }
        },
        checkout: {
            completeReservation: 'Completar Reserva',
            back: 'Volver',
            destinationAndDates: 'Destino y Fechas',
            passengers: 'Pasajeros',
            pet: 'Mascota',
            preferences: 'Preferencias',
            payment: 'Pago'
        },
        common: {
            from: 'Desde',
            to: 'a',
            loading: 'Cargando...',
            error: 'Error',
            success: 'Éxito',
            save: 'Guardar',
            cancel: 'Cancelar',
            delete: 'Eliminar',
            edit: 'Editar',
            search: 'Buscar',
            filter: 'Filtrar',
            sort: 'Ordenar',
            all: 'Todos',
            yes: 'Sí',
            no: 'No',
            close: 'Cerrar',
            open: 'Abrir'
        }
    },
    en: {
        nav: {
            explore: '🧭 Explore',
            booking: '🎫 Bookings',
            itinerary: '📋 Itineraries',
            community: '💬 Community',
            help: '❓ Help'
        },
        lang: {
            current: 'EN'
        },
        header: {
            login: 'Log In',
            logout: 'Log Out',
            profile: 'My Profile',
            favorites: 'View favorites',
            openMenu: 'Open menu',
            changeLanguage: 'Change language'
        },
        hero: {
            title: 'Discover your next destination',
            subtitle: 'Explore the world with Nomad Trails'
        },
        search: {
            label: 'Search destination',
            placeholder: 'Search destinations...'
        },
        filters: {
            all: '🌍 All'
        },
        featured: {
            title: 'Featured Destinations',
            viewAll: 'View all →'
        },
        footer: {
            tagline: 'Your authentic travel companion',
            links: 'Links',
            explore: 'Explore',
            community: 'Community',
            bookings: 'Bookings',
            help: 'Help',
            legal: 'Legal',
            privacy: 'Privacy',
            terms: 'Terms',
            cookies: 'Cookies',
            contact: 'Contact',
            rights: '© 2025 Nomad Trails. All rights reserved.'
        },
        chat: {
            title: 'Support',
            welcome: 'Hello! How can I help you today?',
            inputLabel: 'Type your message',
            inputPlaceholder: 'Type your message...'
        },
        results: {
            title: 'Search results',
            filters: 'Filters',
            priceRange: 'Price range',
            sortBy: 'Sort by',
            relevance: 'Relevance',
            priceLowHigh: 'Price: Low to High',
            priceHighLow: 'Price: High to Low',
            name: 'Name A-Z',
            clearFilters: 'Clear filters'
        },
        pagination: {
            previous: 'Previous',
            next: 'Next'
        },
        destination: {
            description: 'Description',
            included: 'Included',
            included1: '✓ Accommodation in a 4-star hotel',
            included2: '✓ Breakfast',
            included3: '✓ Local tour guide',
            calculator: 'Travel calculator',
            accessibility: 'Accessibility',
            accessibility1: '♿ Wheelchair access',
            accessibility2: '🚻 Adapted bathrooms',
            accessibility3: '🅿️ Accessible parking',
            accessibility4: '🦮 Guide dogs allowed',
            cancellation: 'Cancellation policy',
            cancellationFree: 'Free cancellation up to 48 hours before',
            cancellationPartial: '50% refund between 48-24 hours',
            cancellationNo: 'No refund with less than 24 hours',
            help: 'Help',
            helpText: 'Need help with your booking? Contact our support team.',
            contactSupport: 'Contact support',
        },
        calculator: {
            nights: 'Nights',
            hotelPerNight: 'Hotel per night',
            mealsPerDay: 'Meals per day',
            carRental: 'Car rental',
            transport: 'Transport',
            total: 'Estimated total:'
        },
        booking: {
            from: 'From',
            perPerson: 'per person',
            freeCancellation: 'Free cancellation',
            reserveAdvance: 'Reserve in advance',
            bestPrice: 'Best price guaranteed',
            bookNow: 'Book now'
        },
        explore: {
            title: 'Explore Destinations',
            subtitle: 'Discover amazing places on the interactive map',
            searchPlaceholder: 'Search on map...',
            mapView: 'Map',
            gridView: 'List',
            legend: 'Legend',
            available: 'Available',
            selected: 'Selected',
            viewDetails: 'View details',
            sortBy: 'Sort by:',
            stats: {
                destinations: 'Destinations',
                continents: 'Continents',
                favorites: 'Favorites'
            },
            addToFavorites: 'Add to favorites',
            removeFromFavorites: 'Remove from favorites',
            close: 'Close',
            noResults: 'No destinations found',
            noResultsDesc: 'Try other filters or search terms',
            destinationCount: 'destination',
            destinationCountPlural: 'destinations',
            continents: {
                all: 'All',
                europe: 'Europe',
                asia: 'Asia',
                northAmerica: 'North America',
                southAmerica: 'South America',
                africa: 'Africa',
                oceania: 'Oceania'
            }
        },
        community: {
            title: 'Travelers Community',
            loading: 'Loading posts...',
            subtitle: 'Share your experiences and connect with other travelers',
            shareExperience: '✏️ Create post',
            writePost: 'Write a post',
            destinationLabel: 'Destination',
            destinationPlaceholder: 'Select a destination',
            postPlaceholder: 'What would you like to share about your trip?',
            imageUrl: 'Image URL (optional)',
            imagePlaceholder: 'https://example.com/image.jpg',
            publish: 'Publish',
            cancel: 'Cancel',
            allPosts: 'All posts',
            latestPosts: 'Latest posts',
            noPostsYet: 'No posts yet',
            beFirst: 'Be the first to share an experience!',
            filterByDestination: 'Filter by destination:',
            allDestinations: 'All destinations',
            mostRecent: 'Most recent',
            mostPopular: 'Most popular',
            bestRated: 'Best rated',
            newPost: 'New Post',
            destinationLabel: 'Destination',
            destinationPlaceholder: 'Select a destination',
            ratingLabel: 'Rating',
            descriptionLabel: 'Description',
            descriptionPlaceholder: 'Share your experience...',
            characters: 'characters',
            imageLabel: 'Image (optional)',
            imagePlaceholder: 'Image URL',
            publish: 'Publish',
            cancel: 'Cancel',

        },
        reservations: {
            title: 'My Reservations',
            noReservations: 'No reservations',
            readyForAdventure: 'Ready for your next adventure?',
            exploreDestinations: 'Explore Destinations',
            viewDetails: 'View Details',
            nights: 'nights',
            night: 'night',
            travelers: 'travelers',
            traveler: 'traveler'
        },
        bookingDetail: {
            backToReservations: '← Back to My Reservations',
            reservation: 'Reservation #',
            upcoming: 'Upcoming',
            past: 'Past',
            downloadPdf: 'Download PDF',
            cancelReservation: 'Cancel Reservation',
            destination: 'Destination',
            travelDetails: 'Travel Details',
            checkIn: 'Check-in',
            checkOut: 'Check-out',
            nights: 'Nights',
            travelers: 'Travelers',
            accommodation: 'Accommodation',
            pet: 'Pet',
            reservationDate: 'Reservation date',
            specialRequests: 'Special Requests',
            itineraryPlanner: '📋 Itinerary Planner',
            addActivity: '➕ Add',
            activityPlaceholder: 'Add an activity (e.g., Visit the Eiffel Tower)',
            noActivitiesYet: '📝 No activities planned yet',
            addActivitiesToOrganize: 'Add activities to organize your trip',
            paymentInfo: 'Payment Information',
            basePrice: 'Base price',
            accommodationPrice: 'Accommodation',
            feesAndServices: 'Fees and services',
            totalPaid: 'Total Paid',
            paymentMethod: 'Payment method',
            creditCard: '💳 Credit card',
            reservationStatus: 'Reservation Status',
            reservationConfirmed: 'Reservation Confirmed',
            upcomingTrip: 'Upcoming Trip',
            enjoyYourTrip: 'Enjoy Your Trip',
            haveAmazingExperience: 'Have an amazing experience!',
            needHelp: 'Need Help?',
            contactSupport: 'Contact our support team',
            helpCenter: 'Help Center'
        },
        profile: {
            settings: '⚙️ Settings',
            logout: 'Log Out',
            upcomingTrips: 'Upcoming Trips',
            pastTrips: 'Past Trips',
            favorites: 'Favorites',
            reviews: 'Reviews',
            trips: 'Trips',
            myTrips: 'My Trips',
            noTripsInCategory: 'No trips in this category',
            noFavoritesYet: 'No favorites yet',
            exploreAndSave: 'Explore destinations and save your favorites!',
            noReviewsYet: "You haven't written any reviews yet",
            visitAndShare: 'Visit destinations and share your experience!',
            writeReview: 'Write review',
            delete: 'Delete'
        },
        help: {
            title: 'Support Center',
            subtitle: 'We\'re here to help. Find quick answers or contact us directly',
            searchPlaceholder: 'Search help...',
            faq: 'Frequently asked questions',
            faqTitle: 'Frequently Asked Questions',
            faqDesc: 'Check the most common questions',
            liveChat: 'Live chat',
            liveChatDesc: 'Talk to our team now',
            contactUs: 'Contact',
            contactUsDesc: 'Call us or send an email',
            categories: 'Categories',
            generalQuestions: 'General Questions',
            bookings: 'Bookings',
            payments: 'Payments',
            account: 'Account',
            emailUs: 'Email us',
            callUs: 'Call us',
            needHelpTitle: "Can't find what you're looking for?",
            needHelpSubtitle: 'Our team is available to help you',
            startChat: 'Start chat',
            sendEmail: 'Send email',
            responseTime: 'Average response time:',
            lessThan2Hours: 'less than 2 hours',
            chatbot: {
                title: 'Virtual Assistant',
                greeting: "Hello! I'm your Nomad Trails virtual assistant. How can I help you today?",
                quickOptions: {
                    cancel: 'Cancel booking',
                    modify: 'Modify dates',
                    price: 'Price information',
                    visa: 'Visa requirements'
                },
                inputPlaceholder: 'Type your question...',
                sendButton: 'Send'
            },
            faq: {
                q1: 'How can I cancel my reservation?',
                a1: {
                    intro: 'You can cancel your reservation from your profile in the "My Bookings" section. Cancellation policies vary by destination and provider:',
                    flexible: 'Flexible cancellation:',
                    flexibleDesc: 'Up to 24 hours before the trip with full refund',
                    moderate: 'Moderate cancellation:',
                    moderateDesc: 'Up to 7 days before with 50% refund',
                    strict: 'Strict cancellation:',
                    strictDesc: 'No cancellations allowed',
                    footer: 'Remember to review the specific terms of your reservation before proceeding.'
                },
                q2: 'What does the trip price include?',
                a2: {
                    intro: 'Each travel package includes different services. Generally they include:',
                    accommodation: 'Accommodation according to the selected category',
                    transport: 'Local transport or transport tickets',
                    guide: 'Tour guide in Spanish/English',
                    tickets: 'Entrance to main attractions',
                    insurance: 'Basic travel insurance',
                    notIncluded: 'Does not include:',
                    notIncludedDesc: 'International flights, meals (unless specified), tips, personal expenses.'
                },
                q3: 'Can I travel with pets?',
                a3: {
                    intro: 'Pet policy depends on the destination and selected accommodation:',
                    small: 'Some accommodations accept small pets (up to 10kg) with additional charge',
                    certificate: 'Up-to-date vaccination and health certificate required',
                    carrier: 'Pets must travel in a carrier in shared vehicles',
                    quarantine: 'Some countries require quarantine or special documentation',
                    footer: 'Use the "Pet-friendly" filter in the search to see pet-accepting destinations.'
                },
                q4: 'Do I need a visa for the destinations?',
                a4: {
                    intro: 'Visa requirements vary depending on your nationality and destination:',
                    eu: 'European Union:',
                    euDesc: 'EU citizens do not require a visa for short stays',
                    us: 'United States:',
                    usDesc: 'ESTA or B1/B2 visa required depending on country of origin',
                    asia: 'Asia:',
                    asiaDesc: 'Some countries offer visa on arrival (Thailand, Indonesia)',
                    latam: 'Latin America:',
                    latamDesc: 'Most countries do not require a visa for tourism (up to 90 days)',
                    footer: 'Check the destination page for specific information or contact our team.'
                },
                q5: 'What happens if my flight is delayed?',
                a5: {
                    intro: 'If your flight is delayed or cancelled:',
                    contact: 'Contact our 24/7 support team immediately',
                    assistance: 'We provide assistance to rearrange transfers and first night accommodation',
                    insurance: 'Travel insurance covers additional expenses for delays over 6 hours',
                    noPenalty: 'No penalties apply for late arrivals beyond your control',
                    footer: 'Keep all airline documents for later claims.'
                },
                q6: 'Can I modify my trip dates?',
                a6: {
                    intro: 'Yes, you can modify your trip dates:',
                    days30: 'Up to 30 days before:',
                    days30Desc: 'Free change subject to availability',
                    days15: '15-29 days before:',
                    days15Desc: '10% charge on the reservation value',
                    days7: '7-14 days before:',
                    days7Desc: '25% charge on the reservation value',
                    days6: 'Less than 7 days:',
                    days6Desc: '50% charge on the reservation value',
                    footer: 'Changes are subject to availability and may require price adjustment if rates have changed.'
                }
            }
        },
        checkout: {
            completeReservation: 'Complete Reservation',
            back: '← Back',
            continue: 'Continue →',
            destinationAndDates: 'Destination and Dates',
            destination: 'Destination',
            departureDate: 'Departure Date',
            returnDate: 'Return Date',
            passengers: 'Passengers',
            passengers_number: 'Number of Passengers',
            pet: 'Pet',
            pet_checkbox: 'I will be traveling with a pet',
            pet_type: 'Type of Pet',
            pet_type_select: 'Select pet type',
            pet_type_dog: 'Dog',
            pet_type_cat: 'Cat',
            pet_type_other: 'Other',
            pet_weight: 'Weight of Pet',
            preferences: 'Preferences',
            accommodation: 'Accommodation',
            accommodation_select: 'Select accommodation type',
            accommodation_hostel: 'Hostel (Economy)',
            accommodation_hotel_3: 'Hotel 3★ (Standard)',
            accommodation_hotel_4: 'Hotel 4★ (Comfort)',
            accommodation_hotel_5: 'Hotel 5★ (Luxury)',
            special_requests: 'Special Requests',
            special_requests_placeholder: 'Dietary needs, accessibility requirements, etc.',
            payment: 'Payment',
            card_name: 'Full Name on Card',
            card_name_placeholder: 'Name Surname',
            card_number: 'Card Number',
            card_expiry: 'Expiry Date',
            card_expiry_placeholder: 'MM/YY',
            save_card: 'Save card for future transactions',
            accept_terms: 'I accept the',
            terms_and_conditions: 'terms and conditions',
            confirm_payment: 'Confirm Payment →',
            summary: 'Booking Summary'
        },
        common: {
            from: 'From',
            to: 'to',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            search: 'Search',
            filter: 'Filter',
            sort: 'Sort',
            all: 'All',
            yes: 'Yes',
            no: 'No',
            close: 'Close',
            open: 'Open'
        }
    }
};

let currentLanguage = loadFromStorage('language', 'es');

// Set language
function setLanguage(lang) {
    if (!translations[lang]) {
        console.error(`Language ${lang} not found`);
        return;
    }
    
    currentLanguage = lang;
    saveToStorage('language', lang);
    
    // Update document language
    document.documentElement.lang = lang;
    
    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getNestedTranslation(translations[lang], key);
        if (translation) {
            element.textContent = translation;
        }
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = getNestedTranslation(translations[lang], key);
        if (translation) {
            element.placeholder = translation;
        }
    });
    
    // Update aria-labels
    document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
        const key = element.getAttribute('data-i18n-aria-label');
        const translation = getNestedTranslation(translations[lang], key);
        if (translation) {
            element.setAttribute('aria-label', translation);
        }
    });
}

// Get nested translation by key path (e.g., 'nav.explore')
function getNestedTranslation(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Get translation
function t(key) {
    return getNestedTranslation(translations[currentLanguage], key) || key;
}

// Initialize language on page load
$(document).ready(function() {
    setLanguage(currentLanguage);
    
    // Language toggle button
    $('#lang-toggle').on('click', function() {
        const newLang = currentLanguage === 'es' ? 'en' : 'es';
        setLanguage(newLang);
        showToast(newLang === 'es' ? 'Idioma cambiado a Español' : 'Language changed to English', 'success'); 
        // Dispatch custom event to notify language change
        const languageChangeEvent = new CustomEvent('languageChanged', { 
            detail: {language: newLang}
        });
        document.dispatchEvent(languageChangeEvent);
    });
});
