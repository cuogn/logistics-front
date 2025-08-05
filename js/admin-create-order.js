// Admin Create Order - Auto-fill functionality
let distanceCalculator = null;
let calculatedFee = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeDistanceCalculator();
    setupDropdownListeners();
    setupFormValidation();
});

function initializeDistanceCalculator() {
    try {
        distanceCalculator = new DistanceCalculator();
        
        // Override displayDistanceInfo để cập nhật phí vận chuyển ngay lập tức
        if (distanceCalculator && distanceCalculator.displayDistanceInfo) {
            distanceCalculator.displayDistanceInfo = function(route) {
                if (route && route.distance) {
                    document.getElementById('distanceValue').textContent = this.formatDistance(route.distance);
                    document.getElementById('durationValue').textContent = this.formatDuration(route.duration);
                    calculatedFee = this.calculatePrice(route.distance);
                    document.getElementById('priceValue').textContent = formatCurrency(calculatedFee);
                    
                    // Cập nhật phí vận chuyển ngay lập tức
                    document.getElementById('shippingFee').value = calculatedFee;
                    
                    const weight = parseFloat(document.getElementById('packageWeight').value) || 0;
                    const weightFee = weight * 1000;
                    // Không cần weightFee vì không có element này trong HTML
                    document.getElementById('distanceInfo').style.display = 'block';
                    
                    // Cập nhật địa chỉ nếu có
                    if (this.point1Address) {
                        document.getElementById('senderAddress').value = this.point1Address;
                    }
                    if (this.point2Address) {
                        document.getElementById('receiverAddress').value = this.point2Address;
                    }
                }
            };
        }
        
        // Override updateInputs để cập nhật địa chỉ ngay lập tức
        if (distanceCalculator && distanceCalculator.updateInputs) {
            distanceCalculator.updateInputs = function(point, position) {
                if (point === 1 && this.point1Address) {
                    document.getElementById('senderAddress').value = this.point1Address;
                } else if (point === 2 && this.point2Address) {
                    document.getElementById('receiverAddress').value = this.point2Address;
                }
            };
        }
        
        // Override setPoint để cập nhật địa chỉ ngay khi pick điểm
        if (distanceCalculator && distanceCalculator.setPoint) {
            const originalSetPoint = distanceCalculator.setPoint;
            distanceCalculator.setPoint = function(point, position) {
                originalSetPoint.call(this, point, position);
                
                // Cập nhật địa chỉ ngay lập tức
                if (point === 1 && this.point1Address) {
                    document.getElementById('senderAddress').value = this.point1Address;
                } else if (point === 2 && this.point2Address) {
                    document.getElementById('receiverAddress').value = this.point2Address;
                }
            };
        }
        
        // Override geocodeAddress để cập nhật địa chỉ từ dropdown
        if (distanceCalculator && distanceCalculator.geocodeAddress) {
            const originalGeocodeAddress = distanceCalculator.geocodeAddress;
            distanceCalculator.geocodeAddress = function(address, point) {
                originalGeocodeAddress.call(this, address, point);
                
                // Cập nhật địa chỉ ngay lập tức
                if (point === 1 && this.point1Address) {
                    document.getElementById('senderAddress').value = this.point1Address;
                } else if (point === 2 && this.point2Address) {
                    document.getElementById('receiverAddress').value = this.point2Address;
                }
            };
        }
        
    } catch (error) {
        console.error('Error initializing distance calculator:', error);
    }
}

// Setup event listeners cho dropdown để cập nhật địa chỉ ngay lập tức
function setupDropdownListeners() {
    // Point A dropdowns
    const pointAProvince = document.getElementById('pointAProvince');
    const pointADistrict = document.getElementById('pointADistrict');
    const pointAWard = document.getElementById('pointAWard');
    
    if (pointAProvince) {
        pointAProvince.addEventListener('change', function() {
            updateAddressFromDropdown('A');
        });
    }
    
    if (pointADistrict) {
        pointADistrict.addEventListener('change', function() {
            updateAddressFromDropdown('A');
        });
    }
    
    if (pointAWard) {
        pointAWard.addEventListener('change', function() {
            updateAddressFromDropdown('A');
        });
    }
    
    // Point B dropdowns
    const pointBProvince = document.getElementById('pointBProvince');
    const pointBDistrict = document.getElementById('pointBDistrict');
    const pointBWard = document.getElementById('pointBWard');
    
    if (pointBProvince) {
        pointBProvince.addEventListener('change', function() {
            updateAddressFromDropdown('B');
        });
    }
    
    if (pointBDistrict) {
        pointBDistrict.addEventListener('change', function() {
            updateAddressFromDropdown('B');
        });
    }
    
    if (pointBWard) {
        pointBWard.addEventListener('change', function() {
            updateAddressFromDropdown('B');
        });
    }
}

// Cập nhật địa chỉ từ dropdown
function updateAddressFromDropdown(point) {
    const provinceSelect = document.getElementById(`point${point}Province`);
    const districtSelect = document.getElementById(`point${point}District`);
    const wardSelect = document.getElementById(`point${point}Ward`);
    
    if (provinceSelect && districtSelect && wardSelect) {
        const province = provinceSelect.options[provinceSelect.selectedIndex]?.text || '';
        const district = districtSelect.options[districtSelect.selectedIndex]?.text || '';
        const ward = wardSelect.options[wardSelect.selectedIndex]?.text || '';
        
        if (province && district && ward) {
            const fullAddress = `${ward}, ${district}, ${province}`;
            
            if (point === 'A') {
                document.getElementById('senderAddress').value = fullAddress;
                if (distanceCalculator) {
                    distanceCalculator.point1Address = fullAddress;
                }
            } else if (point === 'B') {
                document.getElementById('receiverAddress').value = fullAddress;
                if (distanceCalculator) {
                    distanceCalculator.point2Address = fullAddress;
                }
            }
        }
    }
}

// Setup form validation
function setupFormValidation() {
    // Form submit
    document.getElementById('createOrderForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate trọng lượng
        const weight = parseFloat(document.getElementById('packageWeight').value);
        if (isNaN(weight) || weight <= 0) {
            document.getElementById('packageWeightError').classList.add('show');
            return;
        } else {
            document.getElementById('packageWeightError').classList.remove('show');
        }
        
        // Validate đã có phí vận chuyển
        if (!calculatedFee) {
            document.getElementById('shippingFeeError').classList.add('show');
            return;
        } else {
            document.getElementById('shippingFeeError').classList.remove('show');
        }
        
        // Validate các trường bắt buộc
        const requiredFields = ['senderName', 'senderPhone', 'senderAddress', 'receiverName', 'receiverPhone', 'receiverAddress'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                document.getElementById(fieldId + 'Error').classList.add('show');
                isValid = false;
            } else {
                document.getElementById(fieldId + 'Error').classList.remove('show');
            }
        });
        
        if (!isValid) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        
        // Lấy thông tin điểm A/B từ distanceCalculator
        const senderAddress = distanceCalculator.point1Address || document.getElementById('senderAddress').value;
        const receiverAddress = distanceCalculator.point2Address || document.getElementById('receiverAddress').value;
        
        // Lấy lat/lng nếu có
        const senderLat = distanceCalculator.point1 ? distanceCalculator.point1.lat : null;
        const senderLng = distanceCalculator.point1 ? distanceCalculator.point1.lng : null;
        const receiverLat = distanceCalculator.point2 ? distanceCalculator.point2.lat : null;
        const receiverLng = distanceCalculator.point2 ? distanceCalculator.point2.lng : null;
        
        // Lấy các trường còn lại
        const formData = new FormData(e.target);
        const orderData = Object.fromEntries(formData.entries());
        orderData.sender_address = senderAddress;
        orderData.receiver_address = receiverAddress;
        orderData.sender_lat = senderLat;
        orderData.sender_lng = senderLng;
        orderData.receiver_lat = receiverLat;
        orderData.receiver_lng = receiverLng;
        orderData.shipping_fee = calculatedFee;
        
        try {
            const response = await api.createOrder(orderData);
            if (response.success) {
                alert('Tạo đơn hàng thành công!');
                window.location.href = 'admin-orders.html';
            } else {
                alert(response.message || 'Tạo đơn hàng thất bại');
            }
        } catch (error) {
            alert(error.message || 'Có lỗi xảy ra khi tạo đơn hàng');
        }
    });

    // Input validation listeners
    document.getElementById('senderPhone').addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '');
    });

    document.getElementById('receiverPhone').addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '');
    });

    document.getElementById('packageWeight').addEventListener('input', function() {
        const weight = parseFloat(this.value);
        if (this.value && (isNaN(weight) || weight <= 0)) {
            document.getElementById('packageWeightError').classList.add('show');
        } else {
            document.getElementById('packageWeightError').classList.remove('show');
        }
    });
}

function logout() { api.logout(); }
function goBack() {
    if (confirm('Bạn có chắc chắn muốn hủy? Dữ liệu đã nhập sẽ bị mất.')) {
        window.location.href = 'admin-orders.html';
    }
}
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}