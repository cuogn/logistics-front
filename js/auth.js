// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.setAttribute('data-lucide', 'eye-off');
            } else {
                input.type = 'password';
                icon.setAttribute('data-lucide', 'eye');
            }
            lucide.createIcons();
        });
    });
    
    // Login form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            // Basic validation
            if (!email || !password) {
                showAuthNotification('Please fill in all fields', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showAuthNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate login process
            showAuthNotification('Logging in...', 'info');
            
            setTimeout(() => {
                // Simulate successful login
                showAuthNotification('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
            }, 2000);
        });
    }
    
    // Register form handling
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const company = document.getElementById('company').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('terms').checked;
            
            // Basic validation
            if (!firstName || !lastName || !email || !company || !phone || !password || !confirmPassword) {
                showAuthNotification('Please fill in all fields', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showAuthNotification('Please enter a valid email address', 'error');
                return;
            }
            
            if (password.length < 8) {
                showAuthNotification('Password must be at least 8 characters long', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showAuthNotification('Passwords do not match', 'error');
                return;
            }
            
            if (!terms) {
                showAuthNotification('Please accept the terms and conditions', 'error');
                return;
            }
            
            // Simulate registration process
            showAuthNotification('Creating your account...', 'info');
            
            setTimeout(() => {
                // Simulate successful registration
                showAuthNotification('Account created successfully! Redirecting to login...', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }, 2500);
        });
    }
    
    // Social login buttons
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const provider = this.querySelector('span').textContent.includes('Google') ? 'Google' : 'GitHub';
            showAuthNotification(`Connecting with ${provider}...`, 'info');
            
            setTimeout(() => {
                showAuthNotification(`${provider} login not implemented yet`, 'error');
            }, 1500);
        });
    });
    
    // Forgot password link
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            showAuthNotification('Password reset functionality coming soon!', 'info');
        });
    }
});

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show authentication notification
function showAuthNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.auth-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `auth-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i data-lucide="${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .auth-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        }
        
        .auth-notification.show {
            transform: translateX(0);
        }
        
        .auth-notification.info {
            background: #1e40af;
            color: white;
        }
        
        .auth-notification.success {
            background: #10b981;
            color: white;
        }
        
        .auth-notification.error {
            background: #ef4444;
            color: white;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .notification-content i {
            width: 1.25rem;
            height: 1.25rem;
            flex-shrink: 0;
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
    
    // Initialize icons
    lucide.createIcons();
}

// Get notification icon based on type
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'check-circle';
        case 'error':
            return 'alert-circle';
        case 'info':
        default:
            return 'info';
    }
}

// Form input focus effects
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
});

// Add loading state to buttons
function setButtonLoading(button, loading = true) {
    if (loading) {
        button.disabled = true;
        button.innerHTML = `
            <i data-lucide="loader-2" class="animate-spin"></i>
            <span>Loading...</span>
        `;
    } else {
        button.disabled = false;
        button.innerHTML = `
            <span>Sign In</span>
            <i data-lucide="arrow-right"></i>
        `;
    }
    lucide.createIcons();
} 