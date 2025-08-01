# Phân Quyền Truy Cập Trang

## Tổng Quan

Hệ thống có 3 role chính: **Admin**, **Staff**, và **Customer**

## Chi Tiết Phân Quyền

### 🔴 **ADMIN ONLY** (Chỉ Admin)

- `admin-dashboard.html` - Dashboard quản trị
- `admin-orders.html` - Quản lý đơn hàng
- `admin-users.html` - Quản lý người dùng
- `admin-stats.html` - Thống kê tổng quan
- `admin-settings.html` - Cài đặt admin
- `admin-order-detail.html` - Chi tiết đơn hàng (admin)
- `admin-order-edit.html` - Chỉnh sửa đơn hàng (admin)
- `admin-vehicles.html` - Quản lý phương tiện
- `admin-vehicle-assignments.html` - Phân công phương tiện

### 🟡 **ADMIN + STAFF** (Admin và Staff)

- `staff-dashboard.html` - Dashboard nhân viên
- `staff-orders.html` - Quản lý đơn hàng (staff)
- `staff-stats.html` - Thống kê (staff)
- `staff-settings.html` - Cài đặt staff
- `staff-order-detail.html` - Chi tiết đơn hàng (staff)
- `staff-order-edit.html` - Chỉnh sửa đơn hàng (staff)
- `staff-track.html` - Theo dõi giao hàng
- `staff-vehicles.html` - Xem phương tiện
- `staff-vehicle-assignments.html` - Xem phân công

### 🟢 **CUSTOMER ONLY** (Chỉ Customer)

- `dashboard.html` - Dashboard khách hàng
- `order-detail.html` - Chi tiết đơn hàng (customer)

### 🔵 **PUBLIC** (Tất cả đã đăng nhập)

- `track.html` - Tra cứu đơn hàng
- `about.html` - Giới thiệu
- `contact.html` - Liên hệ
- `faq.html` - Câu hỏi thường gặp

## Hàm Phân Quyền

### `auth.redirectIfNotAdmin()`

- Chỉ admin mới truy cập được
- Staff → redirect to staff-dashboard
- Customer → redirect to customer-dashboard

### `auth.redirectIfNotStaff()`

- Admin và staff có thể truy cập
- Customer → redirect to customer-dashboard

### `auth.redirectIfNotCustomerOnly()`

- Chỉ customer mới truy cập được
- Admin → redirect to admin-dashboard
- Staff → redirect to staff-dashboard

### `auth.redirectIfNotCustomer()`

- Customer, staff, admin đều có thể truy cập
- Chỉ check đã đăng nhập chưa

## Quy Tắc Chung

1. **Admin** có quyền cao nhất, có thể truy cập tất cả
2. **Staff** có thể truy cập staff pages và public pages
3. **Customer** chỉ có thể truy cập customer pages và public pages
4. **Redirect logic** đưa user về trang phù hợp với role của họ
5. **Authentication** luôn được check trước khi check role

## Ví Dụ Sử Dụng

```javascript
// Trang chỉ dành cho admin
auth.redirectIfNotAdmin();

// Trang dành cho admin và staff
auth.redirectIfNotStaff();

// Trang chỉ dành cho customer
auth.redirectIfNotCustomerOnly();

// Trang public (tất cả đã đăng nhập)
auth.redirectIfNotLoggedIn();
```
