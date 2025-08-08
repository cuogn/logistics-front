// Location Selector cho địa chỉ hành chính Việt Nam
class VietnamLocationSelector {
    constructor() {
        this.addressAPI = new VietnamAddressAPI();
        this.initializeSelectors();
        this.loadProvinces();
    }

    initializeSelectors() {
        // Điểm A
        this.pointAProvince = document.getElementById('pointAProvince');
        this.pointADistrict = document.getElementById('pointADistrict');
        this.pointAWard = document.getElementById('pointAWard');
        this.pointACoords = document.getElementById('pointACoords');

        // Điểm B
        this.pointBProvince = document.getElementById('pointBProvince');
        this.pointBDistrict = document.getElementById('pointBDistrict');
        this.pointBWard = document.getElementById('pointBWard');
        this.pointBCoords = document.getElementById('pointBCoords');

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Điểm A
        this.pointAProvince.addEventListener('change', () => this.onProvinceChange('A'));
        this.pointADistrict.addEventListener('change', () => this.onDistrictChange('A'));
        this.pointAWard.addEventListener('change', () => this.onWardChange('A'));

        // Điểm B
        this.pointBProvince.addEventListener('change', () => this.onProvinceChange('B'));
        this.pointBDistrict.addEventListener('change', () => this.onDistrictChange('B'));
        this.pointBWard.addEventListener('change', () => this.onWardChange('B'));
    }

    async loadProvinces() {
        try {
            const provinces = await this.addressAPI.getProvinces(2); // mode=2 để lấy tỉnh mới
            
            // Cập nhật dropdown tỉnh cho điểm A
            this.pointAProvince.innerHTML = '<option value="">Chọn tỉnh/thành phố</option>';
            provinces.forEach(province => {
                const option = document.createElement('option');
                option.value = province.id;
                option.textContent = province.name;
                this.pointAProvince.appendChild(option);
            });

            // Cập nhật dropdown tỉnh cho điểm B
            this.pointBProvince.innerHTML = '<option value="">Chọn tỉnh/thành phố</option>';
            provinces.forEach(province => {
                const option = document.createElement('option');
                option.value = province.id;
                option.textContent = province.name;
                this.pointBProvince.appendChild(option);
            });

            console.log('Đã tải danh sách tỉnh/thành phố:', provinces.length);
        } catch (error) {
            console.error('Lỗi khi tải danh sách tỉnh/thành phố:', error);
        }
    }

    async onProvinceChange(point) {
        const provinceSelect = point === 'A' ? this.pointAProvince : this.pointBProvince;
        const districtSelect = point === 'A' ? this.pointADistrict : this.pointBDistrict;
        const wardSelect = point === 'A' ? this.pointAWard : this.pointBWard;
        const coordsSpan = point === 'A' ? this.pointACoords : this.pointBCoords;

        const provinceId = provinceSelect.value;
        
        // Reset district và ward
        districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
        wardSelect.innerHTML = '<option value="">Chọn xã/phường</option>';
        districtSelect.disabled = true;
        wardSelect.disabled = true;
        coordsSpan.textContent = '--';

        if (provinceId) {
            try {
                const districts = await this.addressAPI.getDistricts(provinceId);
                
                // Cập nhật dropdown quận/huyện
                districts.forEach(district => {
                    const option = document.createElement('option');
                    option.value = district.id;
                    option.textContent = district.name;
                    districtSelect.appendChild(option);
                });
                
                districtSelect.disabled = false;
                console.log(`Đã tải danh sách quận/huyện cho tỉnh ${provinceId}:`, districts.length);
            } catch (error) {
                console.error('Lỗi khi tải danh sách quận/huyện:', error);
            }
        }
    }

    async onDistrictChange(point) {
        const districtSelect = point === 'A' ? this.pointADistrict : this.pointBDistrict;
        const wardSelect = point === 'A' ? this.pointAWard : this.pointBWard;
        const coordsSpan = point === 'A' ? this.pointACoords : this.pointBCoords;

        const districtId = districtSelect.value;
        
        // Reset ward
        wardSelect.innerHTML = '<option value="">Chọn xã/phường</option>';
        wardSelect.disabled = true;
        coordsSpan.textContent = '--';

        if (districtId) {
            try {
                const wards = await this.addressAPI.getWardsByDistrict(districtId);
                
                // Cập nhật dropdown xã/phường
                wards.forEach(ward => {
                    const option = document.createElement('option');
                    option.value = ward.id;
                    option.textContent = ward.name;
                    wardSelect.appendChild(option);
                });
                
                wardSelect.disabled = false;
                console.log(`Đã tải danh sách xã/phường cho quận/huyện ${districtId}:`, wards.length);
            } catch (error) {
                console.error('Lỗi khi tải danh sách xã/phường:', error);
            }
        }
    }

    async onWardChange(point) {
        const provinceSelect = point === 'A' ? this.pointAProvince : this.pointBProvince;
        const districtSelect = point === 'A' ? this.pointADistrict : this.pointBDistrict;
        const wardSelect = point === 'A' ? this.pointAWard : this.pointBWard;
        const coordsSpan = point === 'A' ? this.pointACoords : this.pointBCoords;

        const provinceId = provinceSelect.value;
        const districtId = districtSelect.value;
        const wardId = wardSelect.value;

        if (wardId) {
            // Tạo địa chỉ đầy đủ
            const provinceName = provinceSelect.options[provinceSelect.selectedIndex].text;
            const districtName = districtSelect.options[districtSelect.selectedIndex].text;
            const wardName = wardSelect.options[wardSelect.selectedIndex].text;
            
            const fullAddress = `${wardName}, ${districtName}, ${provinceName}, Việt Nam`;
            coordsSpan.textContent = fullAddress;
            
            console.log(`Địa chỉ ${point}:`, fullAddress);
            
            // Trigger event để DistanceCalculator có thể lấy tọa độ
            const event = new CustomEvent('wardSelected', {
                detail: {
                    point: point,
                    address: fullAddress,
                    provinceId: provinceId,
                    districtId: districtId,
                    wardId: wardId
                }
            });
            document.dispatchEvent(event);
        }
    }

    // Lấy thông tin địa chỉ đầy đủ
    getFullAddress(point) {
        const provinceSelect = point === 'A' ? this.pointAProvince : this.pointBProvince;
        const districtSelect = point === 'A' ? this.pointADistrict : this.pointBDistrict;
        const wardSelect = point === 'A' ? this.pointAWard : this.pointBWard;

        const provinceName = provinceSelect.options[provinceSelect.selectedIndex]?.text || '';
        const districtName = districtSelect.options[districtSelect.selectedIndex]?.text || '';
        const wardName = wardSelect.options[wardSelect.selectedIndex]?.text || '';

        if (provinceName && districtName && wardName) {
            return `${wardName}, ${districtName}, ${provinceName}, Việt Nam`;
        }
        return null;
    }
}

// API địa chỉ hành chính Việt Nam
class VietnamAddressAPI {
    constructor() {
        this.baseURL = 'https://tailieu365.com/api/address';
        this.provinces = [];
        this.districts = {};
        this.wards = {};
    }

    // Lấy danh sách tỉnh/thành phố
    async getProvinces(mode = 2) {
        try {
            const response = await fetch(`${this.baseURL}/province?mode=${mode}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.provinces = data;
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', error);
            return [];
        }
    }

    // Lấy danh sách quận/huyện theo tỉnh
    async getDistricts(provinceId) {
        try {
            const response = await fetch(`${this.baseURL}/district?provinceId=${provinceId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.districts[provinceId] = data;
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách quận/huyện:', error);
            return [];
        }
    }

    // Lấy danh sách xã/phường theo quận/huyện
    async getWardsByDistrict(districtId) {
        try {
            const response = await fetch(`${this.baseURL}/ward?districtId=${districtId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.wards[districtId] = data;
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách xã/phường theo quận/huyện:', error);
            return [];
        }
    }

    // Lấy danh sách xã/phường theo tỉnh (mới)
    async getWardsByProvince(provinceId) {
        try {
            const response = await fetch(`${this.baseURL}/ward?provinceId=${provinceId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.wards[`province_${provinceId}`] = data;
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách xã/phường theo tỉnh:', error);
            return [];
        }
    }
}

// Khởi tạo Location Selector khi trang được load
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo Location Selector
    const locationSelector = new VietnamLocationSelector();
    
    // Lưu instance vào global scope để có thể truy cập từ các script khác
    window.vietnamLocationSelector = locationSelector;
}); 