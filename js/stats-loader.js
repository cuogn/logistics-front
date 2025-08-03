// Stats Loader for Admin and Staff Dashboards
class StatsLoader {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('user') || '{}');
        this.role = this.user.role;
        this.init();
    }

    init() {
        this.setupLoadingStates();
        this.loadStats();
    }

    setupLoadingStates() {
        // Setup loading spinners for all stat cards
        const statElements = [
            'totalOrders',
            'totalUsers', 
            'totalRevenue',
            'deliveredOrders',
            'pendingOrders',
            'shippingOrders'
        ];

        statElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                // Tạo loading spinner nếu chưa có
                if (!element.querySelector('.loading-spinner')) {
                    const spinner = document.createElement('span');
                    spinner.className = 'loading-spinner';
                    spinner.textContent = '⏳';
                    element.appendChild(spinner);
                }

                // Tạo stat-value element nếu chưa có
                if (!element.querySelector('.stat-value')) {
                    const statValue = document.createElement('span');
                    statValue.className = 'stat-value';
                    statValue.style.display = 'none';
                    element.appendChild(statValue);
                }
            }
        });
    }

    async loadStats() {
        try {
            console.log('🔄 Loading stats data...');
            
            // Show loading state
            this.showStatsLoading(true);
            
            // Load daily stats from statistics table
            const statsResponse = await api.getDailyStats();
            console.log('📊 Stats response:', statsResponse);
            
            if (statsResponse.success && statsResponse.data && statsResponse.data.totals) {
                const totals = statsResponse.data.totals;
                console.log('📈 Totals:', totals);
                
                // Update stats based on role
                if (this.role === 'admin') {
                    this.updateAdminStats(totals);
                } else if (this.role === 'staff') {
                    this.updateStaffStats(totals);
                }
                
                console.log('✅ Stats updated successfully');
            } else {
                console.error('❌ Stats API failed or no data:', statsResponse);
                this.setDefaultStats();
            }

            // Load additional data for admin
            if (this.role === 'admin') {
                await this.loadAdminAdditionalData();
            }

        } catch (error) {
            console.error('❌ Stats load error:', error);
            ui.showError('Không thể tải dữ liệu thống kê');
            this.setDefaultStats();
        } finally {
            // Hide loading state
            this.showStatsLoading(false);
            console.log('🎉 Stats loading complete!');
        }
    }

    updateAdminStats(totals) {
        // Ensure all values are numbers, not NaN
        const totalOrders = parseInt(totals.total_orders) || 0;
        const totalRevenue = parseFloat(totals.total_revenue) || 0;
        const deliveredOrders = parseInt(totals.delivered_orders) || 0;
        
        console.log('💰 Parsed admin values:', { totalOrders, totalRevenue, deliveredOrders });
        
        this.updateStatValue('totalOrders', totalOrders);
        this.updateStatValue('totalRevenue', ui.formatCurrency(totalRevenue));
        this.updateStatValue('deliveredOrders', deliveredOrders);
    }

    updateStaffStats(totals) {
        // Ensure all values are numbers, not NaN
        const totalOrders = parseInt(totals.total_orders) || 0;
        const pendingOrders = parseInt(totals.pending_orders) || 0;
        const shippingOrders = parseInt(totals.shipping_orders) || 0;
        const deliveredOrders = parseInt(totals.delivered_orders) || 0;
        
        console.log('💰 Parsed staff values:', { totalOrders, pendingOrders, shippingOrders, deliveredOrders });
        
        this.updateStatValue('totalOrders', totalOrders);
        this.updateStatValue('pendingOrders', pendingOrders);
        this.updateStatValue('shippingOrders', shippingOrders);
        this.updateStatValue('deliveredOrders', deliveredOrders);
    }

    async loadAdminAdditionalData() {
        try {
            // Load user stats
            console.log('👥 Fetching user stats...');
            const userStatsResponse = await api.getUserStats();
            console.log('👥 User stats response:', userStatsResponse);
            
            if (userStatsResponse.success && userStatsResponse.data) {
                const totalUsers = parseInt(userStatsResponse.data.total_users) || 0;
                this.updateStatValue('totalUsers', totalUsers);
                console.log('✅ User stats updated');
            } else {
                this.updateStatValue('totalUsers', 0);
                console.log('⚠️ Using default user stats');
            }
        } catch (error) {
            console.error('❌ User stats error:', error);
            this.updateStatValue('totalUsers', 0);
        }
    }

    setDefaultStats() {
        if (this.role === 'admin') {
            this.updateStatValue('totalOrders', 0);
            this.updateStatValue('totalRevenue', ui.formatCurrency(0));
            this.updateStatValue('deliveredOrders', 0);
            this.updateStatValue('totalUsers', 0);
        } else if (this.role === 'staff') {
            this.updateStatValue('totalOrders', 0);
            this.updateStatValue('pendingOrders', 0);
            this.updateStatValue('shippingOrders', 0);
            this.updateStatValue('deliveredOrders', 0);
        }
    }

    showStatsLoading(show) {
        const statElements = [
            'totalOrders',
            'totalUsers', 
            'totalRevenue',
            'deliveredOrders',
            'pendingOrders',
            'shippingOrders'
        ];

        statElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                const spinner = element.querySelector('.loading-spinner');
                const statValue = element.querySelector('.stat-value');
                
                if (spinner && statValue) {
                    if (show) {
                        spinner.style.display = 'inline';
                        statValue.style.display = 'none';
                    } else {
                        spinner.style.display = 'none';
                        statValue.style.display = 'inline';
                    }
                }
            }
        });
    }

    updateStatValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            const statValue = element.querySelector('.stat-value');
            const spinner = element.querySelector('.loading-spinner');
            
            if (statValue) {
                statValue.textContent = value;
                statValue.style.display = 'inline';
            }
            
            if (spinner) {
                spinner.style.display = 'none';
            }
        } else {
            console.warn(`⚠️ Element with id '${elementId}' not found`);
        }
    }

    // Refresh stats manually
    refreshStats() {
        console.log('🔄 Refreshing stats...');
        this.loadStats();
    }
}

// Initialize stats loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on admin or staff pages
    const currentPage = window.location.pathname;
    if (currentPage.includes('admin-dashboard') || currentPage.includes('staff-dashboard')) {
        const statsLoader = new StatsLoader();
        
        // Add refresh button functionality if exists
        const refreshBtn = document.querySelector('.refresh-stats');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                statsLoader.refreshStats();
            });
        }
    }
});

// Export for use in other files
window.StatsLoader = StatsLoader; 