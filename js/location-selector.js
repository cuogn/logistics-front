// Location Selector với API thực từ open.oapi.vn
class LocationSelector {
    constructor() {
        this.pointA = { province: null, district: null, ward: null, coordinates: null };
        this.pointB = { province: null, district: null, ward: null, coordinates: null };
        this.provinces = [];
        this.districts = {};
        this.wards = {};
        this.init();
    }

    init() {
        this.loadProvinces();
        this.setupEventListeners();
        console.log('Location Selector initialized with real API');
    }

    // API Base URL
    getApiBaseUrl() {
        return 'https://open.oapi.vn/location';
    }

    async loadProvinces() {
        try {
            const response = await fetch(`${this.getApiBaseUrl()}/provinces?page=0&size=100`);
            const data = await response.json();
            
            if (data.code === 'success' && data.data) {
                this.provinces = data.data;
                this.populateProvinceSelects();
                console.log('Loaded provinces:', this.provinces.length);
            } else {
                console.error('Failed to load provinces:', data);
                showNotification('Lỗi tải danh sách tỉnh thành', 'error');
            }
        } catch (error) {
            console.error('Error loading provinces:', error);
            showNotification('Lỗi kết nối API tỉnh thành', 'error');
        }
    }

    populateProvinceSelects() {
        const pointAProvince = document.getElementById('pointAProvince');
        const pointBProvince = document.getElementById('pointBProvince');
        
        if (pointAProvince && pointBProvince) {
            // Clear existing options
            pointAProvince.innerHTML = '<option value="">Chọn tỉnh/thành phố</option>';
            pointBProvince.innerHTML = '<option value="">Chọn tỉnh/thành phố</option>';
            
            this.provinces.forEach(province => {
                const optionA = document.createElement('option');
                optionA.value = province.id;
                optionA.textContent = province.name;
                pointAProvince.appendChild(optionA);

                const optionB = document.createElement('option');
                optionB.value = province.id;
                optionB.textContent = province.name;
                pointBProvince.appendChild(optionB);
            });
        }
    }

    setupEventListeners() {
        // Point A listeners
        this.setupLocationListeners('pointA', 'A');
        
        // Point B listeners
        this.setupLocationListeners('pointB', 'B');
        
        // Calculate button
        const calculateBtn = document.getElementById('calculateBtn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculateDistance());
        }
        
        // Clear button
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAll());
        }
        
        // Swap button
        const swapBtn = document.getElementById('swapBtn');
        if (swapBtn) {
            swapBtn.addEventListener('click', () => this.swapPoints());
        }
    }

    setupLocationListeners(prefix, pointLabel) {
        const provinceSelect = document.getElementById(prefix + 'Province');
        const districtSelect = document.getElementById(prefix + 'District');
        const wardSelect = document.getElementById(prefix + 'Ward');
        const coordsDisplay = document.getElementById(prefix + 'Coords');

        if (provinceSelect) {
            provinceSelect.addEventListener('change', async (e) => {
                await this.loadDistricts(prefix, e.target.value);
                this.updateCoordinates(prefix, coordsDisplay);
            });
        }

        if (districtSelect) {
            districtSelect.addEventListener('change', async (e) => {
                await this.loadWards(prefix, e.target.value);
                this.updateCoordinates(prefix, coordsDisplay);
            });
        }

        if (wardSelect) {
            wardSelect.addEventListener('change', (e) => {
                this.updateCoordinates(prefix, coordsDisplay);
            });
        }
    }

    async loadDistricts(prefix, provinceId) {
        const districtSelect = document.getElementById(prefix + 'District');
        const wardSelect = document.getElementById(prefix + 'Ward');

        // Reset dependent selects
        this.resetSelect(wardSelect);

        if (!provinceId) {
            districtSelect.disabled = true;
            return;
        }

        try {
            const response = await fetch(`${this.getApiBaseUrl()}/districts/${provinceId}?page=0&size=100`);
            const data = await response.json();
            
            if (data.code === 'success' && data.data) {
                this.districts[provinceId] = data.data;
                districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
                data.data.forEach(district => {
                    const option = document.createElement('option');
                    option.value = district.id;
                    option.textContent = district.name;
                    districtSelect.appendChild(option);
                });
                districtSelect.disabled = false;
                console.log(`Loaded districts for province ${provinceId}:`, data.data.length);
            } else {
                console.error('Failed to load districts:', data);
                showNotification('Lỗi tải danh sách quận/huyện', 'error');
            }
        } catch (error) {
            console.error('Error loading districts:', error);
            showNotification('Lỗi kết nối API quận/huyện', 'error');
        }
    }

    async loadWards(prefix, districtId) {
        const wardSelect = document.getElementById(prefix + 'Ward');

        if (!districtId) {
            wardSelect.disabled = true;
            return;
        }

        try {
            const response = await fetch(`${this.getApiBaseUrl()}/wards/${districtId}?page=0&size=100`);
            const data = await response.json();
            
            if (data.code === 'success' && data.data) {
                this.wards[districtId] = data.data;
                wardSelect.innerHTML = '<option value="">Chọn xã/phường</option>';
                data.data.forEach(ward => {
                    const option = document.createElement('option');
                    option.value = ward.id;
                    option.textContent = ward.name;
                    wardSelect.appendChild(option);
                });
                wardSelect.disabled = false;
                console.log(`Loaded wards for district ${districtId}:`, data.data.length);
            } else {
                console.error('Failed to load wards:', data);
                showNotification('Lỗi tải danh sách xã/phường', 'error');
            }
        } catch (error) {
            console.error('Error loading wards:', error);
            showNotification('Lỗi kết nối API xã/phường', 'error');
        }
    }

    // Xóa loadVillages vì API không có villages

    resetSelect(select) {
        if (select) {
            select.innerHTML = '<option value="">Chọn...</option>';
            select.disabled = true;
        }
    }

    updateCoordinates(prefix, coordsDisplay) {
        const provinceId = document.getElementById(prefix + 'Province').value;
        const districtId = document.getElementById(prefix + 'District').value;
        const wardId = document.getElementById(prefix + 'Ward').value;

        if (provinceId && districtId && wardId) {
            // Lấy tọa độ trung tâm của xã/phường (ước tính)
            const coordinates = this.getWardCoordinates(provinceId, districtId, wardId);
            if (coordinates) {
                coordsDisplay.textContent = `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
                return;
            }
        }

        coordsDisplay.textContent = '--';
    }

    getWardCoordinates(provinceId, districtId, wardId) {
        // Ước tính tọa độ trung tâm của xã/phường dựa trên ID
        // Đây là ước tính đơn giản, trong thực tế cần có database tọa độ chính xác
        const province = this.provinces.find(p => p.id === provinceId);
        const districts = this.districts[provinceId] || [];
        const district = districts.find(d => d.id === districtId);
        const wards = this.wards[districtId] || [];
        const ward = wards.find(w => w.id === wardId);

        if (province && district && ward) {
            // Ước tính tọa độ dựa trên vị trí địa lý Việt Nam
            // Đây là ước tính đơn giản, cần thay thế bằng dữ liệu thực
            const baseLat = 21.0285; // Hà Nội
            const baseLng = 105.8542;
            
            // Thêm offset dựa trên ID để tạo sự khác biệt
            const latOffset = (parseInt(wardId) % 100) * 0.01;
            const lngOffset = (parseInt(wardId) % 100) * 0.01;
            
            return {
                lat: baseLat + latOffset,
                lng: baseLng + lngOffset
            };
        }

        return null;
    }

    calculateDistance() {
        const pointACoords = this.getSelectedCoordinates('pointA');
        const pointBCoords = this.getSelectedCoordinates('pointB');

        console.log('Checking coordinates - Point A:', pointACoords, 'Point B:', pointBCoords);

        if (!pointACoords || !pointBCoords) {
            console.log('Missing coordinates - Point A:', !!pointACoords, 'Point B:', !!pointBCoords);
            showNotification('Vui lòng chọn đầy đủ địa điểm cho cả hai điểm', 'warning');
            return;
        }

        // Kiểm tra thêm nếu có distanceCalculator
        if (window.distanceCalculator) {
            console.log('DistanceCalculator state - Point1:', window.distanceCalculator.point1, 'Point2:', window.distanceCalculator.point2);
            
            // Đồng bộ với distanceCalculator
            if (!window.distanceCalculator.point1 || !window.distanceCalculator.point2) {
                window.distanceCalculator.point1 = pointACoords;
                window.distanceCalculator.point2 = pointBCoords;
                console.log('Synced coordinates with distanceCalculator');
            }
        }

        // Tính khoảng cách bằng Haversine
        const distance = this.calculateHaversineDistance(pointACoords, pointBCoords);
        const duration = this.estimateTravelTime(distance);
        const price = this.calculatePrice(distance);

        console.log('Calculated - Distance:', distance, 'Duration:', duration, 'Price:', price);

        // Hiển thị kết quả
        this.displayResults(distance, duration, price);
        
        // Cập nhật map và hiển thị markers
        this.updateMap(pointACoords, pointBCoords);
        
        showNotification(`✅ Khoảng cách: ${this.formatDistance(distance)}`, 'success');
    }

    getSelectedCoordinates(prefix) {
        const provinceId = document.getElementById(prefix + 'Province').value;
        const districtId = document.getElementById(prefix + 'District').value;
        const wardId = document.getElementById(prefix + 'Ward').value;

        if (provinceId && districtId && wardId) {
            return this.getWardCoordinates(provinceId, districtId, wardId);
        }

        return null;
    }

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

    estimateTravelTime(distanceInMeters) {
        const averageSpeedKmh = 40; // 40 km/h
        const averageSpeedMs = averageSpeedKmh * 1000 / 3600; // Chuyển sang m/s
        return Math.round(distanceInMeters / averageSpeedMs); // Thời gian tính bằng giây
    }

    calculatePrice(distanceInMeters) {
        if (!distanceInMeters || isNaN(distanceInMeters)) {
            return 0;
        }
        
        const distanceInKm = distanceInMeters / 1000;
        return distanceInKm * 5000; // 5000 VND/km
    }

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

    formatPrice(price) {
        if (!price || isNaN(price)) {
            return '--';
        }
        
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    displayResults(distance, duration, price) {
        const distanceElement = document.getElementById('distanceValue');
        const durationElement = document.getElementById('durationValue');
        const priceElement = document.getElementById('priceValue');
        const infoPanel = document.getElementById('distanceInfo');

        if (distanceElement) distanceElement.textContent = this.formatDistance(distance);
        if (durationElement) durationElement.textContent = this.formatDuration(duration);
        if (priceElement) priceElement.textContent = this.formatPrice(price);
        if (infoPanel) infoPanel.style.display = 'block';
        
        // Cập nhật phí vận chuyển trong form nếu có
        const shippingFee = document.getElementById('shippingFee');
        if (shippingFee) {
            shippingFee.value = price;
        }
        
        // Cập nhật biến global nếu có
        if (typeof calculatedFee !== 'undefined') {
            calculatedFee = price;
        }
    }

    updateMap(pointA, pointB) {
        console.log('Updating map with coordinates:', pointA, pointB);
        
        // Cập nhật map nếu có
        if (window.distanceCalculator) {
            // Xóa markers cũ
            window.distanceCalculator.clearPoints();
            
            // Thêm markers mới
            window.distanceCalculator.point1 = pointA;
            window.distanceCalculator.point2 = pointB;
            window.distanceCalculator.addMarker(pointA, 'A');
            window.distanceCalculator.addMarker(pointB, 'B');
            
            // Cập nhật địa chỉ
            const pointAAddress = this.getSelectedAddress('pointA');
            const pointBAddress = this.getSelectedAddress('pointB');
            
            if (pointAAddress) {
                window.distanceCalculator.point1Address = pointAAddress;
                window.distanceCalculator.updateAddressInput('A', pointAAddress);
            }
            
            if (pointBAddress) {
                window.distanceCalculator.point2Address = pointBAddress;
                window.distanceCalculator.updateAddressInput('B', pointBAddress);
            }
            
            console.log('Map updated successfully');
        } else {
            console.warn('DistanceCalculator not found');
        }
    }

    getSelectedAddress(prefix) {
        const provinceId = document.getElementById(prefix + 'Province').value;
        const districtId = document.getElementById(prefix + 'District').value;
        const wardId = document.getElementById(prefix + 'Ward').value;

        if (provinceId && districtId && wardId) {
            const province = this.provinces.find(p => p.id === provinceId);
            const districts = this.districts[provinceId] || [];
            const district = districts.find(d => d.id === districtId);
            const wards = this.wards[districtId] || [];
            const ward = wards.find(w => w.id === wardId);

            if (province && district && ward) {
                return `${ward.name}, ${district.name}, ${province.name}`;
            }
        }

        return null;
    }

    clearAll() {
        // Reset tất cả selects
        ['pointA', 'pointB'].forEach(prefix => {
            const selects = ['Province', 'District', 'Ward'];
            selects.forEach(selectType => {
                const select = document.getElementById(prefix + selectType);
                if (select) {
                    select.selectedIndex = 0;
                    if (selectType !== 'Province') {
                        select.disabled = true;
                    }
                }
            });
            
            const coordsDisplay = document.getElementById(prefix + 'Coords');
            if (coordsDisplay) coordsDisplay.textContent = '--';
        });

        // Ẩn thông tin khoảng cách
        const infoPanel = document.getElementById('distanceInfo');
        if (infoPanel) infoPanel.style.display = 'none';

        showNotification('🗑️ Đã xóa tất cả địa điểm', 'success');
    }

    swapPoints() {
        // Hoán đổi giá trị giữa point A và point B
        const selects = ['Province', 'District', 'Ward'];
        selects.forEach(selectType => {
            const selectA = document.getElementById('pointA' + selectType);
            const selectB = document.getElementById('pointB' + selectType);
            
            if (selectA && selectB) {
                const tempValue = selectA.value;
                const tempDisabled = selectA.disabled;
                
                selectA.value = selectB.value;
                selectA.disabled = selectB.disabled;
                
                selectB.value = tempValue;
                selectB.disabled = tempDisabled;
            }
        });

        // Cập nhật coordinates
        this.updateCoordinates('pointA', document.getElementById('pointACoords'));
        this.updateCoordinates('pointB', document.getElementById('pointBCoords'));

        showNotification('🔄 Đã đổi vị trí 2 điểm', 'success');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.locationSelector = new LocationSelector();
}); 