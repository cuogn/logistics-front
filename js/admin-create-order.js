// Admin Create Order - Auto-fill functionality
let distanceCalculator = null;
let calculatedFee = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeDistanceCalculator();
    setupDropdownListeners();
    setupFormValidation();
    setupPriceListener();
    loadStaffList();
});

async function loadStaffList() {
    const select = document.getElementById('assignedTo');
    if (!select) return;
    select.innerHTML = '<option value="">Đang tải danh sách nhân viên...</option>';
    try {
        const res = await api.getStaffList();
        console.log('Staff list response:', res); // Debug log
        
        if (res.success && Array.isArray(res.data)) {
            console.log('Staff data:', res.data); // Debug log
            
            select.innerHTML = '<option value="">-- Chọn nhân viên xử lý --</option>' +
                res.data.map(staff => {
                    // Hiển thị role nếu có, nếu không thì hiển thị username
                    const displayRole = staff.role || staff.username || 'N/A';
                    return `<option value="${staff.id}">${staff.full_name} (${displayRole})</option>`;
                }).join('');
        } else {
            select.innerHTML = '<option value="">Không có nhân viên nào</option>';
        }
    } catch (e) {
        console.error('Error loading staff list:', e);
        select.innerHTML = '<option value="">Lỗi tải danh sách nhân viên</option>';
    }
}

function setupPriceListener() {
    // Lắng nghe sự thay đổi của priceValue để cập nhật shippingFee
    const priceValue = document.getElementById('priceValue');
    const shippingFee = document.getElementById('shippingFee');
    
    if (priceValue && shippingFee) {
        // Tạo observer để theo dõi thay đổi nội dung
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const priceText = priceValue.textContent;
                    const extractedPrice = extractPriceFromText(priceText);
                    
                    if (extractedPrice > 0) {
                        const roundedPrice = Math.round(extractedPrice); // Đảm bảo là số nguyên
                        shippingFee.value = roundedPrice;
                        calculatedFee = roundedPrice; // Cập nhật biến global
                        console.log('Updated shipping fee:', roundedPrice);
                    }
                }
            });
        });
        
        // Bắt đầu theo dõi
        observer.observe(priceValue, {
            childList: true,
            characterData: true,
            subtree: true
        });
        
        console.log('Price listener setup completed');
    } else {
        console.warn('Price elements not found');
    }
}

function extractPriceFromText(text) {
    if (!text) return 0;
    
    // Loại bỏ ký tự đặc biệt và chữ
    const cleanText = text.replace(/[^\d.,]/g, '');
    
    // Xử lý format tiền tệ Việt Nam (có dấu phẩy ngăn cách hàng nghìn)
    const priceString = cleanText.replace(/\./g, '').replace(',', '.');
    
    const price = parseFloat(priceString);
    
    console.log('Extracting price from text:', text, '->', price);
    
    return isNaN(price) ? 0 : price;
}

function initializeDistanceCalculator() {
    try {
        distanceCalculator = new DistanceCalculator();
        
        // Override displayDistanceInfo để cập nhật phí vận chuyển ngay lập tức
        if (distanceCalculator && distanceCalculator.displayDistanceInfo) {
            distanceCalculator.displayDistanceInfo = function(route) {
                if (route && route.summary && route.summary.distance) {
                    const distance = route.summary.distance;
                    const duration = route.summary.travelTime;
                    
                    document.getElementById('distanceValue').textContent = this.formatDistance(distance);
                    document.getElementById('durationValue').textContent = this.formatDuration(duration);
                    
                    calculatedFee = this.calculatePrice(distance);
                    document.getElementById('priceValue').textContent = formatCurrency(calculatedFee);
                    
                    // Cập nhật phí vận chuyển ngay lập tức
                    const shippingFee = document.getElementById('shippingFee');
                    if (shippingFee) {
                        shippingFee.value = calculatedFee;
                    }
                    
                    document.getElementById('distanceInfo').style.display = 'block';
                    
                    // Cập nhật địa chỉ nếu có
                    if (this.point1Address) {
                        const senderAddress = document.getElementById('senderAddress');
                        if (senderAddress) senderAddress.value = this.point1Address;
                    }
                    if (this.point2Address) {
                        const receiverAddress = document.getElementById('receiverAddress');
                        if (receiverAddress) receiverAddress.value = this.point2Address;
                    }
                }
            };
        }
        
        // Override updateInputs để cập nhật địa chỉ ngay lập tức
        if (distanceCalculator && distanceCalculator.updateInputs) {
            distanceCalculator.updateInputs = function(point, position) {
                if (point === 'A' && this.point1Address) {
                    const senderAddress = document.getElementById('senderAddress');
                    if (senderAddress) senderAddress.value = this.point1Address;
                } else if (point === 'B' && this.point2Address) {
                    const receiverAddress = document.getElementById('receiverAddress');
                    if (receiverAddress) receiverAddress.value = this.point2Address;
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
                    const senderAddress = document.getElementById('senderAddress');
                    if (senderAddress) senderAddress.value = this.point1Address;
                } else if (point === 2 && this.point2Address) {
                    const receiverAddress = document.getElementById('receiverAddress');
                    if (receiverAddress) receiverAddress.value = this.point2Address;
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
                    const senderAddress = document.getElementById('senderAddress');
                    if (senderAddress) senderAddress.value = this.point1Address;
                } else if (point === 2 && this.point2Address) {
                    const receiverAddress = document.getElementById('receiverAddress');
                    if (receiverAddress) receiverAddress.value = this.point2Address;
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
    let isSubmitting = false; // Flag để tránh duplicate submit
    
    // Form submit
    document.getElementById('createOrderForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Kiểm tra nếu đang submit thì không cho submit nữa
        if (isSubmitting) {
            console.log('Form is already submitting, ignoring duplicate submit');
            return;
        }
        
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
        
        // Set submitting flag
        isSubmitting = true;
        
        // Disable submit button và hiển thị loading
        const submitBtn = document.getElementById('submitOrderBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        if (submitBtn && btnText && btnLoading) {
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-flex';
        }
        
        try {
            // Lấy thông tin điểm A/B từ distanceCalculator
            const senderAddress = distanceCalculator && distanceCalculator.point1Address ? 
                distanceCalculator.point1Address : document.getElementById('senderAddress').value;
            const receiverAddress = distanceCalculator && distanceCalculator.point2Address ? 
                distanceCalculator.point2Address : document.getElementById('receiverAddress').value;
            
            // Lấy lat/lng nếu có
            const senderLat = distanceCalculator && distanceCalculator.point1 ? distanceCalculator.point1.lat : null;
            const senderLng = distanceCalculator && distanceCalculator.point1 ? distanceCalculator.point1.lng : null;
            const receiverLat = distanceCalculator && distanceCalculator.point2 ? distanceCalculator.point2.lat : null;
            const receiverLng = distanceCalculator && distanceCalculator.point2 ? distanceCalculator.point2.lng : null;
            
            // Lấy các trường còn lại
            const formData = new FormData(e.target);
            const orderData = Object.fromEntries(formData.entries());
            
            // Đảm bảo các trường bắt buộc có giá trị
            if (!orderData.sender_name || !orderData.receiver_name || !orderData.sender_phone || !orderData.receiver_phone) {
                alert('Vui lòng điền đầy đủ thông tin người gửi và người nhận');
                return;
            }
            
            if (!senderAddress || !receiverAddress) {
                alert('Vui lòng chọn địa chỉ người gửi và người nhận');
                return;
            }
            
            if (!orderData.package_weight || parseFloat(orderData.package_weight) <= 0) {
                alert('Vui lòng nhập trọng lượng gói hàng hợp lệ');
                return;
            }
            
            // Chuẩn bị dữ liệu gửi lên - chỉ gửi các trường có giá trị
            const finalOrderData = {
                sender_name: orderData.sender_name,
                sender_phone: orderData.sender_phone,
                sender_address: senderAddress,
                receiver_name: orderData.receiver_name,
                receiver_phone: orderData.receiver_phone,
                receiver_address: receiverAddress,
                package_weight: parseFloat(orderData.package_weight),
                package_description: orderData.package_description || '',
                shipping_fee: Math.round(parseFloat(calculatedFee || 0)), // Đảm bảo là số nguyên
                status: 'pending',
                assigned_to: document.getElementById('assignedTo').value
            };
            
            // Chỉ thêm lat/lng nếu có giá trị và không phải null
            if (senderLat && senderLng && !isNaN(senderLat) && !isNaN(senderLng)) {
                finalOrderData.sender_lat = parseFloat(senderLat);
                finalOrderData.sender_lng = parseFloat(senderLng);
            }
            
            if (receiverLat && receiverLng && !isNaN(receiverLat) && !isNaN(receiverLng)) {
                finalOrderData.receiver_lat = parseFloat(receiverLat);
                finalOrderData.receiver_lng = parseFloat(receiverLng);
            }
            
            // Loại bỏ các trường có giá trị null hoặc undefined
            Object.keys(finalOrderData).forEach(key => {
                if (finalOrderData[key] === null || finalOrderData[key] === undefined) {
                    delete finalOrderData[key];
                }
            });
            
            console.log('Submitting order data:', finalOrderData);
            
            const response = await api.createOrder(finalOrderData);
            if (response.success) {
                alert('Tạo đơn hàng thành công!');
                window.location.href = 'admin-orders.html';
            } else {
                alert(response.message || 'Tạo đơn hàng thất bại');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            alert(error.message || 'Có lỗi xảy ra khi tạo đơn hàng');
        } finally {
            // Reset submitting flag và enable button
            isSubmitting = false;
            
            if (submitBtn && btnText && btnLoading) {
                submitBtn.disabled = false;
                btnText.style.display = 'inline-flex';
                btnLoading.style.display = 'none';
            }
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