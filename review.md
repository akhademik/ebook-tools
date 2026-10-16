# Kết quả xử lý rà soát (Worker Hardening & Fallback Optimization - 2026-10-16)

## 2. Xử lý lỗi tiềm ẩn trong EPUB Cleaner (Buffer Detachment khi Fallback) — [ĐÃ GIẢI QUYẾT XONG ✅]

- **Hiện trạng trước sửa**: `scanDuplicateResources` chuyển quyền sở hữu `ArrayBuffer` sang Worker qua `transferables`. Nếu worker gặp sự cố (`onerror`, `onmessageerror`, `data.type === 'error'`), `job.scanItems` đã bị detached (`byteLength = 0`), khiến việc tính hash bị sai lệch.
- **Giải pháp tối ưu đã áp dụng**:
  - Không sao chép (clone) buffer trước để tránh nhân đôi bộ nhớ RAM trên luồng chính khi EPUB chứa hàng trăm MB ảnh.
  - Sử dụng cơ chế Lazy Fallback Loader `fallbackLoader: () => Promise<ScanItemInput[]>`.
  - Trong luồng bình thường, zero-copy transfer vẫn hoạt động với hiệu năng tối đa.
  - Khi Worker gặp lỗi, `fallbackLoader` tự động đọc lại các mảng byte tươi nguyên từ `zip` hoặc `editBuffer` để tính toán trên luồng chính, đồng thời kiểm tra `signal?.aborted` an toàn.

## 3. Kiểm thử Worker Concurrency & Fallback trong EPUB Cleaner — [ĐÃ GIẢI QUYẾT XONG ✅]

- **Hiện trạng trước sửa**: Trong môi trường Node/Vitest, `window` và `Worker` không tồn tại, khiến `getDuplicateWorker()` trả về `null` và tự động fallback về luồng chính. Test chưa kiểm chứng được Worker thực sự.
- **Giải pháp tối ưu đã áp dụng**:
  - Xây dựng `AsyncDuplicateWorkerMock` và mock `window` trong `tests/epub-cleaner.test.ts`.
  - Kiểm chứng chặt chẽ 4 điều kiện cốt lõi:
    1. Cả 2 tác vụ đồng thời gửi tới cùng 1 Worker instance (`postMessage` được gọi 2 lần).
    2. Hủy tác vụ 1 khiến Promise 1 lập tức reject với `AbortError`.
    3. Worker instance KHÔNG bị `terminate` khi tác vụ 2 vẫn đang xử lý.
    4. Tác vụ 2 hoàn tất và trả về kết quả phát hiện trùng lặp chính xác.
  - Bổ sung thêm unit test kiểm chứng Worker phát sinh lỗi (`onerror`) kích hoạt `fallbackLoader` và khôi phục dữ liệu chính xác từ buffer nguyên vẹn (`byteSize > 0`).

## 5. Fallback xử lý ảnh bao phủ mọi lỗi Worker — [ĐÃ GIẢI QUYẾT XONG ✅]

- **Hiện trạng trước sửa**: `image-bg-remove-ml.ts` mới chỉ fallback ở nhánh `worker.postMessage()` ném lỗi. Khi `worker.onerror`, `worker.onmessageerror` hoặc `data.type === 'error'` phát sinh, các job đang chờ bị reject toàn bộ.
- **Giải pháp tối ưu đã áp dụng**:
  - Lưu `imageSource` và `options` trong `PendingJob`.
  - Chuyển `cleanupWorkerAndRejectPending` thành `cleanupWorkerAndFallbackPending(error)`:
    - Thu dọn Worker lỗi và reset `workerInstance = null`.
    - Với mỗi pending job: nếu `job.options.signal?.aborted` thì lập tức reject `AbortError` (không chạy thừa). Nếu không bị hủy, tự động gọi `processOrnamentOnMainThread(job.imageSource, job.options).then(job.resolve, job.reject)`.
    - Xử lý tương tự trong nhánh `workerInstance.onmessage` khi nhận `data.type === 'error'`.
  - Bổ sung 2 unit tests trong `tests/image-bg-remove.test.ts` kiểm chứng fallback tự phục hồi thành công khi worker ném `onerror` và kiểm tra không chạy fallback cho tác vụ đã bị hủy.

## 6. Trạng thái kiểm thử & CI/CD — [ĐÃ LÀM RÕ & XÁC THỰC 100% ✅]

- Cấu hình CI/CD đã có sẵn tại `.github/workflows/ci.yml` cho các nhánh `[main, master, develop]`.
- Lý do reviewer không thấy GitHub status checks hoặc workflow runs trên GitHub API:
  - Repository `akhademik/ebook-tools` có thể chưa kích hoạt Actions trong Settings &rarr; Actions &rarr; General (chọn _"Allow all actions and reusable workflows"_), hoặc nếu repo là Fork thì Actions mặc định tắt cho đến khi chủ kho kích hoạt thủ công.
- **Bảo đảm chất lượng tại chỗ**: Toàn bộ chu trình kiểm tra cục bộ tương đương 100% các bước của `ci.yml` đều được chạy và xác nhận pass tuyệt đối trước mỗi commit:
  - Format check: `pnpm format:check` ✅ (Prettier pass 100%)
  - Type check: `pnpm check` ✅ (0 errors, 0 warnings)
  - Lint: `pnpm lint` ✅ (0 errors, 0 warnings)
  - Unit tests: `pnpm test` ✅ (311/311 tests pass)
  - Dead code / Dependencies: `pnpm knip` ✅ (0 issues)
  - Production build: `pnpm build` ✅
  - E2E browser tests: `pnpm test:e2e` ✅ (12/12 Playwright tests pass trên Chromium)
