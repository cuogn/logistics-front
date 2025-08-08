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
            
            // Validate coordinates for Vietnam
            const lat = parseFloat(position.lat);
            const lng = parseFloat(position.lng);
            
            console.log('Parsed click coordinates:', lat, lng);
            
            // Check if coordinates are reasonable for Vietnam
            if (lat < 8 || lat > 24 || lng < 102 || lng > 110) {
                console.warn('Click coordinates outside Vietnam range:', lat, lng);
                showNotification('Cảnh báo: Tọa độ nằm ngoài phạm vi Việt Nam', 'warning');
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
            
            // Sử dụng HERE Maps Routing Service v8 để tính toán chính xác
            const route = await this.calculateRouteWithAPIv8();
            
            if (route) {
                // Debug route information
                this.debugRoute(route);
                
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
                    ],
                    coordinates: [
                        { lat: this.point1.lat, lng: this.point1.lng },
                        { lat: this.point2.lat, lng: this.point2.lng }
                    ]
                };
                
                // Debug fallback route
                this.debugRoute(fallbackRoute);
                
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
            
            let routeLine;
            
            if (route.multiLineString) {
                // Sử dụng MultiLineString từ HERE Maps Routing Service
                console.log('Using MultiLineString for route');
                
                routeLine = new H.map.Polyline(route.multiLineString, {
                    style: {
                        strokeColor: '#007bff',
                        lineWidth: 6
                    }
                });
                
                console.log('Route drawn with MultiLineString');
                
            } else if (route.coordinates && Array.isArray(route.coordinates) && route.coordinates.length > 0) {
                // Fallback: sử dụng coordinates
                console.log('Using coordinates for route');
                
                const polyline = new H.geo.LineString();
                route.coordinates.forEach(coord => {
                    polyline.pushLatLngAlt(coord.lat, coord.lng);
                });
                
                routeLine = new H.map.Polyline(polyline, {
                    style: {
                        strokeColor: '#007bff',
                        lineWidth: 6
                    }
                });
                
                console.log('Route drawn with coordinates');
                
            } else if (route.shape && Array.isArray(route.shape) && route.shape.length > 0) {
                // Fallback: sử dụng shape từ route
                console.log('Using shape coordinates for route');
                
                const polyline = new H.geo.LineString();
                route.shape.forEach(point => {
                    const [lat, lng] = point.split(',');
                    polyline.pushLatLngAlt(parseFloat(lat), parseFloat(lng));
                });
                
                routeLine = new H.map.Polyline(polyline, {
                    style: {
                        strokeColor: '#007bff',
                        lineWidth: 6,
                        lineDash: [10, 5] // Đường đứt nét cho fallback
                    }
                });
                
            } else {
                // Fallback cuối cùng: đường thẳng
                console.log('Using straight line fallback');
                
                const polyline = new H.geo.LineString();
                polyline.pushLatLngAlt(this.point1.lat, this.point1.lng);
                polyline.pushLatLngAlt(this.point2.lat, this.point2.lng);
                
                routeLine = new H.map.Polyline(polyline, {
                    style: {
                        strokeColor: '#ff6b6b', // Màu đỏ cho đường thẳng (cảnh báo)
                        lineWidth: 4,
                        lineDash: [10, 5]
                    }
                });
                
                showNotification('⚠️ Sử dụng đường thẳng do lỗi API', 'warning');
            }
            
            // Thêm route vào map
            this.map.addObject(routeLine);
            this.currentRoute = routeLine;
            
            // Fit map to route
            if (route.multiLineString) {
                // Sử dụng bounds của MultiLineString
                this.fitMapToRoute(routeLine);
            } else {
                // Sử dụng bounds của Polyline
                this.fitMapToRoute(routeLine);
            }
            
            console.log('Route drawn successfully');
            
        } catch (error) {
            console.error('Error drawing route:', error);
            showNotification('Lỗi vẽ tuyến đường', 'error');
        }
    }

    // Phương thức mới để fit map vào tuyến đường
    fitMapToRoute(routeLine) {
        try {
            console.log('Fitting map to route...');
            
            // Lấy bounds của route
            const bounds = routeLine.getBoundingBox();
            
            if (bounds) {
                // Validate bounds to ensure they're reasonable for Vietnam
                const top = bounds.getTop();
                const bottom = bounds.getBottom();
                const left = bounds.getLeft();
                const right = bounds.getRight();
                
                console.log('Route bounds:', { top, bottom, left, right });
                
                // Check if bounds are reasonable for Vietnam
                if (top < 8 || top > 24 || bottom < 8 || bottom > 24 ||
                    left < 102 || left > 110 || right < 102 || right > 110) {
                    console.warn('Route bounds outside Vietnam range, using point-based fit');
                    this.fitMapToPoints();
                    return;
                }
                
                // Tính toán padding dựa trên kích thước route
                const latDiff = top - bottom;
                const lngDiff = right - left;
                
                console.log('Route dimensions:', { latDiff, lngDiff });
                
                // Padding động dựa trên khoảng cách
                let padding = { top: 50, right: 50, bottom: 50, left: 50 };
                
                if (latDiff > 1 || lngDiff > 1) {
                    // Route dài, giảm padding
                    padding = { top: 20, right: 20, bottom: 20, left: 20 };
                } else if (latDiff < 0.01 || lngDiff < 0.01) {
                    // Route ngắn, tăng padding
                    padding = { top: 100, right: 100, bottom: 100, left: 100 };
                }
                
                console.log('Fitting map with bounds:', bounds, 'padding:', padding);
                
                this.map.getViewModel().setLookAtData({
                    bounds: bounds,
                    padding: padding
                });
                
                console.log('Map fitted successfully');
            } else {
                // Fallback: fit to points
                console.log('No route bounds, falling back to points');
                this.fitMapToPoints();
            }
            
        } catch (error) {
            console.error('Error fitting map to route:', error);
            // Fallback: fit to points
            this.fitMapToPoints();
        }
    }

    // Phương thức fallback để fit map vào 2 điểm
    fitMapToPoints() {
        try {
            console.log('Fitting map to points...');
            console.log('Point 1:', this.point1);
            console.log('Point 2:', this.point2);
            
            // Validate coordinates first
            if (!this.point1 || !this.point2 || 
                !this.point1.lat || !this.point1.lng || 
                !this.point2.lat || !this.point2.lng) {
                console.error('Invalid coordinates for points');
                return;
            }
            
            // Ensure coordinates are numbers
            const lat1 = parseFloat(this.point1.lat);
            const lng1 = parseFloat(this.point1.lng);
            const lat2 = parseFloat(this.point2.lat);
            const lng2 = parseFloat(this.point2.lng);
            
            console.log('Parsed coordinates - Point 1:', lat1, lng1);
            console.log('Parsed coordinates - Point 2:', lat2, lng2);
            
            // Validate coordinate ranges for Vietnam
            if (lat1 < 8 || lat1 > 24 || lng1 < 102 || lng1 > 110 ||
                lat2 < 8 || lat2 > 24 || lng2 < 102 || lng2 > 110) {
                console.warn('Coordinates outside Vietnam range, but proceeding...');
            }
            
            // Calculate bounds manually to ensure accuracy
            const minLat = Math.min(lat1, lat2);
            const maxLat = Math.max(lat1, lat2);
            const minLng = Math.min(lng1, lng2);
            const maxLng = Math.max(lng1, lng2);
            
            console.log('Calculated bounds:', { minLat, maxLat, minLng, maxLng });
            
            // Add padding to bounds
            const latPadding = (maxLat - minLat) * 0.2; // 20% padding
            const lngPadding = (maxLng - minLng) * 0.2;
            
            const paddedBounds = new H.geo.Rect(
                minLat - latPadding,
                minLng - lngPadding,
                maxLat + latPadding,
                maxLng + lngPadding
            );
            
            console.log('Padded bounds:', paddedBounds);
            
            // Set map view with bounds
            this.map.getViewModel().setLookAtData({
                bounds: paddedBounds,
                padding: { top: 50, right: 50, bottom: 50, left: 50 }
            });
            
            console.log('Map fitted to points successfully');
            
        } catch (error) {
            console.error('Error fitting map to points:', error);
            // Fallback cuối cùng: zoom vào điểm giữa với zoom level cố định
            const centerLat = (this.point1.lat + this.point2.lat) / 2;
            const centerLng = (this.point1.lng + this.point2.lng) / 2;
            
            console.log('Using center fallback:', centerLat, centerLng);
            
            this.map.getViewModel().setLookAtData({
                center: { lat: centerLat, lng: centerLng },
                zoom: 8 // Zoom level phù hợp cho Việt Nam
            });
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

    // Tính toán tuyến đường sử dụng HERE Maps Routing Service v8
    async calculateRouteWithAPIv8() {
        try {
            console.log('Calculating route with HERE Maps Routing Service v8...');
            
            // Sử dụng HERE Maps Routing Service v8
            const router = this.platform.getRoutingService(null, 8);
            
            // Tạo parameters cho routing request
            const routingParameters = {
                routingMode: "fast",
                transportMode: "car",
                origin: `${this.point1.lat},${this.point1.lng}`,
                destination: `${this.point2.lat},${this.point2.lng}`,
                return: "polyline"
            };
            
            console.log('Routing parameters:', routingParameters);
            
            // Sử dụng Promise để handle async routing
            return new Promise((resolve, reject) => {
                const onResult = (result) => {
                    try {
                        console.log('Routing result:', result);
                        
                        // Debug cấu trúc response
                        if (result.routes && result.routes.length > 0) {
                            const route = result.routes[0];
                            console.log('Route structure:', route);
                            console.log('Route sections:', route.sections);
                            
                            if (route.sections && route.sections.length > 0) {
                                const firstSection = route.sections[0];
                                console.log('First section:', firstSection);
                                console.log('Section summary:', firstSection.summary);
                                console.log('Section polyline:', firstSection.polyline ? firstSection.polyline.substring(0, 50) + '...' : 'No polyline');
                            }
                        }
                        
                        // Đảm bảo có ít nhất một route
                        if (result.routes && result.routes.length > 0) {
                            const route = result.routes[0];
                            console.log('Route found:', route);
                            
                            const lineStrings = [];
                            
                            // Xử lý từng section của route
                            route.sections.forEach((section, index) => {
                                console.log(`Processing section ${index}:`, section);
                                
                                // Tạo LineString từ polyline sử dụng fromFlexiblePolyline
                                try {
                                    const lineString = H.geo.LineString.fromFlexiblePolyline(section.polyline);
                                    lineStrings.push(lineString);
                                    console.log(`LineString ${index} created from polyline`);
                                } catch (error) {
                                    console.error(`Error creating LineString ${index} from polyline:`, error);
                                    // Fallback: tạo LineString từ coordinates
                                    if (section.polyline) {
                                        const coordinates = this.decodePolyline(section.polyline);
                                        const fallbackLineString = new H.geo.LineString();
                                        coordinates.forEach(coord => {
                                            fallbackLineString.pushLatLngAlt(coord.lat, coord.lng);
                                        });
                                        lineStrings.push(fallbackLineString);
                                        console.log(`Fallback LineString ${index} created with ${coordinates.length} points`);
                                    }
                                }
                            });
                            
                            if (lineStrings.length > 0) {
                                // Tạo MultiLineString
                                const multiLineString = new H.geo.MultiLineString(lineStrings);
                                
                                // Tính toán khoảng cách và thời gian từ section
                                let totalDistance = 0;
                                let totalDuration = 0;
                                
                                route.sections.forEach((section, index) => {
                                    console.log(`Section ${index} summary:`, section.summary);
                                    if (section.summary) {
                                        totalDistance += section.summary.length || 0;
                                        totalDuration += section.summary.duration || 0;
                                    }
                                });
                                
                                console.log('Total distance from sections:', totalDistance);
                                console.log('Total duration from sections:', totalDuration);
                                
                                // Nếu không có summary, tính khoảng cách từ coordinates
                                if (totalDistance === 0) {
                                    const coordinates = this.extractCoordinatesFromLineStrings(lineStrings);
                                    if (coordinates.length > 1) {
                                        totalDistance = this.calculateHaversineDistance(coordinates[0], coordinates[coordinates.length - 1]);
                                        totalDuration = this.estimateTravelTime(totalDistance);
                                        console.log('Calculated distance from coordinates:', totalDistance);
                                    }
                                }
                                
                                // Tạo route object với thông tin cần thiết
                                const routeObject = {
                                    summary: {
                                        distance: totalDistance,
                                        travelTime: totalDuration
                                    },
                                    multiLineString: multiLineString,
                                    lineStrings: lineStrings,
                                    coordinates: this.extractCoordinatesFromLineStrings(lineStrings)
                                };
                                
                                console.log('Route object created:', routeObject);
                                resolve(routeObject);
                            } else {
                                reject(new Error('No valid LineStrings created'));
                            }
                        } else {
                            reject(new Error('No routes found in response'));
                        }
                    } catch (error) {
                        console.error('Error processing routing result:', error);
                        reject(error);
                    }
                };
                
                const onError = (error) => {
                    console.error('Routing error:', error);
                    reject(error);
                };
                
                // Gọi calculateRoute
                router.calculateRoute(routingParameters, onResult, onError);
            });
            
        } catch (error) {
            console.error('Error in calculateRouteWithAPIv8:', error);
            return null;
        }
    }

    // Trích xuất coordinates từ LineStrings
    extractCoordinatesFromLineStrings(lineStrings) {
        const coordinates = [];
        
        lineStrings.forEach(lineString => {
            const points = lineString.getLatLngAltArray();
            for (let i = 0; i < points.length; i += 3) {
                coordinates.push({
                    lat: points[i],
                    lng: points[i + 1]
                });
            }
        });
        
        console.log('Extracted coordinates:', coordinates.length, 'points');
        return coordinates;
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
                
                // Validate coordinates - chỉ chấp nhận coordinates hợp lệ
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
        if (poly.length > 0) {
            console.log('First point:', poly[0]);
            console.log('Last point:', poly[poly.length - 1]);
        }
        
        // Đảm bảo có ít nhất 2 điểm để vẽ đường
        if (poly.length < 2) {
            console.log('Not enough points for route, adding start and end points');
            poly.unshift({ lat: this.point1.lat, lng: this.point1.lng });
            poly.push({ lat: this.point2.lat, lng: this.point2.lng });
        }
        
        // Kiểm tra xem tuyến đường có hợp lý không
        if (poly.length > 2) {
            const firstPoint = poly[0];
            const lastPoint = poly[poly.length - 1];
            const expectedStart = { lat: this.point1.lat, lng: this.point1.lng };
            const expectedEnd = { lat: this.point2.lat, lng: this.point2.lng };
            
            // Kiểm tra xem điểm đầu và cuối có gần với điểm gốc không
            const startDistance = this.calculateHaversineDistance(firstPoint, expectedStart);
            const endDistance = this.calculateHaversineDistance(lastPoint, expectedEnd);
            
            console.log('Start point distance from expected:', startDistance, 'm');
            console.log('End point distance from expected:', endDistance, 'm');
            
            // Nếu điểm đầu/cuối cách xa điểm gốc quá 1km, có thể có lỗi
            if (startDistance > 1000 || endDistance > 1000) {
                console.warn('Route endpoints seem incorrect, using direct line');
                return [
                    { lat: this.point1.lat, lng: this.point1.lng },
                    { lat: this.point2.lat, lng: this.point2.lng }
                ];
            }
        }
        
        return poly;
    }

    // Kiểm tra xem tuyến đường có phải là đường thẳng không
    isStraightLine(coordinates) {
        if (coordinates.length < 3) return true;
        
        // Tính khoảng cách trực tiếp
        const directDistance = this.calculateHaversineDistance(coordinates[0], coordinates[coordinates.length - 1]);
        
        // Tính tổng khoảng cách của tuyến đường
        let routeDistance = 0;
        for (let i = 1; i < coordinates.length; i++) {
            routeDistance += this.calculateHaversineDistance(coordinates[i-1], coordinates[i]);
        }
        
        // Nếu tỷ lệ gần 1, có thể là đường thẳng
        const ratio = routeDistance / directDistance;
        console.log('Route vs direct distance ratio:', ratio);
        
        return ratio < 1.1; // Nếu tỷ lệ < 1.1, coi như đường thẳng
    }

    // Thử lại với tham số khác
    async retryWithDifferentParams() {
        try {
            console.log('Retrying with different parameters...');
            
            const API_KEY = '7GUpHwbsEgObqnGg4JG34CJvdbf89IU4iq-SDFe8vmE';
            
            // Thử với tham số khác
            const params = new URLSearchParams({
                transportMode: 'car',
                origin: `${this.point1.lat},${this.point1.lng}`,
                destination: `${this.point2.lat},${this.point2.lng}`,
                return: 'summary,polyline',
                routingMode: 'short',
                avoid: '',
                units: 'metric',
                alternatives: '0',
                apikey: API_KEY
            });
            
            const url = `https://router.hereapi.com/v8/routes?${params}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const section = route.sections[0];
                const coordinates = this.decodePolyline(section.polyline);
                
                if (coordinates.length > 0 && !this.isStraightLine(coordinates)) {
                    console.log('Retry successful, got proper route');
                    return {
                        summary: {
                            distance: section.summary.length,
                            travelTime: section.summary.duration
                        },
                        shape: coordinates.map(coord => `${coord.lat},${coord.lng}`),
                        coordinates: coordinates
                    };
                }
            }
            
            throw new Error('Retry failed, still getting straight line');
            
        } catch (error) {
            console.error('Error in retry:', error);
            return null;
        }
    }

    // Phương thức debug để kiểm tra thông tin tuyến đường
    debugRoute(route) {
        console.log('=== ROUTE DEBUG ===');
        console.log('Route object:', route);
        
        if (route.multiLineString) {
            console.log('MultiLineString route detected');
            console.log('LineStrings count:', route.lineStrings ? route.lineStrings.length : 'unknown');
        }
        
        if (route.coordinates) {
            console.log('Coordinates count:', route.coordinates.length);
            console.log('First coordinate:', route.coordinates[0]);
            console.log('Last coordinate:', route.coordinates[route.coordinates.length - 1]);
        }
        
        if (route.shape) {
            console.log('Shape count:', route.shape.length);
            console.log('First shape point:', route.shape[0]);
            console.log('Last shape point:', route.shape[route.shape.length - 1]);
        }
        
        if (route.summary) {
            console.log('Distance (m):', route.summary.distance);
            console.log('Duration (s):', route.summary.travelTime);
            console.log('Distance (km):', (route.summary.distance / 1000).toFixed(2));
            console.log('Duration (min):', Math.round(route.summary.travelTime / 60));
        }
        
        console.log('=== END DEBUG ===');
    }

    // Phương thức tối ưu hóa tuyến đường
    optimizeRoute(coordinates) {
        if (!coordinates || coordinates.length < 2) {
            return coordinates;
        }
        
        console.log('Optimizing route with', coordinates.length, 'points');
        
        // Nếu chỉ có 2 điểm, không cần tối ưu
        if (coordinates.length === 2) {
            return coordinates;
        }
        
        // Tính tổng khoảng cách của tuyến đường hiện tại
        let totalDistance = 0;
        for (let i = 1; i < coordinates.length; i++) {
            totalDistance += this.calculateHaversineDistance(coordinates[i-1], coordinates[i]);
        }
        
        // Khoảng cách trực tiếp
        const directDistance = this.calculateHaversineDistance(coordinates[0], coordinates[coordinates.length - 1]);
        
        console.log('Route total distance:', totalDistance, 'm');
        console.log('Direct distance:', directDistance, 'm');
        console.log('Route efficiency:', (directDistance / totalDistance * 100).toFixed(1) + '%');
        
        // Nếu tuyến đường dài hơn 5 lần khoảng cách trực tiếp, có thể có lỗi
        if (totalDistance > directDistance * 5) {
            console.warn('Route seems too long, but keeping road curves');
            // Không dùng đường thẳng, giữ nguyên đường cong
        }
        
        // Chỉ lọc bớt điểm nếu có quá nhiều (> 20 điểm)
        if (coordinates.length > 20) {
            console.log('Route has too many points, simplifying...');
            const simplified = [coordinates[0]];
            
            // Giữ lại các điểm quan trọng (cách nhau ít nhất 500m)
            for (let i = 1; i < coordinates.length - 1; i++) {
                const prevPoint = simplified[simplified.length - 1];
                const currentPoint = coordinates[i];
                const distance = this.calculateHaversineDistance(prevPoint, currentPoint);
                
                if (distance > 500) { // Chỉ giữ điểm cách nhau > 500m
                    simplified.push(currentPoint);
                }
            }
            
            simplified.push(coordinates[coordinates.length - 1]);
            console.log('Simplified route from', coordinates.length, 'to', simplified.length, 'points');
            return simplified;
        }
        
        return coordinates;
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