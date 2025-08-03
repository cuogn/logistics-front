# Tính Năng Tính Khoảng Cách - HERE Maps API

## Tổng Quan

Tính năng tính khoảng cách cho phép người dùng chấm hai điểm trên bản đồ và nhận được thông tin về khoảng cách, thời gian di chuyển, và chỉ đường giữa hai điểm đó. Tính năng này sử dụng HERE Maps API thay vì Google Maps API để phù hợp với công nghệ hiện tại của dự án.

## Tính Năng Chính

### 1. Chấm Điểm Trên Bản Đồ

- Nhấp vào bản đồ để đặt điểm A (điểm bắt đầu)
- Nhấp lần nữa để đặt điểm B (điểm kết thúc)
- Hệ thống tự động hiển thị địa chỉ của mỗi điểm

### 2. Tính Toán Khoảng Cách

- Tự động tính toán khoảng cách đường bộ giữa hai điểm
- Hiển thị thời gian di chuyển dự kiến
- Vẽ tuyến đường trên bản đồ

### 3. Các Chức Năng Bổ Sung

- **Xóa Điểm**: Xóa tất cả điểm và bắt đầu lại
- **Đổi Vị Trí**: Hoán đổi vị trí điểm A và điểm B
- **Lấy Chỉ Đường**: Mở chỉ đường chi tiết trong tab mới
- **Làm Mới**: Reset toàn bộ tính năng

## Công Nghệ Sử Dụng

### HERE Maps API

- **Maps JavaScript API**: Hiển thị bản đồ tương tác
- **Routing API**: Tính toán tuyến đường và khoảng cách
- **Reverse Geocoding API**: Chuyển đổi tọa độ thành địa chỉ

### API Key

```javascript
const apiKey = "7GUpHwbsEgObqnGg4JG34CJvdbf89IU4iq-SDFe8vmE";
```

## Cấu Trúc File

### HTML

- `pages/distance-calculator.html`: Giao diện chính của tính năng

### JavaScript

- `js/distance-calculator.js`: Logic xử lý chính

### CSS

- Tích hợp trong file HTML với inline styles
- Sử dụng các class từ `css/styles.css` và `css/maps.css`

## Cách Sử Dụng

### 1. Truy Cập Tính Năng

- Vào trang chủ: `index.html`
- Click vào "Tính Khoảng Cách" trong menu navigation
- Hoặc truy cập trực tiếp: `pages/distance-calculator.html`

### 2. Sử Dụng Tính Năng

1. **Đặt Điểm A**: Nhấp vào bản đồ để đặt điểm bắt đầu
2. **Đặt Điểm B**: Nhấp vào bản đồ lần nữa để đặt điểm kết thúc
3. **Xem Kết Quả**: Hệ thống tự động tính toán và hiển thị thông tin

### 3. Các Thao Tác Khác

- **Xóa**: Click nút "Xóa Điểm" để bắt đầu lại
- **Đổi Vị Trí**: Click nút "Đổi Vị Trí" để hoán đổi A và B
- **Chỉ Đường**: Click nút "Lấy Chỉ Đường" để xem chi tiết
- **Làm Mới**: Click nút "Làm Mới" để reset hoàn toàn

## API Endpoints Sử Dụng

### HERE Maps Routing API

```javascript
// Tính toán tuyến đường
const routingParameters = {
  mode: "fastest;car",
  representation: "display",
  waypoint0: `${lat1},${lng1}`,
  waypoint1: `${lat2},${lng2}`,
};
```

### HERE Maps Reverse Geocoding API

```javascript
// Chuyển đổi tọa độ thành địa chỉ
const params = {
  at: `${lat},${lng}`,
  apiKey: "YOUR_API_KEY",
};
```

## Xử Lý Lỗi

### Các Trường Hợp Lỗi Thường Gặp

1. **Không thể kết nối HERE Maps API**

   - Kiểm tra kết nối internet
   - Kiểm tra API key có hợp lệ không

2. **Không tìm thấy tuyến đường**

   - Điểm quá gần nhau
   - Điểm nằm ngoài khu vực hỗ trợ
   - Lỗi từ HERE Maps service

3. **Không tìm thấy địa chỉ**
   - Tọa độ nằm ở vùng không có dữ liệu địa chỉ
   - Lỗi từ Reverse Geocoding service

### Thông Báo Lỗi

- Hệ thống hiển thị thông báo lỗi rõ ràng
- Console log chi tiết cho developer
- Fallback cho các trường hợp lỗi

## Tối Ưu Hóa

### Performance

- Lazy loading cho HERE Maps API
- Debounce cho các thao tác click
- Caching cho kết quả geocoding

### UX/UI

- Loading indicators khi tính toán
- Status indicator hiển thị trạng thái hiện tại
- Responsive design cho mobile

## Bảo Mật

### API Key

- API key được sử dụng ở client-side (cần bảo vệ)
- Có thể chuyển sang server-side để bảo mật hơn
- Rate limiting từ HERE Maps

### CORS

- HERE Maps API hỗ trợ CORS
- Không cần proxy server

## Tương Lai

### Tính Năng Có Thể Mở Rộng

1. **Nhiều Điểm**: Hỗ trợ nhiều điểm trung gian
2. **Phương Tiện**: Thêm các loại phương tiện khác (xe máy, xe đạp)
3. **Lưu Lịch Sử**: Lưu các tuyến đường đã tính
4. **Chia Sẻ**: Chia sẻ tuyến đường qua link
5. **Tối Ưu**: Tối ưu tuyến đường theo thời gian thực

### Tích Hợp

- Tích hợp với hệ thống đơn hàng
- Tích hợp với quản lý phương tiện
- Tích hợp với tính toán phí vận chuyển

## Troubleshooting

### Vấn Đề Thường Gặp

#### 1. Bản đồ không hiển thị

```javascript
// Kiểm tra console log
console.error("Error initializing map:", error);
```

#### 2. Không thể tính khoảng cách

```javascript
// Kiểm tra API key
const apiKey = "7GUpHwbsEgObqnGg4JG34CJvdbf89IU4iq-SDFe8vmE";
```

#### 3. Lỗi CORS

- HERE Maps API hỗ trợ CORS
- Kiểm tra domain trong HERE Maps console

### Debug Mode

```javascript
// Bật debug mode
console.log("Distance calculation:", result);
console.log("Geocoding result:", data);
```

## Liên Kết Hữu Ích

- [HERE Maps JavaScript API Documentation](https://www.here.com/docs/bundle/maps-api-for-javascript-developer-guide/page/README.html)
- [HERE Maps Routing API](https://developer.here.com/documentation/routing-api/dev_guide/index.html)
- [HERE Maps Reverse Geocoding API](https://developer.here.com/documentation/geocoding-search-api/dev_guide/topics/endpoint-reverse-geocode.html)

## Kết Luận

Tính năng tính khoảng cách sử dụng HERE Maps API đã được triển khai thành công và tích hợp hoàn toàn với hệ thống hiện tại. Tính năng này cung cấp trải nghiệm người dùng tốt với giao diện trực quan và các chức năng hữu ích.
