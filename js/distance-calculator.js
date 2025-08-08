// Distance Calculator với HERE Maps API
class DistanceCalculator {
    constructor() {
        console.log('Creating DistanceCalculator instance...');
        
        this.map = null;
        this.platform = null;
        this.markers = [];
        this.point1 = null;
        this.point2 = null;
        this.currentStatus = 'ready';
        this.geocodingService = null;
        this.currentRoute = null;
        this.defaultPricePerKm = 5000; // Giá mặc định 5000 VND
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing Distance Calculator...');
            
            // Khởi tạo HERE Maps
            this.initMap();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('Distance Calculator initialized successfully');
            showNotification('✅ Bản đồ đã sẵn sàng! Nhấp để đặt điểm A', 'success');
            
        } catch (error) {
            console.error('Error initializing distance calculator:', error);
            showNotification('Lỗi khởi tạo bản đồ: ' + error.message, 'error');
        }
    }

    initMap() {
        try {
            console.log('Initializing map...');
            
            // HERE Maps API Key - sử dụng cùng key như trong maps.js
            const apiKey = '7GUpHwbsEgObqnGg4JG34CJvdbf89IU4iq-SDFe8vmE';
            
            // Khởi tạo platform
            this.platform = new H.service.Platform({
                apikey: apiKey
            });
            
            console.log('Platform initialized with API key');

            // Tạo default layers
            const defaultLayers = this.platform.createDefaultLayers();
            console.log('Default layers created');

            // Kiểm tra map container
            const mapContainer = document.getElementById('map');
            if (!mapContainer) {
                throw new Error('Map container not found');
            }
            console.log('Map container found:', mapContainer);
            
            // Khởi tạo map
            this.map = new H.Map(mapContainer, 
                defaultLayers.vector.normal.map, {
                center: { lat: 21.0285, lng: 105.8542 }, // Hà Nội
                zoom: 10,
                pixelRatio: window.devicePixelRatio || 1
            });
            
            console.log('Map created successfully with center:', this.map.getCenter());

            // Thêm resize listener
            window.addEventListener('resize', () => {
                try {
                    this.map.getViewPort().resize();
                } catch (error) {
                    console.error('Error resizing map:', error);
                }
            });
            console.log('Resize listener added');

            // Tạo behavior cho map
            const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));
            console.log('Map behavior created');

            // Tạo UI
            const ui = H.ui.UI.createDefault(this.map, defaultLayers);
            console.log('Map UI created');

            // Khởi tạo services (chỉ giữ lại geocoding service nếu cần)
            this.geocodingService = this.platform.getGeocodingService();
            
            console.log('Services initialized:', {
                geocoding: !!this.geocodingService
            });
            
            console.log('Map initialized successfully');

            // Thêm click listener cho map
            this.map.addEventListener('tap', async (event) => {
                console.log('Map clicked!', event);
                await this.handleMapClick(event);
            });
            console.log('Map tap listener added');

            console.log('Map initialized successfully');
            
        } catch (error) {
            console.error('Error initializing map:', error);
            showNotification('Lỗi khởi tạo bản đồ: ' + error.message, 'error');
        }
    }

    async handleMapClick(event) {
        try {
            console.log('Handling map click...', event);
            
            // Lấy tọa độ từ event
            let position;
            if (event.currentPointer && event.currentPointer.viewportX !== undefined) {
                position = this.map.screenToGeo(event.currentPointer.viewportX, event.currentPointer.viewportY);
            } else {
                // Fallback: lấy tọa độ từ map center nếu không có event pointer
                position = this.map.getCenter();
            }
            console.log('Clicked position:', position);
            
            // Kiểm tra xem position có hợp lệ không
            if (!position || !position.lat || !position.lng) {
                console.error('Invalid position:', position);
                showNotification('Lỗi: Không thể xác định vị trí', 'error');
                return;
            }
            
            // Cho phép click trên map để chọn điểm
            // Có thể sử dụng cả dropdown và click trên map
            
            if (!this.point1) {
                // Đặt điểm A
                console.log('Setting point A:', position);
                this.point1 = position;
                this.addMarker(position, 'A');
                this.getAddressFromLatLng(position, 'A');
                this.updateStatus('Nhấp để đặt điểm B');
                this.updateInputs('A', position);
                showNotification('✅ Đã đặt điểm A', 'success');
                
            } else if (!this.point2) {
                // Đặt điểm B
                console.log('Setting point B:', position);
                this.point2 = position;
                this.addMarker(position, 'B');
                this.getAddressFromLatLng(position, 'B');
                this.updateStatus('Đang tính toán khoảng cách...');
                this.updateInputs('B', position);
                
                // Tính khoảng cách
                await this.calculateDistance();
                
            } else {
                // Đã có đủ 2 điểm, thông báo
                showNotification('Đã có đủ 2 điểm. Sử dụng nút "Xóa Điểm" để bắt đầu lại', 'info');
            }
        } catch (error) {
            console.error('Error in handleMapClick:', error);
            showNotification('Lỗi khi xử lý click trên bản đồ', 'error');
        }
    }

    addMarker(position, pointNumber) {
        try {
            console.log('Adding marker for point', pointNumber, 'at position:', position);
            
            // Kiểm tra position
            if (!position || !position.lat || !position.lng) {
                console.error('Invalid position for marker:', position);
                return;
            }
            
            // Tạo marker đơn giản
            const marker = new H.map.Marker(position);
            
            // Thêm label cho marker
            const label = new H.map.DomMarker(position, {
                element: this.createMarkerLabel(pointNumber)
            });
            
            this.map.addObject(marker);
            this.map.addObject(label);
            this.markers.push(marker, label);
            
            console.log('Marker added successfully for point', pointNumber);
            
        } catch (error) {
            console.error('Error adding marker:', error);
            showNotification('Lỗi khi thêm marker', 'error');
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
            z-index: 1000;
            pointer-events: none;
        `;
        label.textContent = pointNumber;
        return label;
    }

    async getAddressFromLatLng(position, pointNumber) {
        try {
            console.log('Getting address for point', pointNumber, 'at position:', position);
            
            const params = {
                at: `${position.lat},${position.lng}`,
                apiKey: '7GUpHwbsEgObqnGg4JG34CJvdbf89IU4iq-SDFe8vmE'
            };
            
            const response = await fetch(`https://revgeocode.search.hereapi.com/v1/revgeocode?${new URLSearchParams(params)}`);
            const data = await response.json();
            
            console.log('Address API response:', data);
            
            if (data.items && data.items.length > 0) {
                const address = data.items[0].address.label;
                this.updateAddressInput(pointNumber, address);
                console.log('Address found:', address);
            } else {
                this.updateAddressInput(pointNumber, 'Không tìm thấy địa chỉ');
                console.log('No address found');
            }
            
        } catch (error) {
            console.error('Error getting address:', error);
            this.updateAddressInput(pointNumber, 'Lỗi tìm địa chỉ');
        }
    }

    async calculateDistance() {
        console.log('calculateDistance called - Point1:', this.point1, 'Point2:', this.point2);
        
        if (!this.point1 || !this.point2) {
            console.log('Missing points - Point1:', !!this.point1, 'Point2:', !!this.point2);
            showNotification('Cần đủ 2 điểm để tính khoảng cách', 'warning');
            return;
        }

        try {
            showLoading();
            this.updateStatus('Đang tính toán tuyến đường...');
            
            // Sử dụng HERE Maps Routing API v8 để tính toán chính xác
            const route = await this.calculateRouteWithAPIv8();
            
            if (route) {
                hideLoading();
                this.displayDistanceInfo(route);
                this.drawRoute(route);
                this.updateStatus('Hoàn thành - Có thể xóa hoặc đổi vị trí');
                showNotification('✅ Đã tính toán tuyến đường thành công', 'success');
            } else {
                // Fallback: sử dụng tính toán đơn giản
                console.log('API failed, using fallback calculation');
                const distance = this.calculateHaversineDistance(this.point1, this.point2);
                const duration = this.estimateTravelTime(distance);
                
                const fallbackRoute = {
                    summary: {
                        distance: distance,
                        travelTime: duration
                    },
                    shape: [
                        `${this.point1.lat},${this.point1.lng}`,
                        `${this.point2.lat},${this.point2.lng}`
                    ]
                };
                
                hideLoading();
                this.displayDistanceInfo(fallbackRoute);
                this.drawRoute(fallbackRoute);
                this.updateStatus('Hoàn thành (ước tính) - Có thể xóa hoặc đổi vị trí');
                showNotification('⚠️ Sử dụng ước tính do lỗi API', 'warning');
            }

        } catch (error) {
            hideLoading();
            console.error('Error calculating distance:', error);
            showNotification('Lỗi tính toán khoảng cách: ' + error.message, 'error');
            this.updateStatus('Lỗi tính toán');
        }
    }

    // Tính khoảng cách bằng công thức Haversine
    calculateHaversineDistance(point1, point2) {
        const R = 6371000; // Bán kính Trái Đất (mét)
        const lat1 = point1.lat * Math.PI / 180;
        const lat2 = point2.lat * Math.PI / 180;
        const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
        const deltaLng = (point2.lng - point1.lng) * Math.PI / 180;

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Khoảng cách tính bằng mét
    }

    // Ước tính thời gian di chuyển (giả sử tốc độ trung bình 40 km/h)
    estimateTravelTime(distanceInMeters) {
        const averageSpeedKmh = 40; // 40 km/h
        const averageSpeedMs = averageSpeedKmh * 1000 / 3600; // Chuyển sang m/s
        return Math.round(distanceInMeters / averageSpeedMs); // Thời gian tính bằng giây
    }

    displayDistanceInfo(route) {
        try {
            console.log('Displaying distance info for route:', route);
            
            const distance = route.summary.distance;
            const duration = route.summary.travelTime;
            
            // Tính giá tiền
            const price = this.calculatePrice(distance);
            const roundedPrice = Math.round(price);
            
            console.log('Distance:', distance, 'Duration:', duration, 'Price:', roundedPrice);
            
            // Hiển thị thông tin
            const distanceElement = document.getElementById('distanceValue');
            const durationElement = document.getElementById('durationValue');
            const transportElement = document.getElementById('transportMode');
            const trafficElement = document.getElementById('trafficStatus');
            const priceElement = document.getElementById('priceValue');
            const infoPanel = document.getElementById('distanceInfo');

            if (distanceElement) distanceElement.textContent = this.formatDistance(distance);
            if (durationElement) durationElement.textContent = this.formatDuration(duration);
            if (transportElement) transportElement.textContent = 'Ô tô';
            if (trafficElement) trafficElement.textContent = this.getTrafficStatus(duration, distance);
            if (priceElement) priceElement.textContent = this.formatPrice(roundedPrice);
            if (infoPanel) infoPanel.style.display = 'block';
            
            // Cập nhật phí vận chuyển trong form nếu có
            const shippingFee = document.getElementById('shippingFee');
            if (shippingFee) {
                shippingFee.value = roundedPrice;
            }
            
            // Cập nhật biến global nếu có
            if (typeof calculatedFee !== 'undefined') {
                calculatedFee = roundedPrice;
            }
            
            console.log('Distance info displayed successfully');
            
        } catch (error) {
            console.error('Error displaying distance info:', error);
        }
    }

    // Xác định tình trạng giao thông dựa trên thời gian di chuyển
    getTrafficStatus(duration, distance) {
        if (!duration || !distance) return 'Không xác định';
        
        const speedKmh = (distance / 1000) / (duration / 3600);
        
        if (speedKmh > 50) return 'Thông thoáng';
        else if (speedKmh > 30) return 'Bình thường';
        else if (speedKmh > 15) return 'Tắc nghẽn';
        else return 'Rất tắc';
    }

    calculatePrice(distanceInMeters) {
        // Chuyển đổi từ mét sang km và nhân với giá mặc định
        if (!distanceInMeters || isNaN(distanceInMeters)) {
            return 0;
        }
        
        const distanceInKm = distanceInMeters / 1000;
        return distanceInKm * this.defaultPricePerKm;
    }

    formatPrice(price) {
        if (!price || isNaN(price)) {
            return '--';
        }
        
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    drawRoute(route) {
        try {
            console.log('Drawing route:', route);
            
            // Xóa route cũ nếu có
            this.clearRoute();
            
            // Tạo polyline từ route coordinates hoặc shape
            const polyline = new H.geo.LineString();
            
            if (route.coordinates && Array.isArray(route.coordinates)) {
                // Sử dụng coordinates chi tiết từ API
                route.coordinates.forEach(coord => {
                    polyline.pushLatLngAlt(coord.lat, coord.lng);
                });
                console.log('Using detailed coordinates:', route.coordinates.length, 'points');
            } else if (route.shape && Array.isArray(route.shape)) {
                // Fallback: sử dụng shape từ route
                route.shape.forEach(point => {
                    const [lat, lng] = point.split(',');
                    polyline.pushLatLngAlt(parseFloat(lat), parseFloat(lng));
                });
                console.log('Using shape coordinates:', route.shape.length, 'points');
            } else {
                // Fallback cuối cùng: đường thẳng
                polyline.pushLatLngAlt(this.point1.lat, this.point1.lng);
                polyline.pushLatLngAlt(this.point2.lat, this.point2.lng);
                console.log('Using straight line fallback');
            }

            // Tạo polyline object với style phù hợp
            const routeLine = new H.map.Polyline(polyline, {
                style: {
                    strokeColor: '#007bff',
                    lineWidth: 6,
                    lineDash: route.coordinates ? [] : [10, 5] // Đường liền nếu có coordinates chi tiết, đứt nét nếu là đường thẳng
                }
            });

            // Thêm route vào map
            this.map.addObject(routeLine);
            this.currentRoute = routeLine;

            // Fit map to route với padding
            try {
                const bounds = routeLine.getBoundingBox();
                this.map.getViewModel().setLookAtData({
                    bounds: bounds,
                    padding: { top: 50, right: 50, bottom: 50, left: 50 }
                });
            } catch (error) {
                console.error('Error fitting map to route:', error);
                // Fallback: fit to points
                const points = [this.point1, this.point2];
                const bounds = new H.geo.Rect(
                    Math.min(...points.map(p => p.lat)),
                    Math.min(...points.map(p => p.lng)),
                    Math.max(...points.map(p => p.lat)),
                    Math.max(...points.map(p => p.lng))
                );
                this.map.getViewModel().setLookAtData({
                    bounds: bounds,
                    padding: { top: 50, right: 50, bottom: 50, left: 50 }
                });
            }
            
            console.log('Route drawn successfully');
            
        } catch (error) {
            console.error('Error drawing route:', error);
            showNotification('Lỗi vẽ tuyến đường', 'error');
        }
    }

    clearRoute() {
        if (this.currentRoute) {
            try {
                this.map.removeObject(this.currentRoute);
            } catch (error) {
                console.error('Error removing route:', error);
            }
            this.currentRoute = null;
        }
    }

    clearPoints() {
        console.log('Clearing all points...');
        
        // Xóa markers
        this.markers.forEach(marker => {
            try {
                this.map.removeObject(marker);
            } catch (error) {
                console.error('Error removing marker:', error);
            }
        });
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
        const infoPanel = document.getElementById('distanceInfo');
        if (infoPanel) {
            infoPanel.style.display = 'none';
        }
        
        showNotification('🗑️ Đã xóa tất cả điểm', 'success');
    }

    async swapPoints() {
        if (!this.point1 || !this.point2) {
            showNotification('Cần đủ 2 điểm để đổi vị trí', 'warning');
            return;
        }

        console.log('Swapping points...');

        // Đổi vị trí
        const temp = this.point1;
        this.point1 = this.point2;
        this.point2 = temp;

        // Xóa markers cũ
        this.markers.forEach(marker => {
            try {
                this.map.removeObject(marker);
            } catch (error) {
                console.error('Error removing marker during swap:', error);
            }
        });
        this.markers = [];

        // Thêm lại markers với vị trí mới
        this.addMarker(this.point1, 'A');
        this.addMarker(this.point2, 'B');

        // Cập nhật inputs
        this.updateInputs('A', this.point1);
        this.updateInputs('B', this.point2);

        // Tính lại khoảng cách
        await this.calculateDistance();

        showNotification('🔄 Đã đổi vị trí 2 điểm', 'success');
    }

    getDirections() {
        if (!this.point1 || !this.point2) {
            showNotification('Cần đủ 2 điểm để lấy chỉ đường', 'warning');
            return;
        }

        console.log('Getting directions...');

        try {
            // Sử dụng HERE Maps Directions API
            const API_KEY = '7GUpHwbsEgObqnGg4JG34CJvdbf89IU4iq-SDFe8vmE';
            const url = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${this.point1.lat},${this.point1.lng}&destination=${this.point2.lat},${this.point2.lng}&return=summary,guidance&apikey=${API_KEY}`;
            
            // Mở trong tab mới với thông tin chi tiết
            const directionsUrl = `https://route.here.com/directions/v2/route?transportMode=car&origin=${this.point1.lat},${this.point1.lng}&destination=${this.point2.lat},${this.point2.lng}&return=summary,guidance&apikey=${API_KEY}`;
            
            window.open(directionsUrl, '_blank');
            showNotification('🌐 Đã mở chỉ đường chi tiết trong tab mới', 'success');
            
        } catch (error) {
            console.error('Error opening directions:', error);
            showNotification('Lỗi mở chỉ đường', 'error');
        }
    }

    reset() {
        console.log('Resetting distance calculator...');
        this.clearPoints();
        this.updateStatus('Sẵn sàng - Nhấp để đặt điểm A');
        showNotification('🔄 Đã làm mới ứng dụng', 'success');
    }

    updateStatus(message) {
        const statusElement = document.getElementById('statusIndicator');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    updateInputs(point, position) {
        if (point === 'A') {
            const latElement = document.getElementById('pointALat');
            const lngElement = document.getElementById('pointALng');
            if (latElement) latElement.value = position.lat.toFixed(6);
            if (lngElement) lngElement.value = position.lng.toFixed(6);
        } else if (point === 'B') {
            const latElement = document.getElementById('pointBLat');
            const lngElement = document.getElementById('pointBLng');
            if (latElement) latElement.value = position.lat.toFixed(6);
            if (lngElement) lngElement.value = position.lng.toFixed(6);
        }
    }

    updateAddressInput(point, address) {
        console.log(`Updating address for point ${point}:`, address);
        
        if (point === 'A') {
            const addressElement = document.getElementById('pointAAddress');
            if (addressElement) {
                addressElement.value = address;
                console.log('Updated pointAAddress:', address);
            }
            
            // Cập nhật vào senderAddress
            const senderAddress = document.getElementById('senderAddress');
            if (senderAddress) {
                senderAddress.value = address;
                console.log('Updated senderAddress:', address);
            }
            
            this.point1Address = address;
            console.log('Updated this.point1Address:', address);
        } else if (point === 'B') {
            const addressElement = document.getElementById('pointBAddress');
            if (addressElement) {
                addressElement.value = address;
                console.log('Updated pointBAddress:', address);
            }
            
            // Cập nhật vào receiverAddress
            const receiverAddress = document.getElementById('receiverAddress');
            if (receiverAddress) {
                receiverAddress.value = address;
                console.log('Updated receiverAddress:', address);
            }
            
            this.point2Address = address;
            console.log('Updated this.point2Address:', address);
        }
    }

    resetInputs() {
        const elements = [
            'pointALat', 'pointALng', 'pointAAddress',
            'pointBLat', 'pointBLng', 'pointBAddress'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Calculate button
        const calculateBtn = document.getElementById('calculateBtn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', async () => {
                console.log('Calculate button clicked');
                await this.calculateDistance();
            });
            console.log('Calculate button listener added');
        } else {
            console.warn('Calculate button not found');
        }
        
        // Clear button
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                console.log('Clear button clicked');
                this.clearPoints();
            });
            console.log('Clear button listener added');
        } else {
            console.warn('Clear button not found');
        }

        // Swap button
        const swapBtn = document.getElementById('swapBtn');
        if (swapBtn) {
            swapBtn.addEventListener('click', async () => {
                console.log('Swap button clicked');
                await this.swapPoints();
            });
            console.log('Swap button listener added');
        } else {
            console.warn('Swap button not found');
        }

        // Get directions button
        const getDirectionsBtn = document.getElementById('getDirectionsBtn');
        if (getDirectionsBtn) {
            getDirectionsBtn.addEventListener('click', () => {
                console.log('Get directions button clicked');
                this.getDirections();
            });
            console.log('Get directions button listener added');
        } else {
            console.warn('Get directions button not found');
        }

        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('Reset button clicked');
                this.reset();
            });
            console.log('Reset button listener added');
        } else {
            console.warn('Reset button not found');
        }
        
        console.log('Event listeners setup completed');
    }

    // Utility functions
    formatDistance(meters) {
        if (!meters || isNaN(meters)) {
            return '--';
        }
        
        if (meters < 1000) {
            return `${Math.round(meters)}m`;
        } else {
            return `${(meters / 1000).toFixed(1)}km`;
        }
    }

    formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) {
            return '--';
        }
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    // Tính toán tuyến đường sử dụng HERE Maps API v8
    async calculateRouteWithAPIv8() {
        try {
            console.log('Calculating route with HERE Maps API v8...');
            
            const API_KEY = '7GUpHwbsEgObqnGg4JG34CJvdbf89IU4iq-SDFe8vmE';
            const url = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${this.point1.lat},${this.point1.lng}&destination=${this.point2.lat},${this.point2.lng}&return=summary,polyline&apikey=${API_KEY}`;
            
            console.log('Calling HERE Maps API v8:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const section = route.sections[0];
                
                // Decode polyline để có tọa độ chi tiết
                const coordinates = this.decodePolyline(section.polyline);
                
                return {
                    summary: {
                        distance: section.summary.length, // Khoảng cách tính bằng mét
                        travelTime: section.summary.duration // Thời gian tính bằng giây
                    },
                    shape: coordinates.map(coord => `${coord.lat},${coord.lng}`),
                    coordinates: coordinates
                };
            } else {
                throw new Error('No routes found in response');
            }
            
        } catch (error) {
            console.error('Error in calculateRouteWithAPIv8:', error);
            return null;
        }
    }

    // Decode polyline từ HERE Maps API
    decodePolyline(encoded) {
        if (!encoded || typeof encoded !== 'string') {
            console.log('Invalid polyline string:', encoded);
            return [];
        }
        
        console.log('Decoding polyline:', encoded.substring(0, 50) + '...');
        
        const poly = [];
        let index = 0, len = encoded.length;
        let lat = 0, lng = 0;

        try {
            while (index < len) {
                let b, shift = 0, result = 0;
                do {
                    b = encoded.charCodeAt(index++) - 63;
                    result |= (b & 0x1f) << shift;
                    shift += 5;
                } while (b >= 0x20);
                let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
                lat += dlat;

                shift = 0;
                result = 0;
                do {
                    b = encoded.charCodeAt(index++) - 63;
                    result |= (b & 0x1f) << shift;
                    shift += 5;
                } while (b >= 0x20);
                let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
                lng += dlng;

                const latCoord = lat / 1E5;
                const lngCoord = lng / 1E5;
                
                // Validate coordinates
                if (latCoord >= -90 && latCoord <= 90 && lngCoord >= -180 && lngCoord <= 180) {
                    poly.push({ lat: latCoord, lng: lngCoord });
                } else {
                    console.log('Skipping invalid coordinate:', latCoord, lngCoord);
                }
            }
        } catch (error) {
            console.error('Error decoding polyline:', error);
            return [];
        }
        
        console.log('Decoded polyline coordinates:', poly.length, 'valid points');
        return poly;
    }
}

// Utility functions
function showLoading() {
    const modal = document.getElementById('loadingModal');
    if (modal) {
        modal.style.display = 'flex';
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
    notification.style.fontSize = '14px';
    notification.style.minWidth = '300px';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    
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
    console.log('DOM Content Loaded - Initializing Distance Calculator');
    
    // Kiểm tra xem HERE Maps API đã load chưa
    if (typeof H === 'undefined') {
        console.error('HERE Maps API not loaded');
        showNotification('Lỗi: HERE Maps API chưa được tải', 'error');
        return;
    }
    
    // Kiểm tra xem map container có tồn tại không
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Map container not found');
        showNotification('Lỗi: Không tìm thấy container bản đồ', 'error');
        return;
    }
    
    // Kiểm tra xem có đang chạy trên HTTPS hoặc localhost không (để tránh CORS)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        console.warn('Running on non-secure protocol. CORS issues may occur.');
        showNotification('Cảnh báo: Nên chạy trên HTTPS hoặc localhost để tránh lỗi CORS', 'warning');
    }
    
    try {
        new DistanceCalculator();
    } catch (error) {
        console.error('Error creating DistanceCalculator instance:', error);
        showNotification('Lỗi khởi tạo ứng dụng: ' + error.message, 'error');
    }
}); 