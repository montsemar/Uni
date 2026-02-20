/* ===================================
   DEMO DATA - Test Users
   Run this once to populate test users
   =================================== */

// Sample users for testing
const testUsers = [
    {
        id: '1',
        username: 'demo',
        email: 'demo@nomadtrails.com',
        password: 'Demo123',
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        username: 'viajero',
        email: 'viajero@example.com',
        password: 'Viaje123',
        createdAt: new Date().toISOString()
    },
    {
        id: '3',
        username: 'aventurero',
        email: 'aventurero@example.com',
        password: 'Aventura123',
        createdAt: new Date().toISOString()
    }
];

// Initialize test users if no users exist
function initializeTestUsers() {
    const existingUsers = localStorage.getItem('registeredUsers');
    
    if (!existingUsers || JSON.parse(existingUsers).length === 0) {
        localStorage.setItem('registeredUsers', JSON.stringify(testUsers));
        console.log('✅ Test users initialized!');
        console.log('📧 Test credentials:');
        testUsers.forEach(user => {
            console.log(`   Email: ${user.email} | Password: ${user.password}`);
        });
    }
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTestUsers);
} else {
    initializeTestUsers();
}
