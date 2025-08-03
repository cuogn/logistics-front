// Role-based Navigation Handler
class RoleNavigationHandler {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('user') || '{}');
        this.role = this.user.role;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupUserInfo();
    }

    setupNavigation() {
        const nav = document.querySelector('.nav');
        if (!nav) return;

        // Ẩn tất cả các menu trước
        const menuItems = nav.querySelectorAll('li');
        menuItems.forEach(item => {
            if (!item.querySelector('#logoutBtn')) {
                item.style.display = 'none';
            }
        });

        // Hiển thị menu dựa trên role
        switch (this.role) {
            case 'admin':
                this.setupAdminNavigation();
                break;
            case 'staff':
                this.setupStaffNavigation();
                break;
            case 'customer':
                this.setupCustomerNavigation();
                break;
            default:
                this.setupDefaultNavigation();
        }

        // Logout luôn hiển thị
        const logoutItem = nav.querySelector('#logoutBtn')?.parentElement;
        if (logoutItem) {
            logoutItem.style.display = 'block';
        }
    }

    setupAdminNavigation() {
        const nav = document.querySelector('.nav');
        
        // Dashboard
        this.showNavItem(nav, 'dashboard', 'admin-dashboard.html', 'Dashboard');
        
        // Orders
        this.showNavItem(nav, 'orders', 'admin-orders.html', 'Quản Lý Đơn Hàng');
        
        // Users
        this.showNavItem(nav, 'users', 'admin-users.html', 'Quản Lý Người Dùng');
        
        // Stats
        this.showNavItem(nav, 'stats', 'admin-stats.html', 'Thống Kê');
        
        // Settings
        this.showNavItem(nav, 'settings', 'admin-settings.html', 'Cài Đặt');
    }

    setupStaffNavigation() {
        const nav = document.querySelector('.nav');
        
        // Dashboard
        this.showNavItem(nav, 'dashboard', 'staff-dashboard.html', 'Dashboard');
        
        // Orders
        this.showNavItem(nav, 'orders', 'staff-orders.html', 'Quản Lý Đơn Hàng');
        
        // Track
        this.showNavItem(nav, 'track', 'staff-track.html', 'Theo Dõi Giao Hàng');
        
        // Stats
        this.showNavItem(nav, 'stats', 'staff-stats.html', 'Thống Kê');
        
        // Settings
        this.showNavItem(nav, 'settings', 'staff-settings.html', 'Cài Đặt');
    }

    setupCustomerNavigation() {
        const nav = document.querySelector('.nav');
        
        // Track
        this.showNavItem(nav, 'track', 'track.html', 'Theo Dõi Đơn Hàng');
        
        // About
        this.showNavItem(nav, 'about', 'about.html', 'Giới Thiệu');
        
        // Contact
        this.showNavItem(nav, 'contact', 'contact.html', 'Liên Hệ');
    }

    setupDefaultNavigation() {
        const nav = document.querySelector('.nav');
        
        // Default navigation for unknown roles
        this.showNavItem(nav, 'dashboard', 'dashboard.html', 'Dashboard');
        this.showNavItem(nav, 'track', 'track.html', 'Theo Dõi Đơn Hàng');
    }

    showNavItem(nav, id, href, text) {
        // Tìm item có id tương ứng
        let item = nav.querySelector(`#${id}Link`)?.parentElement;
        
        if (!item) {
            // Tạo item mới nếu không tìm thấy
            item = document.createElement('li');
            const link = document.createElement('a');
            link.href = href;
            link.className = 'nav-link';
            link.id = `${id}Link`;
            link.textContent = text;
            item.appendChild(link);
            nav.querySelector('ul').appendChild(item);
        } else {
            // Cập nhật href và text
            const link = item.querySelector('a');
            link.href = href;
            link.textContent = text;
        }
        
        item.style.display = 'block';
    }

    setupUserInfo() {
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = this.user.full_name || this.getRoleDisplayName();
        }
    }

    getRoleDisplayName() {
        switch (this.role) {
            case 'admin':
                return 'Admin';
            case 'staff':
                return 'Staff';
            case 'customer':
                return 'Khách hàng';
            default:
                return 'Người dùng';
        }
    }

    // Kiểm tra quyền truy cập trang
    checkPageAccess() {
        const currentPage = window.location.pathname.split('/').pop();
        
        switch (this.role) {
            case 'admin':
                // Admin có thể truy cập tất cả
                return true;
            case 'staff':
                // Staff không thể truy cập admin pages
                if (currentPage.startsWith('admin-')) {
                    window.location.href = 'staff-dashboard.html';
                    return false;
                }
                return true;
            case 'customer':
                // Customer chỉ có thể truy cập customer pages
                if (currentPage.startsWith('admin-') || currentPage.startsWith('staff-')) {
                    window.location.href = 'dashboard.html';
                    return false;
                }
                return true;
            default:
                window.location.href = 'login.html';
                return false;
        }
    }
}

// Initialize role navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const roleNav = new RoleNavigationHandler();
    
    // Check page access
    if (!roleNav.checkPageAccess()) {
        return;
    }
});

// Export for use in other files
window.RoleNavigationHandler = RoleNavigationHandler; 