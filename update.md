1. README — việc bắt buộc phải làm

Cập nhật để phản ánh đúng scope hiện tại: thêm mục cho EPUB Editor (live preview, cleaner, validator — ~2.600 dòng code, chưa hề nhắc tới) và tính năng xoá nền ảnh bằng ML cho ornament. Đây là việc quan trọng nhất vì hiện README đang làm dự án trông nhỏ hơn thực tế rất nhiều.

3. Vài điểm nhỏ đáng dọn (không khẩn cấp)

a) Phụ thuộc chéo ngược hướng module
src/lib/epub/parser/epub-parser.ts (module lõi "epub") lại import hàm resolveRelativePath từ src/lib/epub-editor/epub-editor.ts (module tính năng). Về nguyên tắc, module lõi (epub/) không nên phụ thuộc vào module tính năng (epub-editor/) — nên đảo ngược: chuyển resolveRelativePath xuống src/lib/utils/ hoặc src/lib/epub/, rồi để epub-editor import từ đó.

b) Trùng tên file gây rối khi điều hướng
Có 2 file cùng tên epub-parser.ts ở 2 thư mục khác nhau (src/lib/epub/parser/ và src/lib/epub-packer/parser/) — chức năng hoàn toàn khác nhau (một đọc EPUB có sẵn, một dựng chương từ markdown/txt/zip). Không phải bug, nhưng dễ gây nhầm khi mở nhiều tab trong IDE. Có thể đổi tên rõ ràng hơn, ví dụ epub-reader-parser.ts vs epub-source-parser.ts.

c) Rải rác any (14 chỗ) trong các file parser và pdf-splitter.ts, epub-images-state.svelte.ts. Không nghiêm trọng nhưng nếu có thời gian rảnh, siết kiểu dữ liệu ở các chỗ này sẽ tăng độ an toàn khi refactor sau này.

d) File lớn nhất: epub-editor.ts (787 dòng), epub-cleaner.ts (702), epub-validator.ts (699) — chưa đến mức báo động, nhưng nếu ba file này tiếp tục phình to khi thêm tính năng, nên cân nhắc tách nhỏ theo mô hình đã áp dụng tốt ở epub-packer.ts (chia thành các hàm/module nhỏ có trách nhiệm rõ ràng).
