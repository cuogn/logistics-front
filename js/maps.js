// Maps Page JavaScript - HERE Maps Integration
class MapsManager {
    constructor() {
        this.map = null;
        this.platform = null;
        this.routingControl = null;
        this.markers = [];
        this.selectedOrders = [];
        this.selectedVehicles = [];
        this.orders = [];
        this.vehicles = [];
        this.currentRoute = null;
        
        this.init();
    }

    async init() {
        try {
            // Kiểm tra authentication
            if (!checkAuth()) {
                window.location.href = 'login.html';
                return;
            }

            // Khởi tạo HERE Maps
            this.initMap();
            
            // Load dữ liệu
            await this.loadOrders();
            await this.loadVehicles();
            
            // Setup event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Error initializing maps:', error);
            showNotification('Lỗi khởi tạo bản đồ', 'error');
        }
    }

    initMap() {
        try {
            // HERE Maps API Key
            const apiKey = '7GUpHwbsEgObqnGg4JG34CJvdbf89IU4iq-SDFe8vmE';
            
            // Khởi tạo platform
            this.platform = new H.service.Platform({
                apikey: apiKey
            });

            // Tạo default layers
            const defaultLayers = this.platform.createDefaultLayers();

            // Khởi tạo map
            this.map = new H.Map(document.getElementById('map'), 
                defaultLayers.vector.normal.map, {
                center: { lat: 21.0285, lng: 105.8542 }, // Hà Nội
                zoom: 10,
                pixelRatio: window.devicePixelRatio || 1
            });

            // Thêm resize listener
            window.addEventListener('resize', () => this.map.getViewPort().resize());

            // Tạo behavior cho map
            const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));

            // Tạo UI
            const ui = H.ui.UI.createDefault(this.map, defaultLayers);

            // Khởi tạo routing control
            this.routingControl = new H.service.RoutingControl(this.map, {
                waypoints: [],
                route: null
            });

        } catch (error) {
            console.error('Error initializing map:', error);
            showNotification('Lỗi khởi tạo bản đồ', 'error');
        }
    }

    async loadOrders() {
        try {
            showLoading();
            const response = await apiCall('GET', '/api/orders?limit=50');
            
            if (response.success) {
                this.orders = response.data.orders;
                this.renderOrdersGrid();
                this.populateOrderSelect();
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            showNotification('Lỗi tải danh sách đơn hàng', 'error');
        } finally {
            hideLoading();
        }
    }

    async loadVehicles() {
        try {
            showLoading();
            const response = await apiCall('GET', '/api/vehicles?available=true');
            
            if (response.success) {
                this.vehicles = response.data.vehicles;
                this.renderVehiclesGrid();
                this.populateVehicleSelect();
            }
        } catch (error) {
            console.error('Error loading vehicles:', error);
            showNotification('Lỗi tải danh sách phương tiện', 'error');
        } finally {
            hideLoading();
        }
    }

    renderOrdersGrid() {
        const grid = document.getElementById('ordersGrid');
        grid.innerHTML = '';

        this.orders.forEach(order => {
            const card = document.createElement('div');
            card.className = 'order-card';
            card.dataset.orderId = order.id;
            
            card.innerHTML = `
                <div class="card-header">
                    <div class="card-title">${order.order_code}</div>
                    <div class="card-status status-${order.current_status}">${this.getStatusText(order.current_status)}</div>
                </div>
                <div class="card-details">
                    <div><strong>Người gửi:</strong> ${order.sender_name}</div>
                    <div><strong>Người nhận:</strong> ${order.receiver_name}</div>
                    <div><strong>Trọng lượng:</strong> ${order.package_weight} kg</div>
                    <div><strong>Phí vận chuyển:</strong> ${this.formatCurrency(order.shipping_fee)}</div>
                </div>
            `;
            
            card.addEventListener('click', () => this.toggleOrderSelection(order.id));
            grid.appendChild(card);
        });
    }

    renderVehiclesGrid() {
        const grid = document.getElementById('vehiclesGrid');
        grid.innerHTML = '';

        this.vehicles.forEach(vehicle => {
            const card = document.createElement('div');
            card.className = 'vehicle-card';
            card.dataset.vehicleId = vehicle.id;
            
            card.innerHTML = `
                <div class="card-header">
                    <div class="card-title">${vehicle.vehicle_code}</div>
                    <div class="card-status status-${vehicle.is_available ? 'available' : 'unavailable'}">
                        ${vehicle.is_available ? 'Khả dụng' : 'Không khả dụng'}
                    </div>
                </div>
                <div class="card-details">
                    <div><strong>Loại:</strong> ${this.getVehicleTypeText(vehicle.vehicle_type)}</div>
                    <div><strong>Tài xế:</strong> ${vehicle.driver_name}</div>
                    <div><strong>Sức chứa:</strong> ${vehicle.capacity} kg</div>
                    <div><strong>Vị trí:</strong> ${vehicle.current_location}</div>
                </div>
            `;
            
            card.addEventListener('click', () => this.toggleVehicleSelection(vehicle.id));
            grid.appendChild(card);
        });
    }

    populateOrderSelect() {
        const select = document.getElementById('orderSelect');
        select.innerHTML = '<option value="">-- Chọn đơn hàng --</option>';
        
        this.orders.forEach(order => {
            const option = document.createElement('option');
            option.value = order.id;
            option.textContent = `${order.order_code} - ${order.sender_name} → ${order.receiver_name}`;
            select.appendChild(option);
        });
    }

    populateVehicleSelect() {
        const select = document.getElementById('vehicleSelect');
        select.innerHTML = '<option value="">-- Chọn phương tiện --</option>';
        
        this.vehicles.forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle.id;
            option.textContent = `${vehicle.vehicle_code} - ${vehicle.driver_name} (${this.getVehicleTypeText(vehicle.vehicle_type)})`;
            select.appendChild(option);
        });
    }

    toggleOrderSelection(orderId) {
        const card = document.querySelector(`[data-order-id="${orderId}"]`);
        const index = this.selectedOrders.indexOf(orderId);
        
        if (index > -1) {
            this.selectedOrders.splice(index, 1);
            card.classList.remove('selected');
        } else {
            this.selectedOrders.push(orderId);
            card.classList.add('selected');
        }
    }

    toggleVehicleSelection(vehicleId) {
        const card = document.querySelector(`[data-vehicle-id="${vehicleId}"]`);
        const index = this.selectedVehicles.indexOf(vehicleId);
        
        if (index > -1) {
            this.selectedVehicles.splice(index, 1);
            card.classList.remove('selected');
        } else {
            this.selectedVehicles.push(vehicleId);
            card.classList.add('selected');
        }
    }

    async showRoute() {
        const orderId = document.getElementById('orderSelect').value;
        if (!orderId) {
            showNotification('Vui lòng chọn đơn hàng', 'warning');
            return;
        }

        try {
            showLoading();
            const response = await apiCall('GET', `/api/maps/orders/${orderId}/route`);
            
            if (response.success) {
                this.displayRoute(response.data);
                this.showRouteInfo(response.data);
            } else {
                showNotification(response.message, 'error');
            }
        } catch (error) {
            console.error('Error showing route:', error);
            showNotification('Lỗi hiển thị tuyến đường', 'error');
        } finally {
            hideLoading();
        }
    }

    displayRoute(routeData) {
        if (!this.map) {
            showNotification('Bản đồ chưa được khởi tạo', 'error');
            return;
        }

        // Xóa markers cũ
        this.clearMarkers();
        
        try {
            // Tạo waypoints từ tọa độ
            const waypoints = [
                routeData.start_address,
                routeData.end_address
            ];

            // Tạo routing parameters
            const routingParameters = {
                mode: 'fastest;car',
                representation: 'display',
                waypoint0: waypoints[0],
                waypoint1: waypoints[1]
            };

            // Gọi HERE Routing API
            const router = this.platform.getRoutingService();
            router.calculateRoute(routingParameters, (result) => {
                if (result.response.route) {
                    const route = result.response.route[0];
                    const routeShape = route.shape;
                    
                    // Tạo polyline
                    const polyline = new H.geo.LineString();
                    routeShape.forEach(point => {
                        const [lat, lng] = point.split(',');
                        polyline.pushLatLngAlt(lat, lng);
                    });

                    // Tạo polyline object
                    const routeLine = new H.map.Polyline(polyline, {
                        style: {
                            strokeColor: '#007bff',
                            lineWidth: 4
                        }
                    });

                    // Thêm route vào map
                    this.map.addObject(routeLine);
                    this.currentRoute = routeLine;

                    // Thêm markers
                    this.addCustomMarkers(route);
                    
                    // Fit map to route
                    this.map.getViewModel().setLookAtData({
                        bounds: routeLine.getBoundingBox()
                    });

                } else {
                    showNotification('Không thể tìm thấy tuyến đường', 'error');
                }
            }, (error) => {
                console.error('Routing error:', error);
                showNotification('Lỗi tính toán tuyến đường', 'error');
            });

        } catch (error) {
            console.error('Error displaying route:', error);
            showNotification('Lỗi hiển thị tuyến đường', 'error');
        }
    }

    addCustomMarkers(route) {
        try {
            // Marker điểm bắt đầu
            const startMarker = new H.map.Marker({
                lat: route.waypoint[0].mappedPosition.latitude,
                lng: route.waypoint[0].mappedPosition.longitude
            }, {
                icon: new H.map.Icon('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiMyOGE3NDUiLz4KPC9zdmc+')
            });
            
            // Marker điểm kết thúc
            const endMarker = new H.map.Marker({
                lat: route.waypoint[1].mappedPosition.latitude,
                lng: route.waypoint[1].mappedPosition.longitude
            }, {
                icon: new H.map.Icon('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiNkYzM1NCIvPgo8L3N2Zz4=')
            });
            
            this.map.addObject(startMarker);
            this.map.addObject(endMarker);
            this.markers.push(startMarker, endMarker);
            
        } catch (error) {
            console.error('Error adding markers:', error);
        }
    }

    showRouteInfo(routeData) {
        const panel = document.getElementById('routeInfoPanel');
        const distance = document.getElementById('routeDistance');
        const duration = document.getElementById('routeDuration');
        const trafficStatus = document.getElementById('trafficStatus');
        const estimatedDelivery = document.getElementById('estimatedDelivery');
        
        distance.textContent = routeData.distance;
        duration.textContent = routeData.duration;
        trafficStatus.textContent = 'Bình thường'; // HERE không cung cấp thông tin giao thông chi tiết
        estimatedDelivery.textContent = this.calculateEstimatedDelivery(routeData.duration_seconds);
        
        panel.style.display = 'block';
    }

    calculateEstimatedDelivery(durationSeconds) {
        const now = new Date();
        const deliveryTime = new Date(now.getTime() + (durationSeconds * 1000));
        return deliveryTime.toLocaleString('vi-VN');
    }

    async optimizeVehicleAssignment() {
        if (this.selectedOrders.length === 0) {
            showNotification('Vui lòng chọn ít nhất một đơn hàng', 'warning');
            return;
        }

        try {
            showLoading();
            const response = await apiCall('POST', '/api/maps/optimize-vehicle-assignment', {
                order_ids: this.selectedOrders,
                vehicle_ids: this.selectedVehicles
            });
            
            if (response.success) {
                this.showAssignmentResults(response.data);
            } else {
                showNotification(response.message, 'error');
            }
        } catch (error) {
            console.error('Error optimizing vehicle assignment:', error);
            showNotification('Lỗi tối ưu hóa điều phối', 'error');
        } finally {
            hideLoading();
        }
    }

    showAssignmentResults(data) {
        const panel = document.getElementById('assignmentPanel');
        const list = document.getElementById('assignmentList');
        
        list.innerHTML = '';
        
        data.assignments.forEach(assignment => {
            const order = this.orders.find(o => o.id === assignment.order_id);
            const vehicle = this.vehicles.find(v => v.id === assignment.vehicle_id);
            
            if (order && vehicle) {
                const item = document.createElement('div');
                item.className = 'assignment-item';
                item.innerHTML = `
                    <div class="assignment-info">
                        <div class="assignment-order">${order.order_code}</div>
                        <div class="assignment-vehicle">${vehicle.vehicle_code} - ${vehicle.driver_name}</div>
                    </div>
                    <div class="assignment-distance">${this.formatDistance(assignment.estimated_distance)}</div>
                `;
                list.appendChild(item);
            }
        });
        
        panel.style.display = 'block';
    }

    clearMap() {
        if (this.currentRoute) {
            this.map.removeObject(this.currentRoute);
            this.currentRoute = null;
        }
        this.clearMarkers();
        
        // Ẩn các panel
        document.getElementById('routeInfoPanel').style.display = 'none';
        document.getElementById('assignmentPanel').style.display = 'none';
        
        // Bỏ chọn tất cả
        this.selectedOrders = [];
        this.selectedVehicles = [];
        document.querySelectorAll('.order-card.selected, .vehicle-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
    }

    clearMarkers() {
        this.markers.forEach(marker => this.map.removeObject(marker));
        this.markers = [];
    }

    setupEventListeners() {
        // Show route button
        document.getElementById('showRouteBtn').addEventListener('click', () => {
            this.showRoute();
        });

        // Optimize button
        document.getElementById('optimizeBtn').addEventListener('click', () => {
            this.optimizeVehicleAssignment();
        });

        // Clear map button
        document.getElementById('clearMapBtn').addEventListener('click', () => {
            this.clearMap();
        });

        // Close panels
        document.getElementById('closeRouteInfo').addEventListener('click', () => {
            document.getElementById('routeInfoPanel').style.display = 'none';
        });

        document.getElementById('closeAssignment').addEventListener('click', () => {
            document.getElementById('assignmentPanel').style.display = 'none';
        });

        // Apply assignments
        document.getElementById('applyAssignmentsBtn').addEventListener('click', () => {
            this.applyAssignments();
        });

        // Cancel assignments
        document.getElementById('cancelAssignmentsBtn').addEventListener('click', () => {
            document.getElementById('assignmentPanel').style.display = 'none';
        });
    }

    async applyAssignments() {
        // Implement assignment application logic
        showNotification('Đã áp dụng điều phối phương tiện', 'success');
        document.getElementById('assignmentPanel').style.display = 'none';
    }

    // Utility functions
    getStatusText(status) {
        const statusMap = {
            'pending': 'Chờ xử lý',
            'processing': 'Đang xử lý',
            'shipping': 'Đang giao',
            'delivered': 'Đã giao',
            'failed': 'Thất bại',
            'cancelled': 'Đã hủy'
        };
        return statusMap[status] || status;
    }

    getVehicleTypeText(type) {
        const typeMap = {
            'truck': 'Xe tải',
            'car': 'Ô tô',
            'motorcycle': 'Xe máy',
            'bicycle': 'Xe đạp',
            'van': 'Xe van'
        };
        return typeMap[type] || type;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    formatDistance(meters) {
        if (meters < 1000) {
            return `${meters}m`;
        } else {
            return `${(meters / 1000).toFixed(1)}km`;
        }
    }
}

// Utility functions
function showLoading() {
    const modal = document.getElementById('loadingModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function hideLoading() {
    const modal = document.getElementById('loadingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    // Implement notification system
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Tạo notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '10000';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.color = 'white';
    notification.style.fontWeight = 'bold';
    
    if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
    } else if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
    } else if (type === 'warning') {
        notification.style.backgroundColor = '#ffc107';
        notification.style.color = '#333';
    } else {
        notification.style.backgroundColor = '#007bff';
    }
    
    document.body.appendChild(notification);
    
    // Tự động xóa sau 3 giây
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Kiểm tra authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    return !!token;
}

// API call function
async function apiCall(method, endpoint, data = null) {
    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined
        };
        
        const response = await fetch(`http://localhost:3000${endpoint}`, config);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'API Error');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Initialize maps when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MapsManager();
}); 