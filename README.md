# TravisGold

TravisGold là ứng dụng web nội bộ mobile-first để quản lý mua vào, bán ra, doanh thu, lợi nhuận dự kiến và tồn của **2 cửa hàng**. Ứng dụng chạy hoàn toàn ở frontend, lưu dữ liệu bằng `localStorage`, hỗ trợ PWA, PDF/Excel và GitHub Pages.

## Công nghệ

React + Vite + TypeScript + Tailwind CSS + Lucide React + Recharts + jsPDF + jspdf-autotable + SheetJS/xlsx + vite-plugin-pwa.

## Chạy trên máy tính

Yêu cầu Node.js 20+.

```bash
npm install
npm run dev
```

Mở URL do Vite hiển thị, thường là `http://localhost:5173/travisgold-app/`.

Kiểm tra build:

```bash
npm run build
npm run preview
```

## GitHub Pages

1. Tạo repository mới, ví dụ `travisgold-app`.
2. Đưa toàn bộ source vào repository và push lên branch `main`.
3. Trên GitHub mở **Settings → Pages**.
4. Ở **Build and deployment**, chọn **Source: GitHub Actions**.
5. Workflow `.github/workflows/deploy.yml` tự chạy `npm ci`, `npm run build` và deploy `dist`.
6. Khi workflow hoàn tất, mở URL Pages trên Safari iPhone.

### Nếu repository không tên `travisgold-app`

Có hai nơi dễ đổi base path:

- `.github/workflows/deploy.yml`: sửa `VITE_BASE_PATH: /ten-repository-moi/`
- `vite.config.ts`: giá trị mặc định là `/travisgold-app/`; biến môi trường trong workflow sẽ ưu tiên hơn.

Nếu deploy tại custom domain/root, có thể dùng `/`.

## Cài lên màn hình chính iPhone

1. Mở link GitHub Pages bằng **Safari**.
2. Bấm **Chia sẻ**.
3. Chọn **Thêm vào Màn hình chính**.
4. Bấm **Thêm**.

Ứng dụng dùng `viewport-fit=cover` và `safe-area-inset-*` để tránh tai thỏ/Dynamic Island và thanh Home.

## Dữ liệu

- `store-1` và `store-2` là hai storeId cố định.
- Mỗi transaction bắt buộc có `storeId`.
- Dữ liệu lưu trong `localStorage` của trình duyệt hiện tại.
- Hai iPhone khác nhau **không tự đồng bộ** ở phiên bản này.
- Có thể **Xuất sao lưu JSON** và **Nhập dữ liệu JSON** trong Cài đặt.
- Không có API key, mật khẩu hoặc dữ liệu gửi đến dịch vụ ngoài.

## Công thức

- Thành tiền mua = Số lượng mua × Giá mua/cái.
- Thành tiền bán = Số lượng bán × Giá bán/cái.
- Tồn = Số lượng mua − Số lượng bán.
- Lợi nhuận dự kiến = Thành tiền bán − (Số lượng bán × Giá mua/cái). Cách này dùng giá vốn tương ứng với **số lượng đã bán**, tránh coi hàng tồn chưa bán là lỗ ngay trong giao dịch.

## PDF và tiếng Việt

jsPDF mặc định không kèm font Unicode tiếng Việt. Bản hiện tại chủ động chuyển nhãn PDF sang Latin không dấu để file luôn đọc được trên Safari/iPhone mà không phải nhúng font bên ngoài. Giao diện và Excel vẫn giữ đầy đủ tiếng Việt. Phiên bản sau có thể nhúng một font Unicode được cấp phép vào bundle để PDF giữ dấu.

## Cấu trúc chính

```text
travisgold-app/
├─ .github/workflows/deploy.yml
├─ public/
│  ├─ icons/
│  │  ├─ icon-192.png
│  │  ├─ icon-512.png
│  │  └─ apple-touch-icon.png
│  ├─ favicon.svg
│  ├─ logo-travisgold.svg
│  └─ manifest.webmanifest
├─ src/
│  ├─ components/
│  ├─ data/sampleData.ts
│  ├─ pages/
│  ├─ utils/
│  ├─ App.tsx
│  ├─ main.tsx
│  ├─ index.css
│  └─ types.ts
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tailwind.config.ts
├─ postcss.config.js
└─ tsconfig*.json
```

## Nâng cấp phù hợp về sau

- Đồng bộ đa thiết bị qua MongoDB Atlas/Supabase/Firebase hoặc backend riêng.
- Đăng nhập và phân quyền quản lý/nhân viên.
- Nhật ký audit và chống sửa/xóa giao dịch không có quyền.
- IndexedDB cho dữ liệu lớn và queue offline mạnh hơn.
- Nhúng font Unicode vào PDF.
- Theo dõi tồn kho lũy kế thay vì tồn theo từng giao dịch.
- Mã sản phẩm, khách hàng, nhà cung cấp, công nợ, giá vốn FIFO/weighted-average.
- Backup tự động và đồng bộ giữa hai cửa hàng.

## Phiên bản

`v1.0.1`

### v1.0.1

- Khôi phục đúng cấu trúc `src/`, `public/` và `.github/workflows/`.
- Giữ đúng đường dẫn GitHub Pages `/travisgold-app/`.
- Đồng bộ số phiên bản hiển thị trong ứng dụng thành `1.0.1`.
