// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all Lucide icons
    lucide.createIcons();
    
    // Mobile menu functionality
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const nav = document.querySelector('.nav');
    const headerActions = document.querySelector('.header-actions');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            // Create mobile menu if it doesn't exist
            if (!document.querySelector('.mobile-menu')) {
                createMobileMenu();
            }
            
            const mobileMenu = document.querySelector('.mobile-menu');
            mobileMenu.classList.toggle('active');
            
            // Toggle menu icon
            const menuIcon = mobileMenuToggle.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
                menuIcon.setAttribute('data-lucide', 'x');
            } else {
                menuIcon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        });
    }
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link, .footer-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Button click handlers
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Handle specific button actions
            if (this.textContent.includes('Login')) {
                e.preventDefault();
                showNotification('Login functionality coming soon!');
            } else if (this.textContent.includes('Register')) {
                e.preventDefault();
                showNotification('Registration functionality coming soon!');
            } else if (this.textContent.includes('Get Started')) {
                e.preventDefault();
                showNotification('Get Started functionality coming soon!');
            }
        });
    });
    
    // Feature card hover effects
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Header scroll effect
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScrollTop > lastScrollTop && currentScrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = currentScrollTop;
    });
    
    // Animate stats on scroll
    const stats = document.querySelectorAll('.stat-number');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    stats.forEach(stat => {
        statsObserver.observe(stat);
    });
    
    // Handle user authentication display
    handleUserAuth();
});

// Handle user authentication display
function handleUserAuth() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const navUserMenu = document.getElementById('navUserMenu');
    const navUserName = document.getElementById('navUserName');
    const navLogoutBtn = document.getElementById('navLogoutBtn');
    const headerActions = document.querySelector('.header-actions');
    
    if (user && user.role) {
        // Show user menu in navigation
        if (navUserMenu && navUserName && navLogoutBtn) {
            navUserMenu.style.display = 'block';
            navUserName.textContent = user.lastName ? (user.firstName + ' ' + user.lastName) : user.email;
            navLogoutBtn.onclick = function() { 
                if (window.api && api.logout) api.logout(); 
                else window.location.href = 'pages/login.html'; 
            };
        }
        
        // Hide login/register buttons
        if (headerActions) {
            const loginBtn = headerActions.querySelector('a[href*="login"]');
            const registerBtn = headerActions.querySelector('a[href*="register"]');
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
        }
    } else {
        // Hide user menu
        if (navUserMenu) navUserMenu.style.display = 'none';
        
        // Show login/register buttons
        if (headerActions) {
            const loginBtn = headerActions.querySelector('a[href*="login"]');
            const registerBtn = headerActions.querySelector('a[href*="register"]');
            if (loginBtn) loginBtn.style.display = '';
            if (registerBtn) registerBtn.style.display = '';
        }
    }
}

// Create mobile menu
function createMobileMenu() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    
    let userMenuHTML = '';
    if (user && user.role) {
        const userName = user.lastName ? (user.firstName + ' ' + user.lastName) : user.email;
        userMenuHTML = `
            <div class="mobile-user-menu">
                <div class="mobile-user-info">${userName}</div>
                <button class="btn btn-secondary" id="mobileLogoutBtn">Đăng Xuất</button>
            </div>
        `;
    } else {
        userMenuHTML = `
            <div class="mobile-actions">
                <a href="pages/login.html" class="btn btn-secondary">Đăng Nhập</a>
                <a href="pages/register.html" class="btn btn-primary">Đăng Ký</a>
            </div>
        `;
    }
    
    mobileMenu.innerHTML = `
        <div class="mobile-menu-content">
            <nav class="mobile-nav">
                <ul class="mobile-nav-list">
                    <li><a href="index.html" class="mobile-nav-link">Trang Chủ</a></li>
                    <li><a href="pages/services.html" class="mobile-nav-link">Dịch Vụ</a></li>
                    <li><a href="pages/track.html" class="mobile-nav-link">Theo Dõi</a></li>
                    <li><a href="pages/distance-calculator.html" class="mobile-nav-link">Tính Khoảng Cách</a></li>
                    <li><a href="pages/about.html" class="mobile-nav-link">Giới Thiệu</a></li>
                    <li><a href="pages/contact.html" class="mobile-nav-link">Liên Hệ</a></li>
                    <li><a href="pages/faq.html" class="mobile-nav-link">FAQ</a></li>
                </ul>
            </nav>
            ${userMenuHTML}
        </div>
    `;
    
    document.body.appendChild(mobileMenu);
    
    // Handle mobile logout
    const mobileLogoutBtn = mobileMenu.querySelector('#mobileLogoutBtn');
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', function() {
            if (window.api && api.logout) {
                api.logout();
            } else {
                window.location.href = 'pages/login.html';
            }
            // Close mobile menu after logout
            mobileMenu.classList.remove('active');
            const menuIcon = document.querySelector('#mobileMenuToggle i');
            menuIcon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        });
    }
    
    // Close mobile menu when clicking on links
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            const menuIcon = document.querySelector('#mobileMenuToggle i');
            menuIcon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        });
    });
    
    // Close mobile menu when clicking outside
    mobileMenu.addEventListener('click', function(e) {
        if (e.target === mobileMenu) {
            mobileMenu.classList.remove('active');
            const menuIcon = document.querySelector('#mobileMenuToggle i');
            menuIcon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        }
    });
}

// Show notification
function showNotification(message) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1e40af;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        }
        
        .notification.show {
            transform: translateX(0);
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Animate number counting
function animateNumber(element) {
    const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
    const suffix = element.textContent.replace(/[\d]/g, '');
    let current = 0;
    const increment = target / 50;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 30);
}

// Add loading animation for images and icons
window.addEventListener('load', function() {
    // Add fade-in animation to sections
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

// Add scroll-based animations
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero');
    
    if (parallax) {
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
    }
});

// Network Carousel
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    
    if (!carousel) return;
    
    let currentSlide = 0;
    const slideWidth = 300; // Width of each slide
    
    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        updateCarousel();
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateCarousel();
    }
    
    // Event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateCarousel();
        });
    });
    
    // Auto slide every 5 seconds
    setInterval(nextSlide, 5000);
    
    // Touch/swipe support for mobile
    let startX = 0;
    let endX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });
    
    carousel.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide(); // Swipe left
            } else {
                prevSlide(); // Swipe right
            }
        }
    }
}); 