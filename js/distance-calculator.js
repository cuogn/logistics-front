// Distance Calculator với HERE Maps API
class DistanceCalculator {
    constructor() {
        this.map = null;
        this.platform = null;
        this.markers = [];
        this.point1 = null;
        this.point2 = null;
        this.currentStatus = 'ready';
        this.routingService = null;
        this.geocodingService = null;
        this.reverseGeocodingService = null;
        
        this.init();
    }

    async init() {
        try {
            // Khởi tạo HERE Maps
            this.initMap();
            
            // Setup event listeners
            this.setupEventListeners();
            
            showNotification('✅ Bản đồ đã sẵn sàng! Nhấp để đặt điểm A', 'success');
            
        } catch (error) {
            console.error('Error initializing distance calculator:', error);
            showNotification('Lỗi khởi tạo bản đồ', 'error');
        }
    }

    initMap() {
        try {
            // HERE Maps API Key - sử dụng cùng key như trong maps.js
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

            // Khởi tạo services
            this.routingService = this.platform.getRoutingService();
            this.geocodingService = this.platform.getGeocodingService();
            this.reverseGeocodingService = this.platform.getReverseGeocodingService();

            // Thêm click listener cho map
            this.map.addEventListener('tap', (event) => {
                this.handleMapClick(event);
            });

        } catch (error) {
            console.error('Error initializing map:', error);
            showNotification('Lỗi khởi tạo bản đồ', 'error');
        }
    }

    handleMapClick(event) {
        const position = this.map.screenToGeo(event.currentPointer.viewportX, event.currentPointer.viewportY);
        
        if (!this.point1) {
            // Đặt điểm A
            this.point1 = position;
            this.addMarker(position, 'A');
            this.getAddressFromLatLng(position, 'A');
            this.updateStatus('Nhấp để đặt điểm B');
            this.updateInputs('A', position);
            
        } else if (!this.point2) {
            // Đặt điểm B
            this.point2 = position;
            this.addMarker(position, 'B');
            this.getAddressFromLatLng(position, 'B');
            this.updateStatus('Đang tính toán khoảng cách...');
            this.updateInputs('B', position);
            
            // Tính khoảng cách
            this.calculateDistance();
            
        } else {
            // Đã có đủ 2 điểm, thông báo
            showNotification('Đã có đủ 2 điểm. Sử dụng nút "Xóa Điểm" để bắt đầu lại', 'info');
        }
    }

    addMarker(position, pointNumber) {
        try {
            // Tạo icon cho marker
            const iconUrl = pointNumber === 'A' 
                ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiMyOGE3NDUiLz4KPC9zdmc+'
                : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiNkYzM1NCIvPgo8L3N2Zz4=';
            
            const marker = new H.map.Marker(position, {
                icon: new H.map.Icon(iconUrl)
            });
            
            // Thêm label cho marker
            const label = new H.map.DomMarker(position, {
                element: this.createMarkerLabel(pointNumber)
            });
            
            this.map.addObject(marker);
            this.map.addObject(label);
            this.markers.push(marker, label);
            
        } catch (error) {
            console.error('Error adding marker:', error);
        }
    }

    createMarkerLabel(pointNumber) {
        const label = document.createElement('div');
        label.style.cssText = `
            background: ${pointNumber === 'A' ? '#28a745' : '#dc3545'};
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;
        label.textContent = pointNumber;
        return label;
    }

    async getAddressFromLatLng(position, pointNumber) {
        try {
            const params = {
                at: `${position.lat},${position.lng}`,
                apiKey: '7GUpHwbsEgObqnGg4JG34CJvdbf89IU4iq-SDFe8vmE'
            };
            
            const response = await fetch(`https://revgeocode.search.hereapi.com/v1/revgeocode?${new URLSearchParams(params)}`);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const address = data.items[0].address.label;
                this.updateAddressInput(pointNumber, address);
            } else {
                this.updateAddressInput(pointNumber, 'Không tìm thấy địa chỉ');
            }
            
        } catch (error) {
            console.error('Error getting address:', error);
            this.updateAddressInput(pointNumber, 'Lỗi tìm địa chỉ');
        }
    }

    calculateDistance() {
        if (!this.point1 || !this.point2) {
            showNotification('Cần đủ 2 điểm để tính khoảng cách', 'warning');
            return;
        }

        try {
            showLoading();
            
            // Tạo routing parameters
            const routingParameters = {
                mode: 'fastest;car',
                representation: 'display',
                waypoint0: `${this.point1.lat},${this.point1.lng}`,
                waypoint1: `${this.point2.lat},${this.point2.lng}`
            };

            // Gọi HERE Routing API
            this.routingService.calculateRoute(routingParameters, (result) => {
                hideLoading();
                
                if (result.response.route) {
                    const route = result.response.route[0];
                    this.displayDistanceInfo(route);
                    this.drawRoute(route);
                    this.updateStatus('Hoàn thành - Có thể xóa hoặc đổi vị trí');
                } else {
                    showNotification('Không thể tính toán tuyến đường', 'error');
                    this.updateStatus('Lỗi tính toán');
                }
            }, (error) => {
                hideLoading();
                console.error('Routing error:', error);
                showNotification('Lỗi tính toán tuyến đường', 'error');
                this.updateStatus('Lỗi tính toán');
            });

        } catch (error) {
            hideLoading();
            console.error('Error calculating distance:', error);
            showNotification('Lỗi tính toán khoảng cách', 'error');
        }
    }

    displayDistanceInfo(route) {
        try {
            const distance = route.summary.distance;
            const duration = route.summary.travelTime;
            
            // Hiển thị thông tin
            document.getElementById('distanceValue').textContent = this.formatDistance(distance);
            document.getElementById('durationValue').textContent = this.formatDuration(duration);
            document.getElementById('transportMode').textContent = 'Ô tô';
            document.getElementById('trafficStatus').textContent = 'Bình thường';
            
            // Hiển thị panel thông tin
            document.getElementById('distanceInfo').style.display = 'block';
            
            showNotification(`✅ Khoảng cách: ${this.formatDistance(distance)}, Thời gian: ${this.formatDuration(duration)}`, 'success');
            
        } catch (error) {
            console.error('Error displaying distance info:', error);
        }
    }

    drawRoute(route) {
        try {
            // Xóa route cũ nếu có
            this.clearRoute();
            
            // Tạo polyline từ route shape
            const polyline = new H.geo.LineString();
            route.shape.forEach(point => {
                const [lat, lng] = point.split(',');
                polyline.pushLatLngAlt(parseFloat(lat), parseFloat(lng));
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

            // Fit map to route
            this.map.getViewModel().setLookAtData({
                bounds: routeLine.getBoundingBox()
            });
            
        } catch (error) {
            console.error('Error drawing route:', error);
        }
    }

    clearRoute() {
        if (this.currentRoute) {
            this.map.removeObject(this.currentRoute);
            this.currentRoute = null;
        }
    }

    clearPoints() {
        // Xóa markers
        this.markers.forEach(marker => this.map.removeObject(marker));
        this.markers = [];
        
        // Xóa route
        this.clearRoute();
        
        // Reset points
        this.point1 = null;
        this.point2 = null;
        
        // Reset inputs
        this.resetInputs();
        
        // Reset status
        this.updateStatus('Sẵn sàng - Nhấp để đặt điểm A');
        
        // Ẩn thông tin khoảng cách
        document.getElementById('distanceInfo').style.display = 'none';
        
        showNotification('🗑️ Đã xóa tất cả điểm', 'success');
    }

    swapPoints() {
        if (!this.point1 || !this.point2) {
            showNotification('Cần đủ 2 điểm để đổi vị trí', 'warning');
            return;
        }

        // Đổi vị trí
        const temp = this.point1;
        this.point1 = this.point2;
        this.point2 = temp;

        // Xóa markers cũ
        this.markers.forEach(marker => this.map.removeObject(marker));
        this.markers = [];

        // Thêm lại markers với vị trí mới
        this.addMarker(this.point1, 'A');
        this.addMarker(this.point2, 'B');

        // Cập nhật inputs
        this.updateInputs('A', this.point1);
        this.updateInputs('B', this.point2);

        // Tính lại khoảng cách
        this.calculateDistance();

        showNotification('🔄 Đã đổi vị trí 2 điểm', 'success');
    }

    getDirections() {
        if (!this.point1 || !this.point2) {
            showNotification('Cần đủ 2 điểm để lấy chỉ đường', 'warning');
            return;
        }

        // Tạo URL cho chỉ đường
        const url = `https://route.here.com/directions/v2/route?app_id=YOUR_APP_ID&app_code=YOUR_APP_CODE&waypoint0=${this.point1.lat},${this.point1.lng}&waypoint1=${this.point2.lat},${this.point2.lng}&mode=fastest;car`;
        
        // Mở trong tab mới
        window.open(url, '_blank');
        
        showNotification('🌐 Đã mở chỉ đường trong tab mới', 'success');
    }

    reset() {
        this.clearPoints();
        this.updateStatus('Sẵn sàng - Nhấp để đặt điểm A');
    }

    updateStatus(message) {
        document.getElementById('statusIndicator').textContent = message;
    }

    updateInputs(point, position) {
        if (point === 'A') {
            document.getElementById('pointALat').value = position.lat.toFixed(6);
            document.getElementById('pointALng').value = position.lng.toFixed(6);
        } else if (point === 'B') {
            document.getElementById('pointBLat').value = position.lat.toFixed(6);
            document.getElementById('pointBLng').value = position.lng.toFixed(6);
        }
    }

    updateAddressInput(point, address) {
        if (point === 'A') {
            document.getElementById('pointAAddress').value = address;
        } else if (point === 'B') {
            document.getElementById('pointBAddress').value = address;
        }
    }

    resetInputs() {
        document.getElementById('pointALat').value = '';
        document.getElementById('pointALng').value = '';
        document.getElementById('pointAAddress').value = '';
        document.getElementById('pointBLat').value = '';
        document.getElementById('pointBLng').value = '';
        document.getElementById('pointBAddress').value = '';
    }

    setupEventListeners() {
        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearPoints();
        });

        // Swap button
        document.getElementById('swapBtn').addEventListener('click', () => {
            this.swapPoints();
        });

        // Get directions button
        document.getElementById('getDirectionsBtn').addEventListener('click', () => {
            this.getDirections();
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
    }

    // Utility functions
    formatDistance(meters) {
        if (meters < 1000) {
            return `${meters}m`;
        } else {
            return `${(meters / 1000).toFixed(1)}km`;
        }
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
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

// Initialize distance calculator when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DistanceCalculator();
}); 