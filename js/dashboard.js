// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Animate stats on load
    animateDashboardStats();
    
    // Add click handlers for action buttons
    setupActionButtons();
    
    // Add hover effects for order items
    setupOrderItemInteractions();
    
    // Initialize map refresh functionality
    setupMapRefresh();
});

// Animate dashboard statistics
function animateDashboardStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.textContent.replace(/[^\d]/g, ''));
        const suffix = stat.textContent.replace(/[\d]/g, '');
        let current = 0;
        const increment = target / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current).toLocaleString() + suffix;
        }, 30);
    });
}

// Setup action buttons
function setupActionButtons() {
    const actionButtons = document.querySelectorAll('.action-btn');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.querySelector('span').textContent;
            
            // Show loading state
            const originalContent = this.innerHTML;
            this.innerHTML = `
                <i data-lucide="loader-2" class="animate-spin"></i>
                <span>Loading...</span>
            `;
            lucide.createIcons();
            
            // Simulate action
            setTimeout(() => {
                showDashboardNotification(`${action} functionality coming soon!`, 'info');
                this.innerHTML = originalContent;
                lucide.createIcons();
            }, 1500);
        });
    });
    
    // Setup order action buttons
    const orderButtons = document.querySelectorAll('.order-actions .btn');
    orderButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.textContent;
            const orderId = this.closest('.order-item').querySelector('h4').textContent;
            
            showDashboardNotification(`${action} for ${orderId}`, 'info');
        });
    });
}

// Setup order item interactions
function setupOrderItemInteractions() {
    const orderItems = document.querySelectorAll('.order-item');
    
    orderItems.forEach(item => {
        item.addEventListener('click', function() {
            // Add visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// Setup map refresh functionality
function setupMapRefresh() {
    const refreshButton = document.querySelector('.map-controls .btn');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            // Show loading state
            const originalText = this.textContent;
            this.innerHTML = `
                <i data-lucide="loader-2" class="animate-spin"></i>
                Refreshing...
            `;
            lucide.createIcons();
            
            // Simulate refresh
            setTimeout(() => {
                this.textContent = originalText;
                showDashboardNotification('Map refreshed successfully!', 'success');
            }, 2000);
        });
    }
}

// Show dashboard notification
function showDashboardNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.dashboard-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `dashboard-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i data-lucide="${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .dashboard-notification {
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
        
        .dashboard-notification.show {
            transform: translateX(0);
        }
        
        .dashboard-notification.info {
            background: #1e40af;
            color: white;
        }
        
        .dashboard-notification.success {
            background: #10b981;
            color: white;
        }
        
        .dashboard-notification.error {
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
        
        .animate-spin {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
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

// Add real-time updates simulation
function simulateRealTimeUpdates() {
    setInterval(() => {
        // Randomly update a stat
        const stats = document.querySelectorAll('.stat-number');
        const randomStat = stats[Math.floor(Math.random() * stats.length)];
        
        if (randomStat) {
            const currentValue = parseInt(randomStat.textContent.replace(/[^\d]/g, ''));
            const newValue = currentValue + Math.floor(Math.random() * 5) + 1;
            const suffix = randomStat.textContent.replace(/[\d]/g, '');
            
            randomStat.textContent = newValue.toLocaleString() + suffix;
        }
    }, 30000); // Update every 30 seconds
}

// Initialize real-time updates
setTimeout(() => {
    simulateRealTimeUpdates();
}, 5000);

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Focus on search if available
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Escape to close modals/notifications
    if (e.key === 'Escape') {
        const notifications = document.querySelectorAll('.dashboard-notification, .auth-notification, .track-notification');
        notifications.forEach(notification => {
            notification.remove();
        });
    }
});

// Add smooth scrolling for anchor links
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}); 