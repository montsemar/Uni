// ===========================
// AUTHENTICATION MODULE
// ===========================

// Auth State Management
const AuthManager = {
    currentUser: null,
    
    init() {
        this.loadUserFromStorage();
        this.updateUIForAllPages();
    },
    
    loadUserFromStorage() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    },
    
    saveUserToStorage() {
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    },
    
    isAuthenticated() {
        return this.currentUser !== null;
    },
    
    getCurrentUser() {
        return this.currentUser;
    },
    
    login(email, password) {
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Find user
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = {
                id: user.id,
                username: user.username,
                email: user.email
            };
            this.saveUserToStorage();
            return { success: true, user: this.currentUser };
        }
        
        return { success: false, message: 'Email o contraseña incorrectos' };
    },
    
    register(userData) {
        // Get existing users
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Check if email already exists
        if (users.some(u => u.email === userData.email)) {
            return { success: false, message: 'Este email ya está registrado' };
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username: userData.username,
            email: userData.email,
            password: userData.password,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        
        // Auto login
        this.currentUser = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email
        };
        this.saveUserToStorage();
        
        return { success: true, user: this.currentUser };
    },
    
    logout(skipNotification = false) {
        this.currentUser = null;
        this.saveUserToStorage();
        this.updateUIForAllPages();
        if (!skipNotification) {
            showNotification('Sesión cerrada correctamente', 'success');
        }
    },
    
    updateUIForAllPages() {
        // Buscar el botón de sesión (puede tener diferentes IDs por compatibilidad)
        const userSessionBtn = document.getElementById('user-session') || document.getElementById('auth-trigger');
        if (!userSessionBtn) {
            console.warn('No se encontró el botón de sesión');
            return;
        }
        
        if (this.isAuthenticated()) {
            // Usuario logueado - mostrar nombre
            userSessionBtn.textContent = this.currentUser.username;
            userSessionBtn.classList.remove('btn-auth');
            userSessionBtn.classList.add('btn-primary', 'logged-in');
            
            // Remover eventos anteriores clonando el botón
            const newBtn = userSessionBtn.cloneNode(true);
            userSessionBtn.parentNode.replaceChild(newBtn, userSessionBtn);
            
            // Agregar nuevo evento
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Verificar si estamos en la raíz o en src/
                const currentPath = window.location.pathname;
                if (currentPath.includes('/src/')) {
                    window.location.href = 'perfil.html';
                } else {
                    window.location.href = 'src/perfil.html';
                }
            });
        } else {
            // Usuario no logueado - mostrar "Iniciar Sesión"
            userSessionBtn.textContent = 'Iniciar Sesión';
            userSessionBtn.classList.remove('logged-in');
            userSessionBtn.classList.add('btn-primary');
            
            // Remover eventos anteriores clonando el botón
            const newBtn = userSessionBtn.cloneNode(true);
            userSessionBtn.parentNode.replaceChild(newBtn, userSessionBtn);
            
            // Agregar nuevo evento
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                AuthModal.show();
            });
        }
    },
    
    requireAuth(callback) {
        if (this.isAuthenticated()) {
            if (callback) callback();
            return true;
        } else {
            AuthModal.show();
            return false;
        }
    }
};

// Auth Modal
const AuthModal = {
    modal: null,
    currentMode: 'login', // 'login' or 'register'
    
    show(mode = 'login') {
        this.currentMode = mode;
        this.createModal();
        this.attachEventListeners();
    },
    
    createModal() {
        // Remove existing modal
        if (this.modal) {
            this.modal.remove();
        }
        
        this.modal = document.createElement('div');
        this.modal.className = 'auth-modal';
        this.modal.innerHTML = `
            <div class="auth-overlay"></div>
            <div class="auth-content">
                <button class="auth-close" aria-label="Cerrar">&times;</button>
                <h2 class="auth-title">${this.currentMode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</h2>
                
                <!-- Login Form -->
                <form class="auth-form" id="login-form" style="display: ${this.currentMode === 'login' ? 'block' : 'none'}">
                    <div class="form-group">
                        <label for="login-email">Email</label>
                        <input type="email" id="login-email" required>
                        <span class="field-error"></span>
                    </div>
                    
                    <div class="form-group">
                        <label for="login-password">Contraseña</label>
                        <input type="password" id="login-password" required>
                        <span class="field-error"></span>
                    </div>
                    
                    <button type="submit" class="btn-submit">Iniciar sesión</button>
                    
                    <div class="auth-footer">
                        <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
                        <p>¿No tienes cuenta? <a href="#" class="switch-mode" data-mode="register">Regístrate</a></p>
                    </div>
                </form>
                
                <!-- Register Form -->
                <form class="auth-form" id="register-form" style="display: ${this.currentMode === 'register' ? 'block' : 'none'}">
                    <div class="form-group">
                        <label for="register-username">Usuario</label>
                        <input type="text" id="register-username" required>
                        <span class="field-error"></span>
                    </div>
                    
                    <div class="form-group">
                        <label for="register-email">Email</label>
                        <input type="email" id="register-email" required>
                        <span class="field-error"></span>
                    </div>
                    
                    <div class="form-group">
                        <label for="register-email-confirm">Repetir email</label>
                        <input type="email" id="register-email-confirm" required>
                        <span class="field-error"></span>
                    </div>
                    
                    <div class="form-group">
                        <label for="register-password">Contraseña</label>
                        <input type="password" id="register-password" required>
                        <span class="field-error"></span>
                        <div class="password-strength">
                            <div class="strength-bar"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="register-password-confirm">Repetir contraseña</label>
                        <input type="password" id="register-password-confirm" required>
                        <span class="field-error"></span>
                    </div>
                    
                    <button type="submit" class="btn-submit">Registrarse</button>
                    
                    <div class="auth-footer">
                        <p>¿Ya tienes cuenta? <a href="#" class="switch-mode" data-mode="login">Inicia sesión</a></p>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(this.modal);
    },
    
    attachEventListeners() {
        // Close button
        this.modal.querySelector('.auth-close').addEventListener('click', () => this.close());
        this.modal.querySelector('.auth-overlay').addEventListener('click', () => this.close());
        
        // Switch mode
        this.modal.querySelectorAll('.switch-mode').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = e.target.dataset.mode;
                this.switchMode(mode);
            });
        });
        
        // Login form
        const loginForm = this.modal.querySelector('#login-form');
        loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Register form
        const registerForm = this.modal.querySelector('#register-form');
        registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Real-time validation
        this.setupValidation();
        
        // Forgot password
        this.modal.querySelector('.forgot-password')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.close();
            showNotification('Se ha enviado un enlace de recuperación a tu email', 'info');
        });
    },
    
    setupValidation() {
        // Login email validation
        const loginEmail = document.getElementById('login-email');
        if (loginEmail) {
            loginEmail.addEventListener('blur', () => this.validateEmail(loginEmail));
            loginEmail.addEventListener('input', () => this.clearError(loginEmail));
        }
        
        // Register validations
        const regUsername = document.getElementById('register-username');
        const regEmail = document.getElementById('register-email');
        const regEmailConfirm = document.getElementById('register-email-confirm');
        const regPassword = document.getElementById('register-password');
        const regPasswordConfirm = document.getElementById('register-password-confirm');
        
        if (regUsername) {
            regUsername.addEventListener('blur', () => this.validateUsername(regUsername));
            regUsername.addEventListener('input', () => this.clearError(regUsername));
        }
        
        if (regEmail) {
            regEmail.addEventListener('blur', () => this.validateEmail(regEmail));
            regEmail.addEventListener('input', () => this.clearError(regEmail));
        }
        
        if (regEmailConfirm) {
            regEmailConfirm.addEventListener('blur', () => this.validateEmailMatch(regEmail, regEmailConfirm));
            regEmailConfirm.addEventListener('input', () => this.clearError(regEmailConfirm));
        }
        
        if (regPassword) {
            regPassword.addEventListener('input', () => {
                this.clearError(regPassword);
                this.updatePasswordStrength(regPassword);
            });
            regPassword.addEventListener('blur', () => this.validatePassword(regPassword));
        }
        
        if (regPasswordConfirm) {
            regPasswordConfirm.addEventListener('blur', () => this.validatePasswordMatch(regPassword, regPasswordConfirm));
            regPasswordConfirm.addEventListener('input', () => this.clearError(regPasswordConfirm));
        }
    },
    
    validateEmail(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const value = input.value.trim();
        
        if (!value) {
            this.showError(input, 'El email es obligatorio');
            return false;
        }
        
        if (!emailRegex.test(value)) {
            this.showError(input, 'Email inválido');
            return false;
        }
        
        this.clearError(input);
        return true;
    },
    
    validateUsername(input) {
        const value = input.value.trim();
        
        if (!value) {
            this.showError(input, 'El usuario es obligatorio');
            return false;
        }
        
        if (value.length < 3) {
            this.showError(input, 'Mínimo 3 caracteres');
            return false;
        }
        
        if (value.length > 20) {
            this.showError(input, 'Máximo 20 caracteres');
            return false;
        }
        
        this.clearError(input);
        return true;
    },
    
    validatePassword(input) {
        const value = input.value;
        
        if (!value) {
            this.showError(input, 'La contraseña es obligatoria');
            return false;
        }
        
        if (value.length < 6) {
            this.showError(input, 'Mínimo 6 caracteres');
            return false;
        }
        
        if (!/[A-Z]/.test(value)) {
            this.showError(input, 'Debe contener al menos una mayúscula');
            return false;
        }
        
        if (!/[a-z]/.test(value)) {
            this.showError(input, 'Debe contener al menos una minúscula');
            return false;
        }
        
        if (!/[0-9]/.test(value)) {
            this.showError(input, 'Debe contener al menos un número');
            return false;
        }
        
        this.clearError(input);
        return true;
    },
    
    validateEmailMatch(email, emailConfirm) {
        if (email.value !== emailConfirm.value) {
            this.showError(emailConfirm, 'Los emails no coinciden');
            return false;
        }
        
        this.clearError(emailConfirm);
        return true;
    },
    
    validatePasswordMatch(password, passwordConfirm) {
        if (password.value !== passwordConfirm.value) {
            this.showError(passwordConfirm, 'Las contraseñas no coinciden');
            return false;
        }
        
        this.clearError(passwordConfirm);
        return true;
    },
    
    updatePasswordStrength(input) {
        const password = input.value;
        const strengthBar = input.parentElement.querySelector('.strength-bar');
        
        if (!strengthBar) return;
        
        let strength = 0;
        
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        strengthBar.className = 'strength-bar';
        
        if (strength <= 2) {
            strengthBar.classList.add('weak');
        } else if (strength <= 4) {
            strengthBar.classList.add('medium');
        } else {
            strengthBar.classList.add('strong');
        }
        
        strengthBar.style.width = `${(strength / 6) * 100}%`;
    },
    
    showError(input, message) {
        const formGroup = input.parentElement;
        const errorSpan = formGroup.querySelector('.field-error');
        
        formGroup.classList.add('has-error');
        errorSpan.textContent = message;
        input.setAttribute('aria-invalid', 'true');
    },
    
    clearError(input) {
        const formGroup = input.parentElement;
        const errorSpan = formGroup.querySelector('.field-error');
        
        formGroup.classList.remove('has-error');
        errorSpan.textContent = '';
        input.removeAttribute('aria-invalid');
    },
    
    switchMode(mode) {
        this.currentMode = mode;
        
        const loginForm = this.modal.querySelector('#login-form');
        const registerForm = this.modal.querySelector('#register-form');
        const title = this.modal.querySelector('.auth-title');
        
        if (mode === 'login') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            title.textContent = 'Iniciar Sesión';
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            title.textContent = 'Registrarse';
        }
    },
    
    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email');
        const password = document.getElementById('login-password');
        
        // Validate
        const emailValid = this.validateEmail(email);
        
        if (!emailValid || !password.value) {
            return;
        }
        
        // Attempt login
        const result = AuthManager.login(email.value, password.value);
        
        if (result.success) {
            this.close();
            showNotification(`¡Bienvenido, ${result.user.username}!`, 'success');
            
            // Update UI immediately without reload
            AuthManager.updateUIForAllPages();
        } else {
            this.showError(password, result.message);
        }
    },
    
    handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username');
        const email = document.getElementById('register-email');
        const emailConfirm = document.getElementById('register-email-confirm');
        const password = document.getElementById('register-password');
        const passwordConfirm = document.getElementById('register-password-confirm');
        
        // Validate all fields
        const usernameValid = this.validateUsername(username);
        const emailValid = this.validateEmail(email);
        const emailMatchValid = this.validateEmailMatch(email, emailConfirm);
        const passwordValid = this.validatePassword(password);
        const passwordMatchValid = this.validatePasswordMatch(password, passwordConfirm);
        
        if (!usernameValid || !emailValid || !emailMatchValid || !passwordValid || !passwordMatchValid) {
            return;
        }
        
        // Attempt registration
        const result = AuthManager.register({
            username: username.value.trim(),
            email: email.value.trim(),
            password: password.value
        });
        
        if (result.success) {
            this.close();
            showNotification(`¡Bienvenido, ${result.user.username}! Tu cuenta ha sido creada.`, 'success');
            
            // Update UI immediately without reload
            AuthManager.updateUIForAllPages();
        } else {
            this.showError(email, result.message);
        }
    },
    
    close() {
        const event = new Event('authmodal:close');
        document.dispatchEvent(event);
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
};

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
        <span class="notification-message">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Use setTimeout to ensure this runs after other DOMContentLoaded handlers
    setTimeout(() => {
        AuthManager.init();
        setupFavoritesLink();
    }, 0);
});

// Setup favorites link to require authentication
function setupFavoritesLink() {
    const favoritesLink = document.getElementById('favorites-link');
    if (favoritesLink) {
        favoritesLink.addEventListener('click', function(e) {
            // Check if user is authenticated
            if (!AuthManager.isAuthenticated()) {
                e.preventDefault();
                AuthModal.show();
            }
            // If authenticated, allow navigation to perfil.html#favorites
        });
    }
}
