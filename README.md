# LEARNIX - Hệ thống quản lý lớp học và học tập đỉnh cao dành cho giáo viên và học sinh

## CHƯƠNG 1: GIỚI THIỆU

### 1.1. Tầm nhìn dự án
Learnix là một nền tảng công nghệ giáo dục hoạt động theo mô hình **Hybrid Marketplace**. Hệ thống đóng vai trò trung gian kết nối và điều phối giữa hai nhóm đối tượng chính: Giáo viên/Gia sư (Teacher) và Phụ huynh/Học sinh (Student/Parent). Nền tảng giải quyết đồng thời hai nhu cầu lớn của thị trường:

* **Học tập trực tuyến (Online):** Học sinh có thể đăng ký và mua các khóa học trực tuyến được xây dựng bởi giáo viên hoặc gia sư. Mỗi khóa học bao gồm đầy đủ tài liệu học tập, video bài giảng, bài tập thực hành, bài kiểm tra và các tài nguyên hỗ trợ khác. Người học có thể chủ động học mọi lúc, mọi nơi, xem lại bài giảng không giới hạn trong thời gian khóa học còn hiệu lực, theo dõi tiến độ học tập và trao đổi với giáo viên thông qua hệ thống.

* **Học tập trực tiếp (Offline):** Phụ huynh và học sinh có thể tìm kiếm giáo viên hoặc gia sư phù hợp dựa trên môn học, trình độ, khu vực, học phí và đánh giá từ những học viên trước. Hệ thống hỗ trợ kết nối để thuê gia sư dạy kèm 1-1 tại nhà hoặc đăng ký tham gia các lớp học thêm tập trung do giáo viên tự tổ chức. Người dùng có thể xem thông tin chi tiết về giáo viên, lịch dạy, địa điểm, số lượng học viên, học phí và liên hệ hoặc đăng ký trực tiếp thông qua nền tảng.

### 1.2. Bài toán thực tế
Trong các nền tảng kết nối dịch vụ, tình trạng "bùng sàn" khi người dùng và giáo viên tự trao đổi thông tin liên lạc rồi giao dịch bên ngoài nền tảng nhằm tránh phí hoa hồng là một trong những rủi ro lớn nhất, gây thất thoát doanh thu và làm giảm độ tin cậy của hệ thống. Learnix giải quyết vấn đề này bằng cơ chế "Bảo hiểm tài chính hai chiều", kết hợp Chat thương lượng bảo mật và Hợp đồng điện tử tạm giữ tiền (Escrow Account). Mọi thỏa thuận về lịch học, học phí và điều khoản được thực hiện ngay trên nền tảng. Khoản thanh toán của học viên sẽ được hệ thống tạm giữ và chỉ giải ngân cho giáo viên khi buổi học hoặc khóa học được xác nhận hoàn thành đúng cam kết. Trong trường hợp xảy ra tranh chấp, Learnix sẽ sử dụng lịch sử trò chuyện, hợp đồng điện tử và các bằng chứng liên quan để xử lý minh bạch, đảm bảo quyền lợi cho cả học viên lẫn giáo viên. Cơ chế này vừa hạn chế giao dịch ngoài nền tảng, vừa xây dựng môi trường học tập an toàn, minh bạch và đáng tin cậy.

---

## CHƯƠNG 2: CHI TIẾT VẬN HÀNH

Để phục vụ cấu trúc kinh doanh dạng lai (Hybrid Marketplace), hệ thống Learnix vận hành hai luồng xử lý dòng tiền hoàn toàn riêng biệt dưới Backend. Việc phân tách này giúp hệ thống định tuyến chính xác dòng tiền dựa trên tính chất của từng loại hình dịch vụ giáo dục.

#### A. Phân hệ Khóa học Trực tuyến

Luồng này xử lý cho các sản phẩm số do giáo viên tự đóng gói và đăng tải lên hệ thống. Quy trình xử lý dòng tiền diễn ra hoàn toàn tự động theo cơ chế Khấu trừ tại nguồn (Split Payment):

* **Thời điểm thu tiền:** Hệ thống thu trước toàn bộ 100% giá trị khóa học từ Học sinh ngay tại thời điểm bấm mua. Học sinh hoàn tất thanh toán qua cổng VNPAY để chuyển trạng thái Order sang COMPLETED.

* **Cơ chế xử lý hoa hồng và giải ngân:** Ngay khi tiền về tài khoản tổng của hệ thống, Backend lập tức kích hoạt hàm phân tách dòng tiền tự động. Nền tảng tự động trích lại đúng 30% giá trị đơn hàng giữ lại làm doanh thu thuần của sàn Learnix phục vụ cho chi phí lưu trữ và băng thông. 70% số tiền còn lại sau khi khấu trừ sẽ được hệ thống cộng trực tiếp vào ví điện tử của Giáo viên sở hữu khóa học đó. Giáo viên có thể chủ động theo dõi số dư này. Học sinh được mở khóa quyền vào học tức thì.

#### B. Phân hệ Gia sư và Lớp học thêm

Luồng này áp dụng cho mô hình thuê gia sư dạy kèm 1-1 tại nhà hoặc lớp học thêm trực tiếp. Quy trình xử lý phức tạp hơn nhằm bảo đảm an toàn, chống bùng sàn qua cơ chế Đặt cọc hai chiều và Tạm giữ tiền (Escrow Mechanism):

* **Thời điểm thu tiền (Đợt 1):** Sau khi hai bên thương lượng xong qua khung Chat và bấm xác nhận hợp đồng, hệ thống sẽ thu tiền cọc từ cả hai phía. Phụ huynh đóng 50% học phí tháng đầu tiên để bảo lãnh trách nhiệm người mua. Gia sư đóng 30% học phí tháng đầu tiên đóng vai trò là phí cam kết nhận lớp (khoản này chính là phí hoa hồng cố định của sàn). Hệ thống tạm giữ đóng băng 80% số tiền này rồi mới nhả địa chỉ và số điện thoại thật để lớp học bắt đầu diễn ra.

* **Thời điểm thu tiền (Đợt 2):** Kết thúc tháng dạy đầu tiên, Phụ huynh kiểm tra chất lượng giảng dạy ổn định sẽ tiến hành thanh toán nốt 50% học phí còn lại cho hệ thống. Lúc này, luồng tiền vào của hệ thống đã thu đủ 130% giá trị học phí gốc.

* **Cơ chế xử lý hoa hồng và Giải ngân:** Hệ thống tiến hành đối soát và thực hiện lệnh chi tiền tự động (Payout), chuyển khoản trọn vẹn 100% học phí gốc vào tài khoản ngân hàng của Gia sư. Nền tảng Learnix chính thức kết chuyển 30% học phí (số tiền gia sư đã đóng cọc ở đợt 1) thành lợi nhuận ròng của doanh nghiệp.

#### C. Bảng tổng hợp so sánh cơ chế vận hành dòng tiền

| Tiêu chí so sánh | Phân hệ Khóa học Trực tuyến (Online) | Phân hệ Gia sư / Lớp trực tiếp (Offline) |
| :--- | :--- | :--- |
| **Cơ chế thu tiền** | Thu trước 100% học phí từ Học sinh | Đặt cọc hai chiều (Phụ huynh 50%, Gia sư 30%) |
| **Cơ chế giải ngân** | Khấu trừ 30% tại nguồn, cộng 70% vào ví Giáo viên trên sàn | Giữ tiền đóng băng (Escrow), giải ngân 100% học phí sau 1 tháng |
| **Thời gian tất toán** | Xử lý tự động tức thì ngay khi thanh toán thành công | Kéo dài theo chu kỳ 1 tháng giảng dạy thực tế |
| **Phương thức trừ hoa hồng**| Trừ trực tiếp vào số tiền học sinh nạp vào hệ thống | Thu trước từ tiền cọc cam kết nhận lớp của Gia sư |
| **Tỷ lệ hoa hồng của sàn**| 30% trên mỗi giao dịch mua khóa học thành công | 30% trên tổng giá trị học phí tháng đầu tiên |

---

## CHƯƠNG 3: MÔ HÌNH HÓA TOÁN HỌC

Để chứng minh tính khả thi về mặt tài chính của mô hình Hybrid Marketplace đối, cấu trúc dòng tiền và doanh thu của hệ thống Learnix được mô hình hóa toán học một cách chi tiết cho cả hai trường hợp kinh doanh: Phân hệ Gia sư Offline và Phân hệ Khóa học Trực tuyến Online.

---

### TRƯỜNG HỢP 1: PHÂN HỆ GIA SƯ VÀ LỚP HỌC TRỰC TIẾP

Mô hình này áp dụng cơ chế Đặt cọc hai chiều và Tạm giữ tiền bảo hiểm (Escrow Account). 

Gọi các biến số kinh tế bao gồm:
* $H$: Tổng mức học phí gốc trong 1 tháng của lớp học/gia sư do Giáo viên cấu hình trên sàn.
* $C_{ph}$: Tiền cọc đợt 1 thu từ Phụ huynh khi chốt hợp đồng qua Chat.
* $P_{gs}$: Phí nhận lớp (tiền cọc cam kết) thu từ Gia sư khi chốt hợp đồng qua Chat.
* $T_{freeze}$: Tổng số tiền hệ thống đóng băng và nắm giữ ở giai đoạn 1.
* $K_{ph}$: Tiền tất toán đợt 2 thu từ Phụ huynh sau khi kết thúc 1 tháng học thực tế.
* $G$: Tổng số tiền hệ thống giải ngân chi trả cho Gia sư.
* $R_{offline}$: Doanh thu thuần của nền tảng thu về từ một lớp học Offline.

#### A. Giai đoạn 1: Khởi tạo hợp đồng và Đóng băng dòng tiền
* Tiền cọc trách nhiệm từ phía Phụ huynh thu về hệ thống:
$$C_{ph} = H \times 50\%$$
* Phí cam kết nhận lớp từ phía Gia sư thu về hệ thống:
$$P_{gs} = H \times 30\%$$
* Tổng số tiền dòng tiền vào nền tảng tạm giữ và đóng băng ở đợt 1:
$$T_{freeze} = C_{ph} + P_{gs} = (H \times 50\%) + (H \times 30\%) = H \times 80\%$$

#### B. Giai đoạn 2: Kết thúc 1 tháng học và Tất toán giải ngân
* Tiền thanh toán đợt cuối thu từ Phụ huynh sau khi xác nhận chất lượng dạy:
$$K_{ph} = H \times 50\%$$
* Tổng số tiền thực tế hệ thống thực hiện chi trả sang tài khoản ngân hàng của Gia sư:
$$G = C_{ph} + K_{ph} = (H \times 50\%) + (H \times 50\%) = H \times 100\%$$

#### C. Kết toán doanh thu thuần của nền tảng
Doanh thu thực tế hệ thống giữ lại sau khi kết thúc toàn bộ chu kỳ đối soát được tính bằng tổng dòng tiền nạp vào trừ đi dòng tiền giải ngân ra:
$$R_{offline} = T_{freeze} + K_{ph} - G$$
Thay các biến số ở trên vào phương trình, ta có:
$$R_{offline} = (H \times 80\%) + (H \times 50\%) - (H \times 100\%) = H \times 30\%$$

**Kết luận Trường hợp 1:** Doanh thu thực tế của hệ thống đối với mảng gia sư luôn cố định ở mức **30% trên tổng giá trị học phí tháng đầu tiên**. Nhờ cơ chế thu trước khoản phí này từ tiền cọc cam kết của gia sư ($P_{gs} = H \times 30\%$), nền tảng hoàn toàn triệt tiêu rủi ro nợ xấu hoặc bị người dùng quỵt tiền hoa hồng sau khi kết thúc tháng học.

---

### 3.2. TRƯỜNG HỢP 2: PHÂN HỆ KHÓA HỌC TRỰC TUYẾN

Mô hình này áp dụng cơ chế Khấu trừ tại nguồn tự động đối với các sản phẩm nội dung số.

Gọi các biến số kinh tế bao gồm:
* $P_{course}$: Giá bán trọn gói của khóa học trực tuyến/tài liệu do Giáo viên thiết lập.
* $V_{inflow}$: Dòng tiền nạp vào hệ thống khi Học sinh thực hiện giao dịch mua.
* $E_{teacher}$: Số dư thực tế được cộng vào Ví điện tử của Giáo viên trên sàn.
* $R_{online}$: Doanh thu thuần của nền tảng thu về từ một lượt bán khóa học trực tuyến.

#### A. Giai đoạn 1: Học sinh thanh toán toàn phần
* Dòng tiền vào hệ thống ghi nhận bằng đúng giá trị niêm yết của khóa học qua cổng VNPAY:
$$V_{inflow} = P_{course} \times 100\%$$

#### B. Giai đoạn 2: Khấu trừ tự động tại nguồn dưới Backend
Ngay khi trạng thái hóa đơn chuyển sang COMPLETED, hệ thống tự động chạy hàm phân tách dòng tiền theo tỷ lệ hoa hồng cố định của sàn (30% cho nền tảng và 70% cho người cống hiến nội dung):
* Số thu nhập thực tế được chuyển vào ví số dư của Giáo viên:
$$E_{teacher} = P_{course} \times 70\%$$
* Doanh thu thuần hệ thống tự động trích xuất giữ lại:
$$R_{online} = V_{inflow} - E_{teacher} = (P_{course} \times 100\%) - (P_{course} \times 70\%) = P_{course} \times 30\%$$

**Kết luận Trường hợp 2:** Doanh thu của hệ thống đối với mảng khóa học số luôn cố định ở mức **30% trên mỗi giao dịch mua thành công**. Dòng tiền này được xử lý hoàn toàn tự động theo thời gian thực (Real-time), giúp doanh nghiệp tối ưu chi phí vận hành kế toán thủ công.

---

### TỔNG HỢP DOANH THU TOÀN NỀN TẢNG

Từ hai mô hình toán học trên, tổng doanh thu thuần của toàn bộ hệ thống Learnix tại một thời điểm bất kỳ được xác định bằng hàm tổng hợp sau:

$$\text{Total Net Revenue} = \sum_{i=1}^{n} (H_i \times 30\text{\%}) + \sum_{j=1}^{m} (P_{\text{course}\_j} \times 30\text{\%})$$

Trong đó:
* $n$ là tổng số lớp học Gia sư Offline chốt hợp đồng thành công trong kỳ đối soát.
* $m$ là tổng số lượt mua Khóa học Online thành công trong kỳ đối soát.

---