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
        this.pointAWard = document.getElementById('pointAWard');
        this.pointACoords = document.getElementById('pointACoords');

        // Điểm B
        this.pointBProvince = document.getElementById('pointBProvince');
        this.pointBWard = document.getElementById('pointBWard');
        this.pointBCoords = document.getElementById('pointBCoords');

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Điểm A
        this.pointAProvince.addEventListener('change', () => this.onProvinceChange('A'));
        this.pointAWard.addEventListener('change', () => this.onWardChange('A'));

        // Điểm B
        this.pointBProvince.addEventListener('change', () => this.onProvinceChange('B'));
        this.pointBWard.addEventListener('change', () => this.onWardChange('B'));
    }

    async loadProvinces() {
        try {
            console.log('🔄 Đang tải danh sách tỉnh/thành phố từ API...');
            const provinces = await this.addressAPI.getProvinces(2); // mode=2 để lấy tỉnh mới
            
            if (!provinces || provinces.length === 0) {
                console.warn('Không có dữ liệu tỉnh/thành phố từ API, sử dụng dữ liệu mặc định');
                // Fallback data
                const fallbackProvinces = [
                    { id: 1, name: 'Hà Nội' },
                    { id: 2, name: 'TP. Hồ Chí Minh' },
                    { id: 3, name: 'Đà Nẵng' },
                    { id: 4, name: 'Hải Phòng' },
                    { id: 5, name: 'Cần Thơ' }
                ];
                this.updateProvinceDropdowns(fallbackProvinces);
                return;
            }
            
            this.updateProvinceDropdowns(provinces);
            console.log(`✅ Đã tải ${provinces.length} tỉnh/thành phố từ API`);
        } catch (error) {
            console.error('Lỗi khi tải danh sách tỉnh/thành phố:', error);
            // Fallback data in case of error
            const fallbackProvinces = [
                { id: 1, name: 'Hà Nội' },
                { id: 2, name: 'TP. Hồ Chí Minh' },
                { id: 3, name: 'Đà Nẵng' },
                { id: 4, name: 'Hải Phòng' },
                { id: 5, name: 'Cần Thơ' }
            ];
            this.updateProvinceDropdowns(fallbackProvinces);
        }
    }

    updateProvinceDropdowns(provinces) {
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
    }

    async onProvinceChange(point) {
        const provinceSelect = point === 'A' ? this.pointAProvince : this.pointBProvince;
        const wardSelect = point === 'A' ? this.pointAWard : this.pointBWard;
        const coordsSpan = point === 'A' ? this.pointACoords : this.pointBCoords;

        const provinceId = provinceSelect.value;
        
        // Reset ward
        wardSelect.innerHTML = '<option value="">Chọn xã/phường</option>';
        wardSelect.disabled = true;
        coordsSpan.textContent = '--';

        if (provinceId) {
            try {
                console.log(`🔄 Đang tải xã/phường cho tỉnh ${provinceId}...`);
                // Lấy xã/phường trực tiếp theo tỉnh
                const wards = await this.addressAPI.getWardsByProvince(provinceId);
                
                if (!wards || wards.length === 0) {
                    console.warn(`Không có dữ liệu xã/phường cho tỉnh ${provinceId}, sử dụng dữ liệu mặc định`);
                    // Fallback wards
                    const fallbackWards = [
                        { id: 1, name: 'Phường 1' },
                        { id: 2, name: 'Phường 2' },
                        { id: 3, name: 'Phường 3' },
                        { id: 4, name: 'Phường 4' },
                        { id: 5, name: 'Phường 5' }
                    ];
                    this.updateWardDropdown(wardSelect, fallbackWards);
                } else {
                    this.updateWardDropdown(wardSelect, wards);
                }
                
                wardSelect.disabled = false;
                console.log(`✅ Đã tải ${wards ? wards.length : 0} xã/phường cho tỉnh ${provinceId}`);
            } catch (error) {
                console.error('Lỗi khi tải danh sách xã/phường:', error);
                // Fallback wards in case of error
                const fallbackWards = [
                    { id: 1, name: 'Phường 1' },
                    { id: 2, name: 'Phường 2' },
                    { id: 3, name: 'Phường 3' },
                    { id: 4, name: 'Phường 4' },
                    { id: 5, name: 'Phường 5' }
                ];
                this.updateWardDropdown(wardSelect, fallbackWards);
                wardSelect.disabled = false;
            }
        }
    }

    updateWardDropdown(wardSelect, wards) {
        // Cập nhật dropdown xã/phường
        wards.forEach(ward => {
            const option = document.createElement('option');
            option.value = ward.id;
            option.textContent = ward.name;
            wardSelect.appendChild(option);
        });
    }

    async onWardChange(point) {
        const provinceSelect = point === 'A' ? this.pointAProvince : this.pointBProvince;
        const wardSelect = point === 'A' ? this.pointAWard : this.pointBWard;
        const coordsSpan = point === 'A' ? this.pointACoords : this.pointBCoords;

        const provinceId = provinceSelect.value;
        const wardId = wardSelect.value;

        if (wardId) {
            // Tạo địa chỉ đầy đủ
            const provinceName = provinceSelect.options[provinceSelect.selectedIndex].text;
            const wardName = wardSelect.options[wardSelect.selectedIndex].text;
            
            const fullAddress = `${wardName}, ${provinceName}, Việt Nam`;
            coordsSpan.textContent = fullAddress;
            
            console.log(`Địa chỉ ${point}:`, fullAddress);
            
            // Trigger event để DistanceCalculator có thể lấy tọa độ
            const event = new CustomEvent('wardSelected', {
                detail: {
                    point: point,
                    address: fullAddress,
                    provinceId: provinceId,
                    wardId: wardId
                }
            });
            document.dispatchEvent(event);
        }
    }

    // Lấy thông tin địa chỉ đầy đủ
    getFullAddress(point) {
        const provinceSelect = point === 'A' ? this.pointAProvince : this.pointBProvince;
        const wardSelect = point === 'A' ? this.pointAWard : this.pointBWard;

        const provinceName = provinceSelect.options[provinceSelect.selectedIndex]?.text || '';
        const wardName = wardSelect.options[wardSelect.selectedIndex]?.text || '';

        if (provinceName && wardName) {
            return `${wardName}, ${provinceName}, Việt Nam`;
        }
        return null;
    }
}

// API địa chỉ hành chính Việt Nam
class VietnamAddressAPI {
    constructor() {
        this.baseURL = 'https://tailieu365.com/api/address';
        this.provinces = [];
        this.wards = {};
        this.districts = {};
        this.cache = new Map(); // Cache để tránh gọi API nhiều lần
        this.cacheTimeout = 5 * 60 * 1000; // 5 phút
    }

    // Sử dụng CORS proxy để tránh lỗi CORS
    async fetchWithProxy(url) {
        const proxies = [
            'https://api.allorigins.win/raw?url=', // Most reliable
            'https://corsproxy.io/?',
            'https://thingproxy.freeboard.io/fetch/',
            'https://api.codetabs.com/v1/proxy?quest=',
            null // Direct fetch as last resort
        ];

        for (let i = 0; i < proxies.length; i++) {
            try {
                const proxy = proxies[i];
                const targetUrl = proxy ? proxy + url : url;
                
                console.log(`🔄 Trying proxy ${i + 1}/${proxies.length}: ${proxy || 'direct'}`);
                
                const response = await fetch(targetUrl, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    mode: 'cors'
                });
                
                if (response.ok) {
                    console.log(`✅ Success with proxy ${i + 1}/${proxies.length}`);
                    return response;
                } else {
                    console.log(`❌ Proxy ${i + 1}/${proxies.length} returned status: ${response.status}`);
                }
            } catch (error) {
                console.log(`❌ Proxy ${i + 1}/${proxies.length} failed:`, error.message);
                continue;
            }
        }
        
        throw new Error('All proxies failed');
    }

    // Cache helper methods
    getCacheKey(url) {
        return `api_${btoa(url)}`;
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            console.log(`📦 Using cached data for: ${key}`);
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
        console.log(`💾 Cached data for: ${key}`);
    }

    // Lấy danh sách tỉnh/thành phố
    async getProvinces(mode = 2) {
        try {
            const url = `${this.baseURL}/province?mode=${mode}`;
            const cacheKey = this.getCacheKey(url);
            
            // Kiểm tra cache trước
            const cachedData = this.getFromCache(cacheKey);
            if (cachedData) {
                this.provinces = cachedData;
                console.log(`✅ Đã tải ${cachedData.length} tỉnh/thành phố từ cache`);
                return cachedData;
            }

            console.log('Fetching provinces from tailieu365.com API...');
            const response = await this.fetchWithProxy(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.provinces = data;
            
            // Cache the data
            this.setCache(cacheKey, data);
            
            console.log(`✅ Đã tải ${data.length} tỉnh/thành phố từ API`);
            console.log('📊 Sample data:', data.slice(0, 3));
            
            if (typeof showNotification === 'function') {
                showNotification(`✅ Đã tải ${data.length} tỉnh/thành phố từ API`, 'success');
            }
            
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', error);
            if (typeof showNotification === 'function') {
                showNotification('⚠️ Không thể tải dữ liệu từ API, sử dụng dữ liệu mặc định', 'warning');
            }
            return [];
        }
    }

    // Lấy danh sách quận/huyện theo tỉnh
    async getDistrictsByProvince(provinceId) {
        try {
            const url = `${this.baseURL}/district?provinceId=${provinceId}`;
            const response = await this.fetchWithProxy(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.districts[`province_${provinceId}`] = data;
            
            console.log(`✅ Đã tải ${data.length} quận/huyện cho tỉnh ${provinceId}`);
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách quận/huyện:', error);
            return [];
        }
    }

    // Lấy danh sách xã/phường theo tỉnh
    async getWardsByProvince(provinceId) {
        try {
            const url = `${this.baseURL}/ward?provinceId=${provinceId}`;
            const cacheKey = this.getCacheKey(url);
            
            // Kiểm tra cache trước
            const cachedData = this.getFromCache(cacheKey);
            if (cachedData) {
                this.wards[`province_${provinceId}`] = cachedData;
                console.log(`✅ Đã tải ${cachedData.length} xã/phường cho tỉnh ${provinceId} từ cache`);
                return cachedData;
            }

            const response = await this.fetchWithProxy(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.wards[`province_${provinceId}`] = data;
            
            // Cache the data
            this.setCache(cacheKey, data);
            
            console.log(`✅ Đã tải ${data.length} xã/phường cho tỉnh ${provinceId}`);
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách xã/phường theo tỉnh:', error);
            return [];
        }
    }

    // Lấy danh sách xã/phường theo quận/huyện
    async getWardsByDistrict(districtId) {
        try {
            const url = `${this.baseURL}/ward?districtId=${districtId}`;
            const response = await this.fetchWithProxy(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách xã/phường theo quận/huyện:', error);
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
    
    // Test API connection
    console.log('🧪 Testing API connection...');
    locationSelector.addressAPI.getProvinces(2).then(provinces => {
        if (provinces && provinces.length > 0) {
            console.log('✅ API connection successful!');
            console.log('📊 Sample provinces:', provinces.slice(0, 5));
            
            // Test wards for first province
            if (provinces.length > 0) {
                const firstProvince = provinces[0];
                console.log(`🧪 Testing wards for province: ${firstProvince.name} (ID: ${firstProvince.id})`);
                locationSelector.addressAPI.getWardsByProvince(firstProvince.id).then(wards => {
                    if (wards && wards.length > 0) {
                        console.log(`✅ Wards API working! Found ${wards.length} wards for ${firstProvince.name}`);
                        console.log('📊 Sample wards:', wards.slice(0, 3));
                    } else {
                        console.warn('⚠️ Wards API returned empty data');
                    }
                }).catch(error => {
                    console.error('❌ Wards API failed:', error);
                });
            }
        } else {
            console.warn('⚠️ API returned empty data');
        }
    }).catch(error => {
        console.error('❌ API connection failed:', error);
    });
    
    // Thêm global function để test API
    window.testVietnamAPI = function() {
        console.log('🧪 Manual API test...');
        locationSelector.addressAPI.getProvinces(2).then(provinces => {
            console.log('Provinces:', provinces);
        }).catch(error => {
            console.error('Error:', error);
        });
    };

    // Thêm function để clear cache
    window.clearVietnamAPICache = function() {
        locationSelector.addressAPI.cache.clear();
        console.log('🗑️ Cache cleared');
    };

    // Thêm function để xem cache status
    window.getVietnamAPICacheStatus = function() {
        console.log('📊 Cache status:', {
            size: locationSelector.addressAPI.cache.size,
            entries: Array.from(locationSelector.addressAPI.cache.entries()).map(([key, value]) => ({
                key: key,
                age: Math.round((Date.now() - value.timestamp) / 1000) + 's ago'
            }))
        });
    };

    // Thêm function để test API trực tiếp
    window.testDirectAPI = function() {
        console.log('🧪 Testing direct API call...');
        fetch('https://tailieu365.com/api/address/province?mode=2', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            console.log('Direct API response status:', response.status);
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        }).then(data => {
            console.log('Direct API data:', data);
        }).catch(error => {
            console.error('Direct API error:', error);
        });
    };
}); 