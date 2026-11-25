# Lấy mã preview công khai và dựng lại bản chạy

Repo ghi lại quy trình đã dùng với preview Worldline của Jiro: tìm JavaScript/CSS mà trình duyệt tải, lưu các file công khai, rồi nối module đã biên dịch với React để chạy cục bộ. Bản demo kèm theo tái hiện phần đầu trang và hoạt cảnh cuộn 3D từ phòng sang hồ.

Đây là mã frontend đã biên dịch, không phải prompt, source TSX gốc hay toàn bộ bộ sản phẩm trả phí. Quy trình không dùng tài khoản, cookie hoặc API trả phí.

## 1. Tìm đúng file bằng DevTools

1. Mở preview trong cửa sổ ẩn danh: https://jiro.build/preview/template/agency/travel-agency-landing-page-worldline
2. Mở DevTools → Network, bật Disable cache rồi tải lại trang.
3. Lọc JS. Xem Response của các file; tìm chuỗi đặc trưng như `Know the view`, `Phewa Lake` hoặc `Worldline`. Có thể dùng tìm kiếm toàn bộ Sources để xác định file chứa chuỗi đó.
4. Chọn file chứa mã component thực tế. File chỉ chứa danh sách đường dẫn/module là registry hoặc loader, chưa phải phần triển khai.
5. Chọn Copy URL của file JS. Trong Network, lọc CSS và lấy URL stylesheet dùng bởi preview.
6. Điền các URL vào `preview-assets.json`. Chỉ lấy asset cần cho mẫu đang kiểm tra.

Bản demo được kiểm tra ngày 23/11/2026; các URL trong manifest đã được kiểm tra tải lại ngày 25/11/2026. Tên chunk có thể thay đổi hoặc file cũ bị xóa sau deploy. Khi đó lấy URL mới từ Network; không coi lỗi 404 là bằng chứng nội dung đã được bảo vệ.

## 2. Tải JavaScript/CSS

Cần Node.js 22 trở lên:

```sh
node scripts/capture-preview.mjs
```

Hoặc chỉ định manifest và thư mục đầu ra:

```sh
node scripts/capture-preview.mjs preview-assets.json captured-preview
```

Script gửi GET không kèm thông tin đăng nhập, kiểm tra HTTP status/content type, lưu file và `receipt.json` gồm URL, thời gian, kích thước, SHA-256. Script không thực thi mã tải xuống và không tự ghi đè demo trong `public/`. Nó tải đúng danh sách asset bạn chọn, không tự quét toàn website.

## 3. Chạy lại mã đã biên dịch

Ví dụ Worldline đã được nối sẵn trong repo:

```sh
npm ci
npm run dev -- --port 4173
```

Mở http://127.0.0.1:4173 rồi cuộn xuống.

Cách nối nằm trong `main.js`:

- `public/worldline-original.js` giữ nguyên bundle đã tải.
- Lớp adapter nhận lời gọi `TURBOPACK.push` và chọn module `375029`.
- Import `843476` được nối với `react/jsx-runtime`, import `271645` với React.
- Adapter lấy export `default` rồi render bằng `createRoot`.
- `index.html` nạp hai stylesheet công khai của preview.

Các ID trên chỉ áp dụng cho bundle mẫu này. Với bundle khác hoặc bản deploy mới, kiểm tra ID module, imports, exports và stylesheet trước khi thay file. Adapter này không phải runtime Turbopack tổng quát; component có thêm dependencies cần được nối tương ứng. Chỉ format JavaScript cho dễ đọc không khôi phục tên biến, kiểu TypeScript hay cấu trúc project gốc.

## Kiểm tra và giới hạn

```sh
npm run build
```

Bản mẫu đã được kiểm tra trên trình duyệt: render cảnh phòng và cảnh hồ khi cuộn. Three.js và Google Fonts vẫn tải từ CDN theo mã gốc; cần Internet và WebGL. Nút đăng nhập/đặt tour là anchor mẫu, không có backend đặt tour.

Việc chạy được bản này chứng minh có thể tái sử dụng mã preview công khai. Nó không chứng minh vượt quyền tài khoản Free → Paid hoặc lấy được source/prompt qua API. Nếu cần bảo mật cả mã thực thi của giao diện, preview ảnh/video phù hợp hơn preview tương tác công khai.
