// Location Selector cho địa chỉ hành chính Việt Nam
class VietnamLocationSelector {
  constructor() {
    this.addressAPI = new VietnamAddressAPI();
    this.initializeSelectors();
    this.loadProvinces();
  }

  initializeSelectors() {
    // Điểm A
    this.pointAProvince = document.getElementById("pointAProvince");
    this.pointAWard = document.getElementById("pointAWard");
    this.pointACoords = document.getElementById("pointACoords");

    // Điểm B
    this.pointBProvince = document.getElementById("pointBProvince");
    this.pointBWard = document.getElementById("pointBWard");
    this.pointBCoords = document.getElementById("pointBCoords");

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Điểm A
    this.pointAProvince.addEventListener("change", () =>
      this.onProvinceChange("A")
    );
    this.pointAWard.addEventListener("change", () => this.onWardChange("A"));

    // Điểm B
    this.pointBProvince.addEventListener("change", () =>
      this.onProvinceChange("B")
    );
    this.pointBWard.addEventListener("change", () => this.onWardChange("B"));
  }

  async loadProvinces() {
    try {
      console.log("🔄 Đang tải danh sách tỉnh/thành phố từ API...");

      // Show loading indicator
      this.showLoadingIndicator("Đang tải danh sách tỉnh/thành phố...");

      const provinces = await this.addressAPI.getProvinces(2); // mode=2 để lấy tỉnh mới

      if (!provinces || provinces.length === 0) {
        console.warn(
          "Không có dữ liệu tỉnh/thành phố từ API, sử dụng dữ liệu mặc định"
        );
        this.showNotification(
          "⚠️ Không thể tải dữ liệu từ API, sử dụng dữ liệu mặc định",
          "warning"
        );
        // Comprehensive fallback data
        const fallbackProvinces = [
          { id: 1, name: "Hà Nội" },
          { id: 2, name: "TP. Hồ Chí Minh" },
          { id: 3, name: "Đà Nẵng" },
          { id: 4, name: "Hải Phòng" },
          { id: 5, name: "Cần Thơ" },
          { id: 6, name: "An Giang" },
          { id: 7, name: "Bà Rịa - Vũng Tàu" },
          { id: 8, name: "Bắc Giang" },
          { id: 9, name: "Bắc Kạn" },
          { id: 10, name: "Bạc Liêu" },
          { id: 11, name: "Bắc Ninh" },
          { id: 12, name: "Bến Tre" },
          { id: 13, name: "Bình Định" },
          { id: 14, name: "Bình Dương" },
          { id: 15, name: "Bình Phước" },
          { id: 16, name: "Bình Thuận" },
          { id: 17, name: "Cà Mau" },
          { id: 18, name: "Cao Bằng" },
          { id: 19, name: "Đắk Lắk" },
          { id: 20, name: "Đắk Nông" },
          { id: 21, name: "Điện Biên" },
          { id: 22, name: "Đồng Nai" },
          { id: 23, name: "Đồng Tháp" },
          { id: 24, name: "Gia Lai" },
          { id: 25, name: "Hà Giang" },
          { id: 26, name: "Hà Nam" },
          { id: 27, name: "Hà Tĩnh" },
          { id: 28, name: "Hải Dương" },
          { id: 29, name: "Hậu Giang" },
          { id: 30, name: "Hòa Bình" },
          { id: 31, name: "Hưng Yên" },
          { id: 32, name: "Khánh Hòa" },
          { id: 33, name: "Kiên Giang" },
          { id: 34, name: "Kon Tum" },
          { id: 35, name: "Lai Châu" },
          { id: 36, name: "Lâm Đồng" },
          { id: 37, name: "Lạng Sơn" },
          { id: 38, name: "Lào Cai" },
          { id: 39, name: "Long An" },
          { id: 40, name: "Nam Định" },
          { id: 41, name: "Nghệ An" },
          { id: 42, name: "Ninh Bình" },
          { id: 43, name: "Ninh Thuận" },
          { id: 44, name: "Phú Thọ" },
          { id: 45, name: "Phú Yên" },
          { id: 46, name: "Quảng Bình" },
          { id: 47, name: "Quảng Nam" },
          { id: 48, name: "Quảng Ngãi" },
          { id: 49, name: "Quảng Ninh" },
          { id: 50, name: "Quảng Trị" },
          { id: 51, name: "Sóc Trăng" },
          { id: 52, name: "Sơn La" },
          { id: 53, name: "Tây Ninh" },
          { id: 54, name: "Thái Bình" },
          { id: 55, name: "Thái Nguyên" },
          { id: 56, name: "Thanh Hóa" },
          { id: 57, name: "Thừa Thiên Huế" },
          { id: 58, name: "Tiền Giang" },
          { id: 59, name: "Trà Vinh" },
          { id: 60, name: "Tuyên Quang" },
          { id: 61, name: "Vĩnh Long" },
          { id: 62, name: "Vĩnh Phúc" },
          { id: 63, name: "Yên Bái" },
        ];
        this.updateProvinceDropdowns(fallbackProvinces);
        return;
      }

      this.updateProvinceDropdowns(provinces);
      console.log(`✅ Đã tải ${provinces.length} tỉnh/thành phố từ API`);
      this.showNotification(
        `✅ Đã tải ${provinces.length} tỉnh/thành phố từ API`,
        "success"
      );
      this.hideLoadingIndicator();
    } catch (error) {
      console.error("Lỗi khi tải danh sách tỉnh/thành phố:", error);
      this.showNotification(
        "⚠️ Lỗi khi tải dữ liệu từ API, sử dụng dữ liệu mặc định",
        "error"
      );
      this.hideLoadingIndicator();
      // Fallback data in case of error - same comprehensive list
      const fallbackProvinces = [
        { id: 1, name: "Hà Nội" },
        { id: 2, name: "TP. Hồ Chí Minh" },
        { id: 3, name: "Đà Nẵng" },
        { id: 4, name: "Hải Phòng" },
        { id: 5, name: "Cần Thơ" },
        { id: 6, name: "An Giang" },
        { id: 7, name: "Bà Rịa - Vũng Tàu" },
        { id: 8, name: "Bắc Giang" },
        { id: 9, name: "Bắc Kạn" },
        { id: 10, name: "Bạc Liêu" },
        { id: 11, name: "Bắc Ninh" },
        { id: 12, name: "Bến Tre" },
        { id: 13, name: "Bình Định" },
        { id: 14, name: "Bình Dương" },
        { id: 15, name: "Bình Phước" },
        { id: 16, name: "Bình Thuận" },
        { id: 17, name: "Cà Mau" },
        { id: 18, name: "Cao Bằng" },
        { id: 19, name: "Đắk Lắk" },
        { id: 20, name: "Đắk Nông" },
        { id: 21, name: "Điện Biên" },
        { id: 22, name: "Đồng Nai" },
        { id: 23, name: "Đồng Tháp" },
        { id: 24, name: "Gia Lai" },
        { id: 25, name: "Hà Giang" },
        { id: 26, name: "Hà Nam" },
        { id: 27, name: "Hà Tĩnh" },
        { id: 28, name: "Hải Dương" },
        { id: 29, name: "Hậu Giang" },
        { id: 30, name: "Hòa Bình" },
        { id: 31, name: "Hưng Yên" },
        { id: 32, name: "Khánh Hòa" },
        { id: 33, name: "Kiên Giang" },
        { id: 34, name: "Kon Tum" },
        { id: 35, name: "Lai Châu" },
        { id: 36, name: "Lâm Đồng" },
        { id: 37, name: "Lạng Sơn" },
        { id: 38, name: "Lào Cai" },
        { id: 39, name: "Long An" },
        { id: 40, name: "Nam Định" },
        { id: 41, name: "Nghệ An" },
        { id: 42, name: "Ninh Bình" },
        { id: 43, name: "Ninh Thuận" },
        { id: 44, name: "Phú Thọ" },
        { id: 45, name: "Phú Yên" },
        { id: 46, name: "Quảng Bình" },
        { id: 47, name: "Quảng Nam" },
        { id: 48, name: "Quảng Ngãi" },
        { id: 49, name: "Quảng Ninh" },
        { id: 50, name: "Quảng Trị" },
        { id: 51, name: "Sóc Trăng" },
        { id: 52, name: "Sơn La" },
        { id: 53, name: "Tây Ninh" },
        { id: 54, name: "Thái Bình" },
        { id: 55, name: "Thái Nguyên" },
        { id: 56, name: "Thanh Hóa" },
        { id: 57, name: "Thừa Thiên Huế" },
        { id: 58, name: "Tiền Giang" },
        { id: 59, name: "Trà Vinh" },
        { id: 60, name: "Tuyên Quang" },
        { id: 61, name: "Vĩnh Long" },
        { id: 62, name: "Vĩnh Phúc" },
        { id: 63, name: "Yên Bái" },
      ];
      this.updateProvinceDropdowns(fallbackProvinces);
    }
  }

  updateProvinceDropdowns(provinces) {
    // Cập nhật dropdown tỉnh cho điểm A
    this.pointAProvince.innerHTML =
      '<option value="">Chọn tỉnh/thành phố</option>';
    provinces.forEach((province) => {
      const option = document.createElement("option");
      option.value = province.id;
      option.textContent = province.name;
      this.pointAProvince.appendChild(option);
    });

    // Cập nhật dropdown tỉnh cho điểm B
    this.pointBProvince.innerHTML =
      '<option value="">Chọn tỉnh/thành phố</option>';
    provinces.forEach((province) => {
      const option = document.createElement("option");
      option.value = province.id;
      option.textContent = province.name;
      this.pointBProvince.appendChild(option);
    });
  }

  async onProvinceChange(point) {
    const provinceSelect =
      point === "A" ? this.pointAProvince : this.pointBProvince;
    const wardSelect = point === "A" ? this.pointAWard : this.pointBWard;
    const coordsSpan = point === "A" ? this.pointACoords : this.pointBCoords;

    const provinceId = provinceSelect.value;

    // Reset ward
    wardSelect.innerHTML = '<option value="">Chọn xã/phường</option>';
    wardSelect.disabled = true;
    coordsSpan.textContent = "--";

    if (provinceId) {
      try {
        console.log(`🔄 Đang tải xã/phường cho tỉnh ${provinceId}...`);
        // Lấy xã/phường trực tiếp theo tỉnh
        const wards = await this.addressAPI.getWardsByProvince(provinceId);

        if (!wards || wards.length === 0) {
          console.warn(
            `Không có dữ liệu xã/phường cho tỉnh ${provinceId}, sử dụng dữ liệu mặc định`
          );
          // Comprehensive fallback wards based on province
          const fallbackWards = this.getFallbackWardsForProvince(provinceId);
          this.updateWardDropdown(wardSelect, fallbackWards);
        } else {
          this.updateWardDropdown(wardSelect, wards);
        }

        wardSelect.disabled = false;
        console.log(
          `✅ Đã tải ${
            wards ? wards.length : 0
          } xã/phường cho tỉnh ${provinceId}`
        );
      } catch (error) {
        console.error("Lỗi khi tải danh sách xã/phường:", error);
        // Fallback wards in case of error
        const fallbackWards = this.getFallbackWardsForProvince(provinceId);
        this.updateWardDropdown(wardSelect, fallbackWards);
        wardSelect.disabled = false;
      }
    }
  }

  updateWardDropdown(wardSelect, wards) {
    // Cập nhật dropdown xã/phường
    wards.forEach((ward) => {
      const option = document.createElement("option");
      option.value = ward.id;
      option.textContent = ward.name;
      wardSelect.appendChild(option);
    });
  }

  // Lấy dữ liệu fallback cho xã/phường theo tỉnh
  getFallbackWardsForProvince(provinceId) {
    const fallbackWards = {
      // Hà Nội
      1: [
        { id: 1, name: "Phường Phúc Xá" },
        { id: 2, name: "Phường Trúc Bạch" },
        { id: 3, name: "Phường Vĩnh Phú" },
        { id: 4, name: "Phường Cống Vị" },
        { id: 5, name: "Phường Liễu Giai" },
        { id: 6, name: "Phường Nguyễn Trung Trực" },
        { id: 7, name: "Phường Quán Thánh" },
        { id: 8, name: "Phường Ngọc Hà" },
        { id: 9, name: "Phường Điện Biên" },
        { id: 10, name: "Phường Đội Cấn" },
      ],
      // TP. Hồ Chí Minh
      2: [
        { id: 1, name: "Phường Tân Định" },
        { id: 2, name: "Phường Đa Kao" },
        { id: 3, name: "Phường Bến Nghé" },
        { id: 4, name: "Phường Bến Thành" },
        { id: 5, name: "Phường Nguyễn Thái Bình" },
        { id: 6, name: "Phường Phạm Ngũ Lão" },
        { id: 7, name: "Phường Cầu Ông Lãnh" },
        { id: 8, name: "Phường Cô Giang" },
        { id: 9, name: "Phường Nguyễn Cư Trinh" },
        { id: 10, name: "Phường Cầu Kho" },
      ],
      // Đà Nẵng
      3: [
        { id: 1, name: "Phường Thạch Thang" },
        { id: 2, name: "Phường Hải Châu I" },
        { id: 3, name: "Phường Hải Châu II" },
        { id: 4, name: "Phường Phước Ninh" },
        { id: 5, name: "Phường Hòa Thuận Tây" },
        { id: 6, name: "Phường Hòa Thuận Đông" },
        { id: 7, name: "Phường Nam Dương" },
        { id: 8, name: "Phường Bình Hiên" },
        { id: 9, name: "Phường Bình Thuận" },
        { id: 10, name: "Phường Hòa Cường Bắc" },
      ],
      // Hải Phòng
      4: [
        { id: 1, name: "Phường Máy Chai" },
        { id: 2, name: "Phường Máy Tơ" },
        { id: 3, name: "Phường Lê Lợi" },
        { id: 4, name: "Phường Lê Chân" },
        { id: 5, name: "Phường Cát Dài" },
        { id: 6, name: "Phường An Biên" },
        { id: 7, name: "Phường Lam Sơn" },
        { id: 8, name: "Phường An Dương" },
        { id: 9, name: "Phường Trần Nguyên Hãn" },
        { id: 10, name: "Phường Hồ Nam" },
      ],
      // Cần Thơ
      5: [
        { id: 1, name: "Phường Tân An" },
        { id: 2, name: "Phường An Hòa" },
        { id: 3, name: "Phường Thới Bình" },
        { id: 4, name: "Phường An Nghiệp" },
        { id: 5, name: "Phường An Cư" },
        { id: 6, name: "Phường Tân Lộc" },
        { id: 7, name: "Phường An Phú" },
        { id: 8, name: "Phường An Khánh" },
        { id: 9, name: "Phường An Thới" },
        { id: 10, name: "Phường Cái Khế" },
      ],
      // An Giang
      6: [
        { id: 1, name: "Phường Mỹ Bình" },
        { id: 2, name: "Phường Mỹ Long" },
        { id: 3, name: "Phường Đông Xuyên" },
        { id: 4, name: "Phường Mỹ Xuyên" },
        { id: 5, name: "Phường Bình Đức" },
        { id: 6, name: "Phường Bình Khánh" },
        { id: 7, name: "Phường Mỹ Phước" },
        { id: 8, name: "Phường Mỹ Quý" },
        { id: 9, name: "Phường Mỹ Thạnh" },
        { id: 10, name: "Phường Mỹ Thới" },
      ],
      // Bà Rịa - Vũng Tàu
      7: [
        { id: 1, name: "Phường 1" },
        { id: 2, name: "Phường 2" },
        { id: 3, name: "Phường 3" },
        { id: 4, name: "Phường 4" },
        { id: 5, name: "Phường 5" },
        { id: 6, name: "Phường 6" },
        { id: 7, name: "Phường 7" },
        { id: 8, name: "Phường 8" },
        { id: 9, name: "Phường 9" },
        { id: 10, name: "Phường 10" },
      ],
      // Bắc Giang
      8: [
        { id: 1, name: "Phường Thọ Xương" },
        { id: 2, name: "Phường Trần Nguyên Hãn" },
        { id: 3, name: "Phường Ngô Quyền" },
        { id: 4, name: "Phường Trần Phú" },
        { id: 5, name: "Phường Lê Lợi" },
        { id: 6, name: "Phường Hoàng Văn Thụ" },
        { id: 7, name: "Phường Đồng Tâm" },
        { id: 8, name: "Phường Tân Mỹ" },
        { id: 9, name: "Phường Dĩnh Kế" },
        { id: 10, name: "Phường Xương Giang" },
      ],
    };

    // Trả về wards cho tỉnh cụ thể hoặc wards mặc định
    return fallbackWards[provinceId] || this.getDefaultWards(provinceId);
  }

  // Lấy wards mặc định cho tỉnh không có dữ liệu cụ thể
  getDefaultWards(provinceId) {
    const defaultWards = [];
    for (let i = 1; i <= 15; i++) {
      defaultWards.push({
        id: i,
        name: `Phường ${i}`,
      });
    }
    return defaultWards;
  }

  // Helper methods for UI feedback
  showLoadingIndicator(message) {
    // Create or update loading indicator
    let indicator = document.getElementById("location-loading-indicator");
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.id = "location-loading-indicator";
      indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #007bff;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                z-index: 10000;
                font-size: 14px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            `;
      document.body.appendChild(indicator);
    }
    indicator.textContent = message;
    indicator.style.display = "block";
  }

  hideLoadingIndicator() {
    const indicator = document.getElementById("location-loading-indicator");
    if (indicator) {
      indicator.style.display = "none";
    }
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 5px;
            color: white;
            font-size: 14px;
            z-index: 10001;
            max-width: 300px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-out;
        `;

    // Set background color based on type
    const colors = {
      success: "#28a745",
      error: "#dc3545",
      warning: "#ffc107",
      info: "#17a2b8",
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideOut 0.3s ease-in";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }

  async onWardChange(point) {
    const provinceSelect =
      point === "A" ? this.pointAProvince : this.pointBProvince;
    const wardSelect = point === "A" ? this.pointAWard : this.pointBWard;
    const coordsSpan = point === "A" ? this.pointACoords : this.pointBCoords;

    const provinceId = provinceSelect.value;
    const wardId = wardSelect.value;

    if (wardId) {
      // Tạo địa chỉ đầy đủ
      const provinceName =
        provinceSelect.options[provinceSelect.selectedIndex].text;
      const wardName = wardSelect.options[wardSelect.selectedIndex].text;

      const fullAddress = `${wardName}, ${provinceName}, Việt Nam`;
      coordsSpan.textContent = fullAddress;

      console.log(`Địa chỉ ${point}:`, fullAddress);

      // Trigger event để DistanceCalculator có thể lấy tọa độ
      const event = new CustomEvent("wardSelected", {
        detail: {
          point: point,
          address: fullAddress,
          provinceId: provinceId,
          wardId: wardId,
        },
      });
      document.dispatchEvent(event);
    }
  }

  // Lấy thông tin địa chỉ đầy đủ
  getFullAddress(point) {
    const provinceSelect =
      point === "A" ? this.pointAProvince : this.pointBProvince;
    const wardSelect = point === "A" ? this.pointAWard : this.pointBWard;

    const provinceName =
      provinceSelect.options[provinceSelect.selectedIndex]?.text || "";
    const wardName = wardSelect.options[wardSelect.selectedIndex]?.text || "";

    if (provinceName && wardName) {
      return `${wardName}, ${provinceName}, Việt Nam`;
    }
    return null;
  }
}

// API địa chỉ hành chính Việt Nam
class VietnamAddressAPI {
  constructor() {
    this.baseURL = "https://tailieu365.com/api/address";
    this.provinces = [];
    this.wards = {};
    this.districts = {};
    this.cache = new Map(); // Cache để tránh gọi API nhiều lần
    this.cacheTimeout = 5 * 60 * 1000; // 5 phút
  }

  // Sử dụng CORS proxy để tránh lỗi CORS
  async fetchWithProxy(url) {
    const proxies = [
      "https://api.allorigins.win/raw?url=", // Most reliable
      "https://cors-anywhere.herokuapp.com/",
      "https://api.codetabs.com/v1/proxy?quest=",
      "https://corsproxy.io/?",
      "https://thingproxy.freeboard.io/fetch/",
      "https://cors.bridged.cc/",
      "https://tailieu365.com/api/address",
      null, // Direct fetch as last resort
    ];

    for (let i = 0; i < proxies.length; i++) {
      try {
        const proxy = proxies[i];
        const targetUrl = proxy ? proxy + url : url;

        console.log(
          `🔄 Trying proxy ${i + 1}/${proxies.length}: ${proxy || "direct"}`
        );

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(targetUrl, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          mode: "cors",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log(`✅ Success with proxy ${i + 1}/${proxies.length}`);
          return response;
        } else {
          console.log(
            `❌ Proxy ${i + 1}/${proxies.length} returned status: ${
              response.status
            }`
          );
        }
      } catch (error) {
        console.log(
          `❌ Proxy ${i + 1}/${proxies.length} failed:`,
          error.message
        );
        continue;
      }
    }

    // If all proxies fail, try server-side proxy
    console.log("🔄 All CORS proxies failed, trying server-side proxy...");
    return await this.fetchWithServerProxy(url);
  }

  // Server-side proxy method
  async fetchWithServerProxy(url) {
    try {
      // Try to use a server-side proxy endpoint
      const serverProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
        url
      )}`;

      console.log("🔄 Trying server-side proxy:", serverProxyUrl);

      const response = await fetch(serverProxyUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.contents) {
          // Parse the JSON content
          const parsedData = JSON.parse(data.contents);
          console.log("✅ Server-side proxy success");
          return {
            ok: true,
            json: () => Promise.resolve(parsedData),
          };
        }
      }

      throw new Error("Server proxy failed");
    } catch (error) {
      console.error("❌ Server-side proxy failed:", error);
      throw new Error("All proxies and server proxy failed");
    }
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
      timestamp: Date.now(),
    });
    console.log(`💾 Cached data for: ${key}`);
  }

  // Lấy danh sách tỉnh/thành phố với retry mechanism
  async getProvinces(mode = 2, retryCount = 0) {
    const maxRetries = 2;

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

      console.log(
        `Fetching provinces from tailieu365.com API... (attempt ${
          retryCount + 1
        }/${maxRetries + 1})`
      );
      const response = await this.fetchWithProxy(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.provinces = data;

      // Cache the data
      this.setCache(cacheKey, data);

      console.log(`✅ Đã tải ${data.length} tỉnh/thành phố từ API`);
      console.log("📊 Sample data:", data.slice(0, 3));

      if (typeof showNotification === "function") {
        showNotification(
          `✅ Đã tải ${data.length} tỉnh/thành phố từ API`,
          "success"
        );
      }

      return data;
    } catch (error) {
      console.error(
        `Lỗi khi lấy danh sách tỉnh/thành phố (attempt ${retryCount + 1}):`,
        error
      );

      // Retry if we haven't exceeded max retries
      if (retryCount < maxRetries) {
        console.log(
          `🔄 Retrying in 2 seconds... (${retryCount + 1}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return this.getProvinces(mode, retryCount + 1);
      }

      if (typeof showNotification === "function") {
        showNotification(
          "⚠️ Không thể tải dữ liệu từ API, sử dụng dữ liệu mặc định",
          "warning"
        );
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
      console.error("Lỗi khi lấy danh sách quận/huyện:", error);
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
        console.log(
          `✅ Đã tải ${cachedData.length} xã/phường cho tỉnh ${provinceId} từ cache`
        );
        return cachedData;
      }

      console.log(`🔄 Fetching wards for province ${provinceId}...`);
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
      console.error("Lỗi khi lấy danh sách xã/phường theo tỉnh:", error);
      console.log("🔄 Falling back to local data...");

      // Try to load from local JSON files
      try {
        const localData = await this.loadLocalWardsData(provinceId);
        if (localData && localData.length > 0) {
          console.log(
            `✅ Loaded ${localData.length} wards from local data for province ${provinceId}`
          );
          this.wards[`province_${provinceId}`] = localData;
          return localData;
        }
      } catch (localError) {
        console.error("Local data load failed:", localError);
      }

      // Final fallback to hardcoded data
      console.log("🔄 Using hardcoded fallback data...");
      return this.getFallbackWardsForProvince(provinceId);
    }
  }

  // Load wards data from local JSON files
  async loadLocalWardsData(provinceId) {
    try {
      // Try to load from local JSON file
      const response = await fetch(`/images/ward.json`);
      if (response.ok) {
        const allWards = await response.json();
        // Filter wards by province ID
        return allWards.filter((ward) => ward.provinceId == provinceId);
      }
    } catch (error) {
      console.error("Failed to load local wards data:", error);
    }
    return [];
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
      console.error("Lỗi khi lấy danh sách xã/phường theo quận/huyện:", error);
      return [];
    }
  }
}

// Add CSS animations for notifications
function addNotificationStyles() {
  if (document.getElementById("location-notification-styles")) return;

  const style = document.createElement("style");
  style.id = "location-notification-styles";
  style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
  document.head.appendChild(style);
}

// Khởi tạo Location Selector khi trang được load
document.addEventListener("DOMContentLoaded", function () {
  // Add notification styles
  addNotificationStyles();
  // Khởi tạo Location Selector
  const locationSelector = new VietnamLocationSelector();

  // Lưu instance vào global scope để có thể truy cập từ các script khác
  window.vietnamLocationSelector = locationSelector;

  // Test API connection
  console.log("🧪 Testing API connection...");
  locationSelector.addressAPI
    .getProvinces(2)
    .then((provinces) => {
      if (provinces && provinces.length > 0) {
        console.log("✅ API connection successful!");
        console.log("📊 Sample provinces:", provinces.slice(0, 5));

        // Test wards for first province
        if (provinces.length > 0) {
          const firstProvince = provinces[0];
          console.log(
            `🧪 Testing wards for province: ${firstProvince.name} (ID: ${firstProvince.id})`
          );
          locationSelector.addressAPI
            .getWardsByProvince(firstProvince.id)
            .then((wards) => {
              if (wards && wards.length > 0) {
                console.log(
                  `✅ Wards API working! Found ${wards.length} wards for ${firstProvince.name}`
                );
                console.log("📊 Sample wards:", wards.slice(0, 3));
              } else {
                console.warn("⚠️ Wards API returned empty data");
              }
            })
            .catch((error) => {
              console.error("❌ Wards API failed:", error);
            });
        }
      } else {
        console.warn("⚠️ API returned empty data");
      }
    })
    .catch((error) => {
      console.error("❌ API connection failed:", error);
    });

  // Thêm global function để test API
  window.testVietnamAPI = function () {
    console.log("🧪 Manual API test...");
    locationSelector.addressAPI
      .getProvinces(2)
      .then((provinces) => {
        console.log("Provinces:", provinces);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  // Thêm function để clear cache
  window.clearVietnamAPICache = function () {
    locationSelector.addressAPI.cache.clear();
    console.log("🗑️ Cache cleared");
  };

  // Thêm function để xem cache status
  window.getVietnamAPICacheStatus = function () {
    console.log("📊 Cache status:", {
      size: locationSelector.addressAPI.cache.size,
      entries: Array.from(locationSelector.addressAPI.cache.entries()).map(
        ([key, value]) => ({
          key: key,
          age: Math.round((Date.now() - value.timestamp) / 1000) + "s ago",
        })
      ),
    });
  };

  // Thêm function để test API trực tiếp
  window.testDirectAPI = function () {
    console.log("🧪 Testing direct API call...");
    fetch("https://tailieu365.com/api/address/province?mode=2", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        console.log("Direct API response status:", response.status);
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      })
      .then((data) => {
        console.log("Direct API data:", data);
      })
      .catch((error) => {
        console.error("Direct API error:", error);
      });
  };
});
