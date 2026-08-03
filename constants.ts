export const DEFAULT_CV7991 = `CÔNG VĂN 7991/BGDĐT-GDTrH - HƯỚNG DẪN XÂY DỰNG MA TRẬN & ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ

1. CẤU TRÚC HỒ SƠ ĐỀ KIỂM TRA ĐỊNH KÌ:
- Ma trận đề kiểm tra.
- Bản đặc tả đề kiểm tra.
- Đề kiểm tra (dành cho học sinh).
- Đáp án và hướng dẫn chấm (thang điểm chi tiết).

2. BA PHẦN CHỦ ĐẠO TRONG ĐỀ THI TRẮC NGHIỆM MỚI (GDPT 2018):
- Phần I: Câu hỏi trắc nghiệm nhiều lựa chọn (4 lựa chọn, chọn 1 đáp án đúng). Thường là 0.25 điểm/câu.
- Phần II: Câu hỏi trắc nghiệm Đúng - Sai. Mỗi câu gồm 4 ý độc lập (a, b, c, d). Điểm tính lũy tiến: đúng 1 ý được 0.1 điểm, đúng 2 ý được 0.25 điểm, đúng 3 ý được 0.5 điểm, đúng 4 ý được 1.0 điểm.
- Phần III: Câu hỏi trắc nghiệm trả lời ngắn (học sinh tự điền đáp án số hoặc kết quả ngắn gọn). Mỗi câu thường đạt 0.25 hoặc 0.5 điểm.
- Phần Tự luận truyền thống (nếu có): Thường có thang điểm rõ ràng cho từng bước giải.

3. CÁC MỨC ĐỘ ĐÁNH GIÁ:
- Nhận biết (NB): Nhắc lại khái niệm, định lý, công thức trực tiếp trong SGK.
- Thông hiểu (TH): Hiểu bản chất câu chữ, áp dụng công thức qua 1 bước tính cơ bản, phân biệt các khái niệm.
- Vận dụng (VD): Liên hệ giải quyết bài toán phức tạp hơn, có sự phối hợp nhiều đơn vị kiến thức hoặc tình huống thực tiễn đơn giản.
- Vận dụng cao (VDC) (nếu cần): Bài tập nâng cao, tư duy sáng tạo sâu sắc.`;

export const DEFAULT_LESSON = `SÁCH GIÁO KHOA TOÁN LỚP 10 - CHUYÊN ĐỀ: PHƯƠNG TRÌNH BẬC HAI VÀ ĐỊNH LÝ VI-ÉT

1. Định nghĩa phương trình bậc hai:
Phương trình bậc hai một ẩn là phương trình có dạng: ax^2 + bx + c = 0 (với a khác 0).
Công thức biệt thức:
\\Delta = b^2 - 4ac
- Nếu \\Delta > 0: Phương trình có hai nghiệm phân biệt:
x_1 = \\frac{-b + \\sqrt{\\Delta}}{2a}, \\quad x_2 = \\frac{-b - \\sqrt{\\Delta}}{2a}
- Nếu \\Delta = 0: Phương trình có nghiệm kép x = -b / (2a).
- Nếu \\Delta < 0: Phương trình vô nghiệm trên tập số thực \\mathbb{R}.

2. Định lý Vi-ét (Viet):
Nếu phương trình bậc hai ax^2 + bx + c = 0 (a khác 0) có hai nghiệm x_1, x_2 thì:
- Tổng hai nghiệm: S = x_1 + x_2 = -b / a
- Tích hai nghiệm: P = x_1 . x_2 = c / a

Ứng dụng của định lý Vi-ét:
- Nhẩm nghiệm:
  + Nếu a + b + c = 0 thì phương trình có một nghiệm là x_1 = 1 và nghiệm kia là x_2 = c/a.
  + Nếu a - b + c = 0 thì phương trình có một nghiệm là x_1 = -1 và nghiệm kia là x_2 = -c/a.
- Tìm hai số biết tổng S và tích P: Hai số đó là nghiệm của phương trình bậc hai: t^2 - S.t + P = 0 (điều kiện để có hai số là S^2 - 4P >= 0).
- Biểu diễn đối xứng nghiệm: Tính giá trị biểu thức đối xứng như:
A = x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2 = S^2 - 2P.
B = \\frac{1}{x_1} + \\frac{1}{x_2} = \\frac{x_1 + x_2}{x_1 x_2} = \\frac{S}{P}.

3. Sai lầm phổ biến của học sinh:
- Áp dụng Định lý Vi-ét khi phương trình chưa có điều kiện tồn tại nghiệm (chưa có \\Delta >= 0).
- Nhầm dấu trong tổng và tích: Nhầm S = b/a hoặc P = -c/a.
- Quên điều kiện hệ số a khác 0 khi biện luận tham số m để phương trình có hai nghiệm.`;

export const DEFAULT_SAMPLE_EXAM = `SỞ GIÁO DỤC VÀ ĐÀO TẠO TỈNH ĐỒNG NAI
TRƯỜNG THPT CHUYÊN LƯƠNG THẾ VINH
ĐỀ THI MINH HỌA - KÌ THI KIỂM TRA ĐỊNH KÌ
Môn thi: TOÁN LỚP 10
Thời gian làm bài: 45 phút (Không kể thời gian phát đề)

--------------------------------------------------
PHẦN I. Câu trắc nghiệm nhiều lựa chọn (3.0 điểm).
Học sinh trả lời từ câu 1 đến câu 12. Mỗi câu hỏi chỉ chọn một phương án trả lời đúng. Mỗi câu đúng được 0.25 điểm.

Câu 1. Cho phương trình bậc hai x^2 - 5x + 6 = 0. Tổng hai nghiệm S của phương trình là:
A. S = -5.
B. S = 5.
C. S = 6.
D. S = -6.

Câu 2. Biệt thức \\Delta của phương trình ax^2 + bx + c = 0 (a khác 0) được xác định bởi công thức nào dưới đây?
A. \\Delta = b^2 - 4ac.
B. \\Delta = b^2 + 4ac.
C. \\Delta = b^2 - ac.
D. \\Delta = b - 4ac.

PHẦN II. Câu trắc nghiệm Đúng - Sai (4.0 điểm).
Học sinh trả lời từ câu 1 đến câu 4. Trong mỗi ý a), b), c), d) ở mỗi câu, học sinh chọn Đúng (Đ) hoặc Sai (S).
Cách tính điểm: Đúng 1 ý được 0.1 điểm, Đúng 2 ý được 0.25 điểm, Đúng 3 ý được 0.5 điểm, Đúng 4 ý được 1.0 điểm.

Câu 1. Cho phương trình x^2 - 2(m + 1)x + m^3 - 4 = 0 (m là tham số). Khi m = 1:
a) Phương trình trở thành x^2 - 4x - 3 = 0.
b) Biệt thức \\Delta của phương trình bằng 28.
c) Phương trình luôn có hai nghiệm phân biệt có dấu đối nhau.
d) Tổng hai nghiệm lớn hơn tích hai nghiệm của phương trình.

PHẦN III. Câu hỏi trắc nghiệm trả lời ngắn (3.0 điểm).
Học sinh trả lời từ câu 1 đến câu 6. Mỗi câu trả lời đúng được 0.5 điểm.

Câu 1. Gọi x_1, x_2 là nghiệm của phương trình x^2 - 7x + 12 = 0. Hãy tính giá trị của biểu thức A = x_1^2 + x_2^2.
Đáp số: .........`;

export const DEFAULT_MATRIX_TEMPLATE = `BẢNG MA TRẬN PHÂN PHỐI ĐỀ KIỂM TRA MẪU (MÔN TOÁN 10):
| Nội dung kiến thức | Nhận biết | Thông hiểu | Vận dụng | Tổng |
| :--- | :---: | :---: | :---: | :---: |
| 1. Tổng & Tích Vi-ét | 4 câu (I) | 2 câu (I) | 1 ý (II) | 7 câu/ý |
| 2. Nhẩm nghiệm thức | 2 câu (I) | 2 ý (II) | 1 câu (III) | 5 câu/ý |
| 3. Biểu thức đối xứng nghiệm | 2 câu (I) | 1 ý (II) | 2 câu (III) | 5 câu/ý |
| Tổng số câu/ý | 8 câu | 4 ý | 3 câu / ý | 15 câu |
| Tỉ lệ % điểm số | 30% | 40% | 30% | 100% |`;

// PROMPT CHO BƯỚC 1: PHÂN TÍCH NGUỒN VÀ BẮT FORM MẪU
export const PROMPT_STEP1 = `Bạn là chuyên gia kiểm tra đánh giá theo Chương trình GDPT 2018, am hiểu Công văn 7991/BGDĐT-GDTrH và có khả năng phân tích chính xác hình thức trình bày của đề kiểm tra mẫu.
Hãy đọc toàn bộ nguồn tài liệu cung cấp trong Sổ ghi chú, gồm:
- Công văn 7991/BGDĐT-GDTrH.
- SGK hoặc tài liệu bài học.
- Đề kiểm tra mẫu.
- Ma trận đề (nếu có).

Nhiệm vụ ở bước này:
  Chưa tạo đề kiểm tra.
  Chỉ phân tích nguồn và nhận diện chính xác form mẫu.
Hãy trình bày kết quả theo đúng 4 phần sau đây:

PHẦN 1. Phân tích Công văn 7991
Hãy rút ra:
- Hồ sơ đề kiểm tra định kì cần có những phần nào.
- Ma trận đề kiểm tra định kì gồm những cột nào.
- Bản đặc tả đề kiểm tra định kì gồm những cột nào.
- Có những dạng câu hỏi nào.
- Có những mức độ đánh giá nào.
- Cách hiểu các mức Biết, Hiểu, Vận dụng khi tạo câu hỏi.

PHẦN 2. Phân tích SGK hoặc tài liệu bài học
Hãy rút ra:
- Tên bài học/chủ đề.
- Nội dung kiến thức trọng tâm.
- Khái niệm, định lý, công thức cần kiểm tra.
- Các dạng bài tập trong SGK.
- Các dạng câu hỏi có thể tạo.
- Nội dung phù hợp mức Biết.
- Nội dung phù hợp mức Hiểu.
- Nội dung phù hợp mức Vận dụng.
- Những lỗi sai học sinh thường gặp.

PHẦN 3. Phân tích đề kiểm tra mẫu
Hãy mô tả thật chi tiết để có thể tạo đề mới giống mẫu nhất:
- Tiêu đề trên cùng.
- Tên trường, tổ, môn, lớp, thời gian làm bài nếu có.
- Cách ghi “Đề kiểm tra”, “Kiểm tra định kì”, “Đề chính thức” nếu có.
- Thứ tự các phần.
- Số lượng câu từng phần.
- Dạng câu hỏi từng phần.
- Cách đánh số câu.
- Cách ghi điểm.
- Cách trình bày bảng.
- Cách trình bày phần học sinh làm bài.
- Cách trình bày đáp án.
- Cách trình bày hướng dẫn chấm.
- Những cụm từ, tiêu đề, định dạng cần giữ nguyên.

PHẦN 4. Kết luận form cần tạo
Hãy lập bảng gồm:
- Thành phần trong file mẫu.
- Cách trình bày trong file mẫu.
- Có cần giữ nguyên không.
- Nội dung nào sẽ thay bằng bài học mới.
- Lưu ý khi tạo đề.

Yêu cầu bắt buộc:
- Chỉ dùng nguồn được cung cấp.
- Không tạo đề ở bước này.
- Không tự bịa thông tin ngoài nguồn.
- Phân tích càng cụ thể càng tốt để bước sau tạo đề giống mẫu.`;

// PROMPT CHO BƯỚC 2: LỆNH TẠO MA TRẬN VÀ BẢN ĐẶC TẢ
export const PROMPT_STEP2 = `Dựa trên toàn bộ nguồn tài liệu và phần phân tích vừa thực hiện, hãy tạo ma trận đề kiểm tra định kì và bản đặc tả đề kiểm tra định kì theo đúng tinh thần Công văn 7991/BGDĐT-GDTrH.

Yêu cầu chung:
- Bám sát SGK hoặc tài liệu bài học.
- Bám sát đề kiểm tra mẫu.
- Đúng mẫu ma trận và bản đặc tả trong Công văn 7991.
- Có các mức độ đánh giá: Biết, Hiểu, Vận dụng.
- Có các dạng câu hỏi phù hợp: Nhiều lựa chọn, Đúng - Sai, Trả lời ngắn, Tự luận.
- Nếu dạng câu hỏi nào không phù hợp với đề mẫu hoặc bài học, hãy điều chỉnh hợp lý và nêu rõ lý do.
- Tổng điểm toàn bài là 10 điểm.
- Số câu và điểm phải khớp với cấu trúc đề mẫu.
- Không đưa kiến thức ngoài SGK hoặc tài liệu bài học.

PHẦN 1. MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ
Hãy tạo bảng ma trận theo mẫu Công văn 7991, gồm đầy đủ:
- TT.
- Chủ đề/Chương.
- Nội dung/đơn vị kiến thức.
- Mức độ đánh giá (Biết, Hiểu, Vận dụng).
- TNKQ (Nhiều lựa chọn, Đúng - Sai, Trả lời ngắn, Tự luận).
- Tổng % điểm.

PHẦN 2. BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ
Hãy tạo bảng bản đặc tả theo mẫu Công văn 7991, gồm đầy đủ:
- TT.
- Chủ đề/Chương.
- Nội dung/đơn vị kiến thức.
- Yêu cầu cần đạt.
- Số câu hỏi ở các mức độ đánh giá (Biết, Hiểu, Vận dụng) phân theo các loại hình trắc nghiệm Nhiều lựa chọn, Đúng - Sai, Trả lời ngắn, Tự luận.

PHẦN 3. TỰ RÀ SOÁT
Sau khi tạo xong, hãy lập bảng kiểm tra gồm:
- Tiêu chí.
- Kết quả.
- Cần chỉnh gì nếu chưa đạt.
Các tiêu chí:
- Đúng mẫu Công văn 7991 chưa?
- Đúng cấu trúc đề mẫu chưa?
- Bám sát SGK chưa?
- Tổng điểm đủ 10 chưa?
- Ma trận và bản đặc tả đã khớp nhau chưa?
- Các mức độ đánh giá đã hợp lý chưa?`;

// PROMPT CHO BƯỚC 3: LỆNH TẠO ĐỀ KIỂM TRA GIỐNG FILE MẪU
export const PROMPT_STEP3 = `Dựa vào:
- Công văn 7991/BGDĐT-GDTrH.
- SGK hoặc tài liệu bài học.
- Giáo án nếu có.
- File đề kiểm tra mẫu.
- Ma trận đề kiểm tra vừa tạo.
- Bản đặc tả đề kiểm tra vừa tạo.
Hãy tạo đề kiểm tra định kì hoàn chỉnh.

Yêu cầu cao nhất:
- Đề mới phải giống file đề mẫu nhất có thể về hình thức, nhưng nội dung phải bám sát SGK hoặc tài liệu bài học.

Yêu cầu về hình thức:
- Giữ đúng kiểu tiêu đề của đề mẫu.
- Giữ đúng cách ghi tên trường, tổ, môn, lớp, thời gian nếu mẫu có.
- Giữ đúng thứ tự các phần.
- Giữ đúng tên các phần.
- Giữ đúng cách đánh số câu.
- Giữ đúng cách ghi điểm.
- Giữ đúng kiểu bảng nếu mẫu có bảng.
- Giữ đúng cách trình bày hướng dẫn học sinh làm bài.
- Giữ đúng phong cách ngôn ngữ của đề mẫu.
- Không tự tạo bố cục mới nếu đề mẫu đã có bố cục rõ ràng.

Yêu cầu về nội dung:
- Câu hỏi phải bám sát SGK hoặc tài liệu bài học.
- Câu hỏi phải bám sát ma trận.
- Câu hỏi phải bám sát bản đặc tả.
- Không đưa kiến thức ngoài nguồn.
- Không hỏi quá khó so với bài học.
- Không đánh đố học sinh.
- Dữ kiện câu hỏi phải đầy đủ.
- Câu hỏi phải rõ ràng, chuẩn xác.
- Tổng điểm toàn bài là 10.
- Có đủ mức Biết, Hiểu, Vận dụng.

Hãy trình bày theo thứ tự:
1. Đề kiểm tra dành cho học sinh.
2. Đáp án.
3. Hướng dẫn chấm.

Lưu ý:
- Phần đề học sinh không được chứa đáp án.
- Đáp án và hướng dẫn chấm phải tách riêng.
- Nếu là câu trắc nghiệm, phải có bảng đáp án.
- Nếu là câu đúng sai, phải có đáp án từng ý.
- Nếu là câu trả lời ngắn, phải có đáp án ngắn gọn.
- Nếu là câu tự luận, phải có thang điểm từng bước.`;

// PROMPT CHO BƯỚC 5: TẠO NHIỀU ĐỀ TƯƠNG ĐƯƠNG TỪ ĐỀ GỐC
export const PROMPT_STEP5 = `Dựa vào đề kiểm tra gốc vừa tạo, hãy tạo thêm nhiều mã đề tương đương.
Mục tiêu:
  Tạo các đề mới khác đề gốc về số liệu, ngữ cảnh, cách hỏi hoặc thứ tự câu, nhưng vẫn giữ nguyên cấu trúc, mức độ khó, ma trận, bản đặc tả và thang điểm.

Yêu cầu bắt buộc:
- Tạo 4 mã đề: Mã đề 101, Mã đề 102, Mã đề 103, Mã đề 104.
- Các mã đề phải cùng cấu trúc với đề gốc.
- Giữ nguyên số phần của đề.
- Giữ nguyên số câu từng phần.
- Giữ nguyên dạng câu hỏi từng phần.
- Giữ nguyên tổng điểm 10.
- Giữ nguyên thang điểm từng câu.
- Giữ nguyên mức độ đánh giá: Biết, Hiểu, Vận dụng.
- Giữ nguyên yêu cầu cần đạt trong bản đặc tả.
- Giữ nguyên tỉ lệ điểm trong ma trận.
- Không đưa kiến thức ngoài SGK hoặc tài liệu đã tải lên.
- Không tạo đề dễ hơn hoặc khó hơn rõ rệt so với đề gốc.
- Không làm thay đổi bản chất kiến thức cần kiểm tra.
- Nếu thay số liệu, số liệu mới phải tính được đẹp và hợp lý.
- Nếu thay tình huống, tình huống mới phải tương đương về độ khó.
- Nếu thay câu chữ, câu hỏi vẫn phải rõ ràng, không gây hiểu nhầm.
- Nếu đảo thứ tự câu, phải cập nhật lại đáp án chính xác.
- Mỗi mã đề phải có đáp án riêng.
- Mỗi mã đề phải có hướng dẫn chấm riêng nếu phần tự luận thay đổi dữ kiện.
- Không để đáp án lẫn vào phần đề học sinh.

Cách tạo biến thể:
- Với câu trắc nghiệm: đổi số liệu, đổi thứ tự phương án, đổi ngữ cảnh, giữ nguyên năng lực cần kiểm tra.
- Với câu đúng sai: đổi mệnh đề tương đương, đổi số liệu, đổi tình huống, giữ nguyên mức độ đánh giá.
- Với câu trả lời ngắn: đổi dữ kiện, đổi số đo, đổi tên điểm/hình, nhưng kết quả phải rõ ràng.
- Với câu tự luận: đổi số liệu, đổi hình vẽ mô tả, đổi bối cảnh thực tế, giữ nguyên cách giải và mức độ khó tương đương.

Sản phẩm cần trả về theo thứ tự:
PHẦN 1. BẢNG ĐỐI CHIẾU CÁC MÃ ĐỀ (Câu gốc, Mã đề 101, 102, 103, 104, Đổi mới, Mức độ, Yêu cầu)
PHẦN 2. MÃ ĐỀ 101 (Đề thi học sinh, Đáp án, Hướng dẫn chấm)
PHẦN 3. MÃ ĐỀ 102 (Đề thi học sinh, Đáp án, Hướng dẫn chấm)
PHẦN 4. MÃ ĐỀ 103 (Đề thi học sinh, Đáp án, Hướng dẫn chấm)
PHẦN 5. MÃ ĐỀ 104 (Đề thi học sinh, Đáp án, Hướng dẫn chấm)
PHẦN 6. BẢNG TỰ RÀ SOÁT (Tiêu chí rà soát như: Cùng cấu trúc, cùng tỉ lệ điểm, không câu vượt ngoài, có sai đáp án, kết luận...).

Yêu cầu cuối cùng:
- Hãy tự kiểm tra lại đáp án từng mã đề và tự động hiệu đính trước khi kết xuất.`;

export const MUC_DO_OPTIONS = [
  { value: 'NB', label: 'Nhận biết (NB)' },
  { value: 'TH', label: 'Thông hiểu (TH)' },
  { value: 'VD', label: 'Vận dụng (VD)' },
  { value: 'VDC', label: 'Vận dụng cao (VDC)' }
];

