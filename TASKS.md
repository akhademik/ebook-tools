2. Những vấn đề cần chú ý
   Ưu tiên P1
   Lỗi race condition khi thay đổi PDF trong lúc đang xử lý (✅ ĐÃ KHẮC PHỤC)

File: src/lib/pdf-splitter/pdf-splitter-state.svelte.ts

Trong handleFile(), tôi thấy có một vấn đề:

- Người dùng đang xử lý PDF A.
- Người dùng chọn PDF B.
- State lập tức chuyển sang PDF B và xóa kết quả cũ.
- Nhưng tác vụ xử lý PDF A vẫn có thể tiếp tục chạy.
- Khi PDF A hoàn thành, kết quả của nó có thể ghi đè vào state của PDF B.
  Nguyên nhân là handleFile() chưa hủy tác vụ đang chạy trước khi thay đổi file, cũng chưa có cơ chế kiểm tra tác vụ nào còn quyền cập nhật state.

Đây là lỗi có thể khiến người dùng tưởng rằng ứng dụng đã xử lý xong PDF B, nhưng thực tế kết quả lại thuộc PDF A.

Hướng sửa: Hủy tác vụ cũ khi chọn file mới, đồng thời sử dụng task ID hoặc generation token để ngăn tác vụ cũ cập nhật state.

> **Trạng thái (2026-11-26)**: ✅ **Đã khắc phục hoàn toàn**. `handleFile()` tự động gọi `this.cancelProcessTask()` và hủy phiên nạp preview cũ. Áp dụng `fileGenerationToken` và `processGenerationToken` để ngăn chặn hoàn toàn kết quả tác vụ cũ ghi đè vào state file mới. Đã kiểm chứng qua unit test.

Xem PdfSplitterState

Ưu tiên P1
Race condition khi hủy và khởi chạy lại tác vụ (✅ ĐÃ KHẮC PHỤC)

Cũng trong PdfSplitterState.processPdf().

Đoạn finally trước đây:
finally {
this.processing = false;

    if (this.pdfAbortController === ac) {
        this.pdfAbortController = null;
    }

}

Có một lỗi logic:

1. Tác vụ A đang chạy.
2. Người dùng nhấn xử lý lần nữa.
3. A bị hủy và B được khởi chạy.
4. A kết thúc muộn hơn.
5. finally của A đặt processing = false, mặc dù B vẫn đang chạy.
   Ngoài ra, callback onProgress của A vẫn có khả năng ghi đè trạng thái tiến trình của B.

Hướng sửa: Chỉ cho phép tác vụ hiện tại cập nhật processing, status, progressPercent và kết quả. Kiểm tra identity của AbortController hoặc task ID ở tất cả callback và finally.

Đây là lỗi quản lý vòng đời tác vụ, không phải lỗi thuật toán render PDF.

> **Trạng thái (2026-11-26)**: ✅ **Đã khắc phục hoàn toàn**. Sử dụng `processGenerationToken`: `onProgress`, `catch`, và `finally` chỉ cập nhật state nếu token tác vụ khớp với token hiện hành. `finally` của tác vụ cũ không bao giờ tắt cờ `processing = false` của tác vụ mới. Đã kiểm chứng qua unit test.

Ưu tiên P2
Race condition khi tải Preview (✅ ĐÃ KHẮC PHỤC)

Hàm loadPreview() cũng chưa có cơ chế chống kết quả cũ.

Ví dụ:

- Chọn PDF A và bấm tải Preview.
- Trong lúc PDF A đang render, chọn PDF B.
- Preview A hoàn thành muộn và ghi đè previewPages của B.
  Nên sử dụng request ID hoặc hủy request cũ khi thay file.

> **Trạng thái (2026-11-26)**: ✅ **Đã khắc phục hoàn toàn**. Bổ sung `previewGenerationToken` cô lập các request tải preview. Thêm hỗ trợ `signal?: AbortSignal` trong `loadPdfPreview` để dừng vòng lặp sớm. Khi chọn file mới, preview cũ bị hủy và vô hiệu hóa ngay lập tức. Đã kiểm chứng qua unit test.

3. Kiểm tra PDF Splitter
   Tôi đã đọc logic chính trong pdf-splitter.ts, không chỉ dựa vào mô tả trong README.

Những phần đang được triển khai tương đối hợp lý:
Hạng mục Nhận xét
Tái sử dụng một PDF document Tốt
Object URL và cleanup Có xử lý
Giới hạn kích thước Canvas Có
Giảm DPI khi render lỗi Có retry
Grayscale Web Worker Có fallback
Chia ZIP theo dung lượng Có
Giải phóng Canvas Có
Chia nhỏ ZIP để giới hạn RAM Có
Hủy tác vụ bằng AbortController Có, đã khắc phục triệt để race condition
Cleanup PDF document Có trong finally

Một số thông số hiện tại:

- Mặc định 200 DPI.
- Desktop: ZIP tối đa mục tiêu 80 MB/phần.
- Mobile: 40 MB/phần.
- Giới hạn 300 trang/phần.
- JPEG quality 85%.
- Render tuần tự từng trang.
- Worker grayscale có timeout thích ứng, tối đa 60 giây.
- Khi render thất bại, thử lại một lần với độ phân giải thấp hơn.
  Điểm cần chú ý về hiệu năng:

Việc render tuần tự giúp kiểm soát RAM tốt hơn nhưng cũng giới hạn tốc độ xử lý. Tôi không xem đây là lỗi, vì tăng concurrency có thể làm tình hình RAM tệ hơn đáng kể.

Tôi chưa thấy bằng chứng đủ mạnh để kết luận thuật toán chia ZIP hoặc render trang hiện tại đang sai.

Tuy nhiên, chưa thể xác nhận hiệu năng thực tế trên PDF scan lớn chỉ bằng unit test.
Xem toàn bộ PDF Splitter Core4. Build, CI và cấu hình dự án
Ưu tiên P2
README khai báo sai phiên bản Node.js tối thiểu (✅ ĐÃ KHẮC PHỤC)

Đây là vấn đề tương đối rõ ràng.

Trong README hiện ghi:
Node.js: Phiên bản 18 trở lên.
pnpm: Phiên bản 9 trở lên.

Nhưng package.json hiện sử dụng:
{
"packageManager": "pnpm@11.22.0",
"devDependencies": {
"vite": "^8.0.16",
"@sveltejs/kit": "^2.63.0",
"svelte": "^5.56.1"
}
}

Vite 8 yêu cầu:

- Node.js 20.19 trở lên.
- Hoặc Node.js 22.12 trở lên.
  Nguồn:
  Vite+1

Do đó, README cần cập nhật yêu cầu Node.js. Ngoài ra, cần thống nhất phiên bản pnpm được khuyến nghị với packageManager trong package.json.

> **Trạng thái (2026-11-26)**: ✅ **Đã khắc phục hoàn toàn**. Đã cập nhật `README.md` yêu cầu tối thiểu Node.js 20.19+ hoặc 22.12+ (chuẩn Vite 8) và khuyến nghị pnpm 10+ (đồng bộ với packageManager).

package.json
CI chưa xác nhận được trạng thái xanh (ℹ️ ĐÃ LÀM RÕ)

Workflow hiện tại có kiểm tra:

1. TypeScript / Svelte Check.
2. ESLint.
3. Prettier.
4. Unit Tests.
5. Knip.
6. Production Build.
7. Playwright E2E.
   Đây là bộ kiểm tra khá đầy đủ.

Tuy nhiên, khi truy vấn trạng thái commit mới nhất, danh sách CI status trả về rỗng. Tôi không thể xác nhận GitHub Actions đã chạy thành công cho commit này.

> **Trạng thái (2026-11-26)**: ℹ️ **Đã làm rõ**. Môi trường local không có sẵn `gh` CLI nên không truy vấn được GitHub Actions API qua dòng lệnh. File workflow `.github/workflows/ci.yml` đã được kiểm tra và cấu hình chuẩn. Toàn bộ 7 bước tương ứng trên máy local đều pass 100%.
