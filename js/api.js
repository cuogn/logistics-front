// API Configuration
const API_BASE_URL = 'https://logistics-fro.onrender.com/api';

// API Service Class
class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('token');
    }

    // Set token after login
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    // Clear token on logout
    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    // Get auth headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const config = {
                headers: this.getHeaders(),
                ...options
            };

            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Authentication APIs
    async login(username, password) {
        const response = await this.post('/auth/login', { username, password });
        if (response.success) {
            this.setToken(response.data.token);
        }
        return response;
    }

    async register(userData) {
        const response = await this.post('/auth/register', userData);
        if (response.success) {
            this.setToken(response.data.token);
        }
        return response;
    }

    async createUser(userData) {
        return this.post('/auth/admin/create-user', userData);
    }

    async updateProfile(userData) {
        return this.put('/auth/profile', userData);
    }

    async logout() {
        this.clearToken();
        localStorage.removeItem('user'); // Clear user data too
        window.location.href = '/frontend/index.html'; // Fix path
    }

    async getCurrentUser() {
        return this.get('/auth/me');
    }

    async changePassword(currentPassword, newPassword) {
        return this.put('/auth/change-password', { currentPassword, newPassword });
    }

    // Orders APIs
    async getOrders(params = {}) {
        return this.get('/orders', params);
    }

    async getOrder(id) {
        return this.get(`/orders/${id}`);
    }

    async createOrder(orderData) {
        return this.post('/orders', orderData);
    }

    async updateOrder(id, orderData) {
        return this.put(`/orders/${id}`, orderData);
    }

    async deleteOrder(id) {
        return this.delete(`/orders/${id}`);
    }

    async updateOrderStatus(id, status, description, location = '') {
        // Validation trước khi gửi request
        if (!id || !status || !description) {
            throw new Error('Thiếu thông tin bắt buộc');
        }

        const validStatuses = ['pending', 'processing', 'shipping', 'delivered', 'failed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error('Trạng thái không hợp lệ');
        }

        if (description.length < 3 || description.length > 500) {
            throw new Error('Mô tả phải từ 3-500 ký tự');
        }

        if (location && location.length > 255) {
            throw new Error('Vị trí không được quá 255 ký tự');
        }

        try {
            const requestData = {
                status,
                description,
                location: location || null
            };

            const response = await this.put(`/orders/${id}/status`, requestData);

            // Log success
            console.log('Order status updated successfully:', response);
            return response;
        } catch (error) {
            console.error('Update order status error:', error);

            // Xử lý các loại lỗi cụ thể
            if (error.status === 400) {
                throw new Error(error.message || 'Dữ liệu không hợp lệ');
            } else if (error.status === 401) {
                throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
            } else if (error.status === 403) {
                throw new Error('Bạn không có quyền thực hiện thao tác này');
            } else if (error.status === 404) {
                throw new Error('Không tìm thấy đơn hàng');
            } else {
                throw new Error('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
            }
        }
    }

    async searchOrder(orderCode) {
        return this.get(`/orders/search/${orderCode}`);
    }

    // Statistics APIs
    async getOverviewStats(params = {}) {
        return this.get('/stats/overview', params);
    }

    async getStatusStats(params = {}) {
        return this.get('/stats/by-status', params);
    }

    async getTimeStats(params = {}) {
        return this.get('/stats/by-time', params);
    }

    async getCustomerStats(params = {}) {
        return this.get('/stats/by-customer', params);
    }

    async getStaffStats(params = {}) {
        return this.get('/stats/by-staff', params);
    }

    async getDeliveryPerformance(params = {}) {
        return this.get('/stats/delivery-performance', params);
    }

    async getDailyStats(params = {}) {
        return this.get('/stats/daily', params);
    }

    async testStats() {
        return this.get('/stats/test');
    }

    async exportStats(params = {}) {
        return this.get('/stats/export', params);
    }

    // Maps APIs
    async getDirections(origin, destination, mode = 'driving') {
        return this.get('/maps/directions', { origin, destination, mode });
    }

    async calculateDeliveryTime(data) {
        return this.post('/maps/calculate-delivery-time', data);
    }

    async geocode(lat, lng) {
        return this.get('/maps/geocode', { lat, lng });
    }

    async searchPlaces(query, location = '', radius = 5000) {
        return this.get('/maps/places', { query, location, radius });
    }

    async updateOrderCoordinates(id, coordinates) {
        return this.put(`/maps/orders/${id}/coordinates`, coordinates);
    }

    async getOrderRoute(id) {
        return this.get(`/maps/orders/${id}/route`);
    }

    // Users APIs
    async getUsers(params = {}) {
        return this.get('/users', params);
    }

    async getUser(id) {
        return this.get(`/users/${id}`);
    }

    async updateUser(id, userData) {
        return this.put(`/users/${id}`, userData);
    }

    async deleteUser(id) {
        return this.delete(`/users/${id}`);
    }

    async resetUserPassword(id, newPassword) {
        return this.put(`/users/${id}/reset-password`, { new_password: newPassword });
    }

    async getUserStats() {
        return this.get('/users/stats/overview');
    }

    async getStaffList() {
        return this.get('/users/staff/list');
    }

    // Health check
    async healthCheck() {
        return this.get('/health');
    }
}

// Create global API instance
const api = new ApiService();

// Auth helper functions
const auth = {
    isLoggedIn() {
        return !!api.token;
    },

    getUserRole() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.role;
    },

    isAdmin() {
        return this.getUserRole() === 'admin';
    },

    isStaff() {
        const role = this.getUserRole();
        return role === 'staff' || role === 'admin';
    },

    isCustomer() {
        const role = this.getUserRole();
        return role === 'customer' || role === 'staff' || role === 'admin';
    },

    redirectIfNotLoggedIn() {
        if (!this.isLoggedIn()) {
            window.location.href = '../pages/login.html';
        }
    },

    // Chỉ admin mới truy cập được
    redirectIfNotAdmin() {
        if (!this.isAdmin()) {
            const role = this.getUserRole();
            if (role === 'staff') {
                window.location.href = '../pages/staff-dashboard.html';
            } else if (role === 'customer') {
                window.location.href = '../pages/dashboard.html';
            } else {
                window.location.href = '../pages/login.html';
            }
        }
    },

    // Admin và staff có thể truy cập
    redirectIfNotStaff() {
        if (!this.isStaff()) {
            const role = this.getUserRole();
            if (role === 'customer') {
                window.location.href = '../pages/dashboard.html';
            } else {
                window.location.href = '../pages/login.html';
            }
        }
    },

    // Chỉ customer mới truy cập được
    redirectIfNotCustomer() {
        if (!this.isCustomer()) {
            const role = this.getUserRole();
            if (role === 'admin') {
                window.location.href = '../pages/admin-dashboard.html';
            } else if (role === 'staff') {
                window.location.href = '../pages/staff-dashboard.html';
            } else {
                window.location.href = '../pages/login.html';
            }
        }
    },

    // Chỉ customer (không bao gồm staff/admin)
    redirectIfNotCustomerOnly() {
        const role = this.getUserRole();
        if (role !== 'customer') {
            if (role === 'admin') {
                window.location.href = '../pages/admin-dashboard.html';
            } else if (role === 'staff') {
                window.location.href = '../pages/staff-dashboard.html';
            } else {
                window.location.href = '../pages/login.html';
            }
        }
    }
};

// UI Helper functions
const ui = {
    showLoading(element) {
        element.innerHTML = '<div class="loading">Đang tải...</div>';
    },

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-error';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    },

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.textContent = message;
        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    },

    formatCurrency(amount) {
        // Ensure amount is a valid number
        const numAmount = parseFloat(amount) || 0;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(numAmount);
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('vi-VN');
    },

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('vi-VN');
    },

    getStatusBadge(status) {
        const statusMap = {
            'pending': { text: 'Chờ xử lý', class: 'badge-warning' },
            'processing': { text: 'Đang xử lý', class: 'badge-info' },
            'shipping': { text: 'Đang giao', class: 'badge-primary' },
            'delivered': { text: 'Đã giao', class: 'badge-success' },
            'failed': { text: 'Thất bại', class: 'badge-danger' },
            'cancelled': { text: 'Đã hủy', class: 'badge-secondary' }
        };

        const statusInfo = statusMap[status] || { text: status, class: 'badge-secondary' };
        return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
    }
};

// Export for use in other files
window.api = api;
window.auth = auth;
window.ui = ui; 