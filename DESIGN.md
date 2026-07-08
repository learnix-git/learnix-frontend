# Learnix Design System

Tài liệu này định nghĩa hệ thống thiết kế cốt lõi của dự án Learnix Frontend. Hệ thống được thiết kế để mang lại cảm giác cao cấp, tinh tế và đậm chất công nghệ, tối ưu hóa trải nghiệm người dùng trên cả hai chế độ giao diện Sáng và Tối.

---

## 1. Triết lý thiết kế (Design Principles)

* **Glassmorphism Siêu Cao Cấp:** Áp dụng lớp kính mờ có độ mờ mịn sâu (`backdrop-blur-2xl` hoặc `backdrop-blur-3xl`), nền bán trong suốt siêu mỏng (`bg-white/30` / `bg-white/40` hoặc `dark:bg-slate-950/40`), kết hợp viền phản quang phản xạ ánh sáng (`border-white/60` ở Light mode và `dark:border-white/10` ở Dark mode).
* **Glow Effects (Đốm Sáng Nền):** Sử dụng các vùng phát sáng lớn chuyển động mềm mại (`animate-blob`) ở background để tạo chiều sâu vô cực cho không gian giao diện, kết hợp các sắc độ Xanh dương (`primary`), Xanh ngọc (`cyan-400`) và Xanh da trời (`sky-400`).
* **Bo góc lớn mềm mại:** Sử dụng bo góc siêu lớn để tạo cảm giác thân thiện và hiện đại: `rounded-[2.5rem]` (40px) cho các banner/container lớn, `rounded-[2.2rem]` cho khung avatar, `rounded-3xl` cho card và `rounded-2xl` cho các nút bấm/input.
* **Độ tương tác cao (Interactive Micro-animations):** Mọi hành động của người dùng đều được phản hồi bằng các chuyển động mượt mà (chuyển màu nền nhẹ, hover scale `hover:scale-[1.01]` đến `hover:scale-105`, shadow nở rộng, và cursor dạng pointer mặc định).

---

## 2. Hệ màu chuẩn (Color System - OKLCH & Tailwind v4)

Hệ thống màu sắc hỗ trợ song song hai chế độ tự động và các biến CSS thích ứng cao.

### Primary Colors (Cố định ở cả 2 mode)
* **Primary (Xanh dương công nghệ / Blue):** `oklch(0.546 0.245 262.881)` hoặc `#3b82f6` (`bg-primary`, `text-primary`) - Đại diện cho sự thông minh, tin cậy và tốc độ.
* **Primary Hover/Active:** `#2563eb` - Đậm hơn một tông để phản hồi hành động click/hover.
* **On Primary:** `#ffffff` - Chữ trên nền primary luôn là màu trắng tinh khiết để đạt độ tương phản cao.

### Background & Surface
* **Background (Nền trang):**
    * **Light:** `#f8fafc` hoặc `#f3f5f7` - Tạo cảm giác sạch sẽ, thoáng đãng.
    * **Dark:** `oklch(0.129 0 0)` hoặc `#09090b` - Nền tối sâu thẳm, dịu mắt cho học sinh/giáo viên làm việc ban đêm.
* **Surface/Card (Bề mặt thẻ):**
    * **Light:** `#ffffff` hoặc kính mờ cực nhẹ `bg-white/40 border-white/60`.
    * **Dark:** `oklch(0.129 0 0)` hoặc kính mờ tối `dark:bg-slate-950/40 dark:border-white/5`.

### Trạng thái hủy/Nguy hiểm (Cancel/Destructive)
* **Màu đặc trưng:** Màu đỏ hồng (`rose-500`).
* **Light Hover:** Nền `hover:bg-rose-500/10` (hồng mờ 10%), chữ `hover:text-rose-600`.
* **Dark Hover:** Nền `hover:bg-rose-500/10` (hồng mờ 10%), chữ `dark:hover:text-rose-400`.
* *Lưu ý:* Tránh sử dụng nền `bg-rose-50` ở Dark Mode vì nó sẽ bị lóa trắng và che mất chữ màu sáng.

---

## 3. Typography (Kiểu chữ)

* **Font chữ chính:** `Be Vietnam Pro` (hoặc `Inter`) - Phông chữ sans-serif hiện đại, độ dày nét sắc nét, hiển thị tiếng Việt dấu cực kỳ chuẩn xác.
* **Hệ thống phân cấp tiêu đề:**
    * `H1`: `text-3xl` đến `text-4xl`, `font-black`, tracking-tight.
    * `H2 (Section Title)`: `text-[10px]`, viết hoa toàn bộ, `tracking-[0.2em]`, `font-black`, màu xám đậm (`text-slate-400 dark:text-slate-500`), đi kèm icon nhỏ làm điểm nhấn.
    * `H3/H4 (Card Title)`: `text-base` đến `text-lg`, `font-black` hoặc `font-bold`, tracking-tight.
    * `Body Text`: `text-sm` hoặc `text-base`, khoảng cách dòng rộng `leading-relaxed` để tăng độ dễ đọc cho đề thi và bài làm.

---

## 4. Hình dạng & Hiệu ứng (Shape & Depth)

### Bo góc tiêu chuẩn
* `rounded-[2.5rem]` (40px): Dành cho các Banner header chính, các phần bao bọc cực lớn.
* `rounded-3xl` (24px): Dành cho các thẻ Card đề thi, lớp học, danh sách thông báo.
* `rounded-2xl` (16px): Dành cho Input, Combobox, Nút bấm lớn (chiều cao 12 - h-12).
* `rounded-full`: Dành cho Avatar tròn, các badge trạng thái dạng viên thuốc (nộp bài, chưa nộp), và icon định danh.

### Glassmorphism & Shadow
* **Độ mờ kính (Backdrop Blur):** Luôn kết hợp `backdrop-blur-md` đến `backdrop-blur-2xl` cho các lớp phủ menu, thẻ card và modal.
* **Bóng đổ phát sáng (Glow Shadows):**
    * **Nút Primary:** Sử dụng shadow phát sáng màu xanh dương `shadow-lg shadow-primary/30`.
    * **Nút Phụ/Hồ sơ:** Sử dụng `shadow-sm shadow-slate-100`.
    * **Khi hover Card:** Tăng độ bóng đổ lên `hover:shadow-2xl` kết hợp di chuyển nhẹ `hover:scale-[1.01]` để tạo chiều sâu 3D chân thực.

---

## 5. Các Component chuẩn hóa

### 5.1. Buttons (Nút bấm)
* **Nút Primary (CTA chính - VD: Nộp bài, Tạo lớp):**
    * Class: `rounded-2xl h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 font-bold text-xs tracking-widest transition-all`
* **Nút Outline (Nút phụ):**
    * Class: `rounded-2xl h-12 px-8 border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md hover:bg-white dark:hover:bg-white/10 transition-all font-bold text-xs tracking-widest shadow-sm`
* **Nút Huỷ (Cancel/Outline Destructive):**
    * Class: `rounded-2xl h-12 px-8 border-rose-200 dark:border-rose-900/30 text-rose-500 bg-transparent hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all font-bold text-xs tracking-widest`

### 5.2. Form Inputs & Selection
* **Text Input / Input số:**
    * Class: `w-full h-12 rounded-2xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all backdrop-blur-md`
* **Dropdown / Combobox:**
    * Sử dụng component `<Combobox />` tùy biến, hỗ trợ tìm kiếm và bo góc `rounded-2xl` mềm mại.

### 5.3. Cards (Thẻ nội dung)
* **Glass Card:** Nền `bg-white/40 dark:bg-slate-900/40`, viền `border-white/60 dark:border-white/5`, bo góc `rounded-3xl` hoặc `rounded-[2rem]`, kết hợp `backdrop-blur-2xl`.

---

## 6. Giao diện Thanh cuộn Premium (Premium Scrollbar)

Để đảm bảo giao diện đồng bộ hoàn hảo không có vết đứt gãy của hệ điều hành (đặc biệt là Windows 11):
1.  **Chỉ hiển thị dải trượt (Thumb):** Bỏ qua hoàn toàn track nền (để trong suốt) để thanh cuộn ẩn mình vào nền kính mờ.
2.  **Ẩn nút mũi tên:** Tuyệt đối không hiển thị các nút mũi tên cuộn lên/xuống (`::-webkit-scrollbar-button { display: none; }`).
3.  **Tương tác mượt mà:** Thumb mặc định có màu trung tính xám nhẹ và chuyển sang màu Xanh dương Primary (`bg-blue-500`) khi người dùng hover chuột qua.

---

## 7. Quy tắc lập trình giao diện (UI Code Guidelines)

1.  **Con trỏ chuột luôn là pointer cho tương tác:** Tất cả các phần tử có thể click (`button`, `[role="button"]`, `select`, `input[type="button"]`) đều được cấu hình hiển thị `cursor: pointer` toàn cục trong file CSS cơ sở để đảm bảo tính trực quan.
2.  **Thiết kế Mobile-First:** Luôn sử dụng tiền tố kích thước màn hình của Tailwind (như `md:`, `lg:`) để quản lý ẩn hiện và bố cục linh hoạt trên điện thoại và máy tính.
3.  **Hạn chế hardcode mã màu:** Tận dụng tối đa các biến màu định sẵn của design system như `var(--color-primary)`, `text-primary`, `bg-muted` để hệ thống tự động đổi màu mượt mà khi người dùng đổi chế độ Dark/Light.
4.  **Tối ưu hóa tải file/ảnh:** Sử dụng vùng preview trực quan trước khi tải lên (ví dụ: ảnh đại diện, file bài tập PDF/Word, tài liệu đề thi) và hiển thị thanh tiến trình tải mượt mà.

---
*Learnix Design System - Đồng hành cùng trải nghiệm giáo dục số cao cấp.*