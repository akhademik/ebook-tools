# Kết quả xử lý rà soát (Worker Cancellation & Fallback Resolutions - 2026-10-16)

### 1. Hủy tác vụ Worker — Đã xử lý triệt để race condition ✅ [ĐÃ HOÀN THÀNH]

- **Hiện trạng trước**: Trong `txt-parser.ts` và `duplicate-detector.ts`, hàm `handleAbort` gọi `worker.terminate()` trên Worker Singleton dùng chung. Nếu 2 tác vụ cùng chạy và 1 tác vụ bị hủy, worker bị kết thúc đột ngột khiến Promise của tác vụ còn lại bị treo vĩnh viễn.
- **Xử lý**:
  - Thiết lập cơ chế đăng ký tác vụ trung tâm (`pendingTxtJobs` và `pendingDuplicateJobs` dạng `Map<string, Job>`) với bộ listener `onmessage`, `onerror`, `onmessageerror` duy nhất gắn trên Worker.
  - Khi một tác vụ bị hủy qua `AbortSignal`: Gỡ listener abort, xóa tác vụ khỏi Map và reject `AbortError`.
  - **Chỉ gọi `worker.terminate()` khi `pendingJobs.size === 0`** (không còn bất kỳ tác vụ nào khác đang chờ). Nếu vẫn còn tác vụ khác đang chạy, worker tiếp tục hoạt động bình thường và hoàn tất tác vụ còn lại.
  - Khi worker gặp sự cố (`onerror` / `onmessageerror`): Toàn bộ tác vụ đang chờ trong Map được chuyển đổi an toàn sang tính toán trực tiếp trên luồng chính (fallback).
  - Bổ sung unit tests kiểm tra tình huống 2 tác vụ chạy song song và hủy 1 tác vụ mà tác vụ kia vẫn hoàn thành thành công trong `tests/epub-parser.test.ts` và `tests/epub-cleaner.test.ts`.

### 2. Image Background Removal — Hoàn thiện fallback tự phục hồi ✅ [ĐÃ HOÀN THÀNH]

- **Hiện trạng trước**: Trong `image-bg-remove-ml.ts`, nếu `worker.postMessage(req)` ném lỗi (ví dụ lỗi DataCloneError hoặc worker crash ngầm), code chỉ dọn job rồi reject Promise mà không chuyển sang xử lý trên luồng chính.
- **Xử lý**:
  - Tách logic xử lý trên main thread thành hàm `processOrnamentOnMainThread(imageSource, options)`.
  - Trong khối `catch (postErr)` của `worker.postMessage(req)`: Ghi nhận warning và tự động chuyển hướng sang `processOrnamentOnMainThread(...)` để hoàn tất tác vụ thay vì reject.
  - Bổ sung unit test mô phỏng `worker.postMessage` ném lỗi và xác nhận hệ thống tự phục hồi thành công trên luồng chính trong `tests/image-bg-remove.test.ts`.
