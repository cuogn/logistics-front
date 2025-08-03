// Location Selector với dữ liệu Việt Nam
class LocationSelector {
    constructor() {
        this.vietnamData = this.getVietnamData();
        this.pointA = { province: null, district: null, ward: null, village: null };
        this.pointB = { province: null, district: null, ward: null, village: null };
        this.init();
    }

    init() {
        this.loadProvinces();
        this.setupEventListeners();
        console.log('Location Selector initialized');
    }

    // Dữ liệu tỉnh thành Việt Nam (mẫu)
    getVietnamData() {
        return {
            provinces: [
                {
                    id: '01',
                    name: 'Hà Nội',
                    districts: [
                        {
                            id: '001',
                            name: 'Ba Đình',
                            wards: [
                                {
                                    id: '00001',
                                    name: 'Phúc Xá',
                                    villages: [
                                        { id: '000001', name: 'Xóm 1', lat: 21.0285, lng: 105.8542 },
                                        { id: '000002', name: 'Xóm 2', lat: 21.0290, lng: 105.8545 }
                                    ]
                                },
                                {
                                    id: '00002',
                                    name: 'Trúc Bạch',
                                    villages: [
                                        { id: '000003', name: 'Xóm 1', lat: 21.0295, lng: 105.8550 },
                                        { id: '000004', name: 'Xóm 2', lat: 21.0300, lng: 105.8555 }
                                    ]
                                }
                            ]
                        },
                        {
                            id: '002',
                            name: 'Hoàn Kiếm',
                            wards: [
                                {
                                    id: '00003',
                                    name: 'Phúc Tân',
                                    villages: [
                                        { id: '000005', name: 'Xóm 1', lat: 21.0305, lng: 105.8560 },
                                        { id: '000006', name: 'Xóm 2', lat: 21.0310, lng: 105.8565 }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: '79',
                    name: 'TP. Hồ Chí Minh',
                    districts: [
                        {
                            id: '760',
                            name: 'Quận 1',
                            wards: [
                                {
                                    id: '26734',
                                    name: 'Bến Nghé',
                                    villages: [
                                        { id: '000007', name: 'Xóm 1', lat: 10.7769, lng: 106.7009 },
                                        { id: '000008', name: 'Xóm 2', lat: 10.7770, lng: 106.7010 }
                                    ]
                                },
                                {
                                    id: '26735',
                                    name: 'Bến Thành',
                                    villages: [
                                        { id: '000009', name: 'Xóm 1', lat: 10.7775, lng: 106.7015 },
                                        { id: '000010', name: 'Xóm 2', lat: 10.7780, lng: 106.7020 }
                                    ]
                                }
                            ]
                        },
                        {
                            id: '761',
                            name: 'Quận 2',
                            wards: [
                                {
                                    id: '26740',
                                    name: 'Thảo Điền',
                                    villages: [
                                        { id: '000011', name: 'Xóm 1', lat: 10.7785, lng: 106.7025 },
                                        { id: '000012', name: 'Xóm 2', lat: 10.7790, lng: 106.7030 }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: '92',
                    name: 'Cần Thơ',
                    districts: [
                        {
                            id: '916',
                            name: 'Ninh Kiều',
                            wards: [
                                {
                                    id: '31156',
                                    name: 'An Cư',
                                    villages: [
                                        { id: '000013', name: 'Xóm 1', lat: 10.0341, lng: 105.7882 },
                                        { id: '000014', name: 'Xóm 2', lat: 10.0345, lng: 105.7885 }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    }

    loadProvinces() {
        const pointAProvince = document.getElementById('pointAProvince');
        const pointBProvince = document.getElementById('pointBProvince');
        
        if (pointAProvince && pointBProvince) {
            this.vietnamData.provinces.forEach(province => {
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
        const villageSelect = document.getElementById(prefix + 'Village');
        const coordsDisplay = document.getElementById(prefix + 'Coords');

        if (provinceSelect) {
            provinceSelect.addEventListener('change', (e) => {
                this.loadDistricts(prefix, e.target.value);
                this.updateCoordinates(prefix, coordsDisplay);
            });
        }

        if (districtSelect) {
            districtSelect.addEventListener('change', (e) => {
                this.loadWards(prefix, e.target.value);
                this.updateCoordinates(prefix, coordsDisplay);
            });
        }

        if (wardSelect) {
            wardSelect.addEventListener('change', (e) => {
                this.loadVillages(prefix, e.target.value);
                this.updateCoordinates(prefix, coordsDisplay);
            });
        }

        if (villageSelect) {
            villageSelect.addEventListener('change', (e) => {
                this.updateCoordinates(prefix, coordsDisplay);
            });
        }
    }

    loadDistricts(prefix, provinceId) {
        const districtSelect = document.getElementById(prefix + 'District');
        const wardSelect = document.getElementById(prefix + 'Ward');
        const villageSelect = document.getElementById(prefix + 'Village');

        // Reset dependent selects
        this.resetSelect(wardSelect);
        this.resetSelect(villageSelect);

        if (!provinceId) {
            districtSelect.disabled = true;
            return;
        }

        const province = this.vietnamData.provinces.find(p => p.id === provinceId);
        if (province) {
            districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
            province.districts.forEach(district => {
                const option = document.createElement('option');
                option.value = district.id;
                option.textContent = district.name;
                districtSelect.appendChild(option);
            });
            districtSelect.disabled = false;
        }
    }

    loadWards(prefix, districtId) {
        const wardSelect = document.getElementById(prefix + 'Ward');
        const villageSelect = document.getElementById(prefix + 'Village');

        // Reset dependent select
        this.resetSelect(villageSelect);

        if (!districtId) {
            wardSelect.disabled = true;
            return;
        }

        const provinceId = document.getElementById(prefix + 'Province').value;
        const province = this.vietnamData.provinces.find(p => p.id === provinceId);
        const district = province?.districts.find(d => d.id === districtId);

        if (district) {
            wardSelect.innerHTML = '<option value="">Chọn xã/phường</option>';
            district.wards.forEach(ward => {
                const option = document.createElement('option');
                option.value = ward.id;
                option.textContent = ward.name;
                wardSelect.appendChild(option);
            });
            wardSelect.disabled = false;
        }
    }

    loadVillages(prefix, wardId) {
        const villageSelect = document.getElementById(prefix + 'Village');

        if (!wardId) {
            villageSelect.disabled = true;
            return;
        }

        const provinceId = document.getElementById(prefix + 'Province').value;
        const districtId = document.getElementById(prefix + 'District').value;
        const province = this.vietnamData.provinces.find(p => p.id === provinceId);
        const district = province?.districts.find(d => d.id === districtId);
        const ward = district?.wards.find(w => w.id === wardId);

        if (ward) {
            villageSelect.innerHTML = '<option value="">Chọn xóm/thôn</option>';
            ward.villages.forEach(village => {
                const option = document.createElement('option');
                option.value = village.id;
                option.textContent = village.name;
                villageSelect.appendChild(option);
            });
            villageSelect.disabled = false;
        }
    }

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
        const villageId = document.getElementById(prefix + 'Village').value;

        if (villageId) {
            const coordinates = this.getVillageCoordinates(provinceId, districtId, wardId, villageId);
            if (coordinates) {
                coordsDisplay.textContent = `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
                return;
            }
        }

        coordsDisplay.textContent = '--';
    }

    getVillageCoordinates(provinceId, districtId, wardId, villageId) {
        const province = this.vietnamData.provinces.find(p => p.id === provinceId);
        const district = province?.districts.find(d => d.id === districtId);
        const ward = district?.wards.find(w => w.id === wardId);
        const village = ward?.villages.find(v => v.id === villageId);

        return village ? { lat: village.lat, lng: village.lng } : null;
    }

    calculateDistance() {
        const pointACoords = this.getSelectedCoordinates('pointA');
        const pointBCoords = this.getSelectedCoordinates('pointB');

        if (!pointACoords || !pointBCoords) {
            showNotification('Vui lòng chọn đầy đủ địa điểm cho cả hai điểm', 'warning');
            return;
        }

        // Tính khoảng cách bằng Haversine
        const distance = this.calculateHaversineDistance(pointACoords, pointBCoords);
        const duration = this.estimateTravelTime(distance);
        const price = this.calculatePrice(distance);

        // Hiển thị kết quả
        this.displayResults(distance, duration, price);
        
        // Cập nhật map
        this.updateMap(pointACoords, pointBCoords);
        
        showNotification(`✅ Khoảng cách: ${this.formatDistance(distance)}, Giá: ${this.formatPrice(price)}`, 'success');
    }

    getSelectedCoordinates(prefix) {
        const provinceId = document.getElementById(prefix + 'Province').value;
        const districtId = document.getElementById(prefix + 'District').value;
        const wardId = document.getElementById(prefix + 'Ward').value;
        const villageId = document.getElementById(prefix + 'Village').value;

        if (provinceId && districtId && wardId && villageId) {
            return this.getVillageCoordinates(provinceId, districtId, wardId, villageId);
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
    }

    updateMap(pointA, pointB) {
        // Cập nhật map nếu có
        if (window.distanceCalculator) {
            window.distanceCalculator.point1 = pointA;
            window.distanceCalculator.point2 = pointB;
            window.distanceCalculator.calculateDistance();
        }
    }

    clearAll() {
        // Reset tất cả selects
        ['pointA', 'pointB'].forEach(prefix => {
            const selects = ['Province', 'District', 'Ward', 'Village'];
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
        const selects = ['Province', 'District', 'Ward', 'Village'];
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