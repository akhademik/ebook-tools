~~Ưu tiên cao 2. Rà soát cấu hình TypeScript~~ ✅ **[ĐÃ HOÀN THÀNH - 2026-10-16]**

- Đã rà soát và xử lý toàn bộ 47 lỗi strict type trên 6 files (`epub-chapter-utils.ts`, `epub-single-grouper.ts`, `epub-zip-grouper.ts`, `txt-parser.ts`, `chapter-builder.ts`, `pdf-splitter.ts`, và `+layout.svelte`).
- Đã bật `"strict": true` trong `tsconfig.json`.
- `pnpm check` (`svelte-check`) đạt 0 errors, 0 warnings.
- Toàn bộ 296/296 unit/integration tests pass 100%.

~~Ưu tiên trung bình 3. Kiểm tra vòng đời Web Worker~~ ✅ **[ĐÃ HOÀN THÀNH - 2026-10-16]**

- Đã rà soát và chuẩn hóa toàn diện vòng đời Web Worker trên cả 4 modules:
  - `txt-parser.ts`: Gỡ đầy đủ listener `error`, `messageerror`, `message`, `abort` trong `cleanup()`, bọc `parseTxtToChapters` fallback trong try-catch, bắt lỗi `postMessage`.
  - `duplicate-detector.ts`: Bổ sung listener `error` và `messageerror`, đảm bảo `cleanup()` dọn sạch toàn bộ listener, ngăn ngừa treo Promise khi worker lỗi; bọc `postMessage` chuyển dữ liệu và xử lý fallback an toàn.
  - `pdf-splitter.ts`: Bổ sung listener `error`/`messageerror`, đảm bảo `cleanup()` gỡ listener `abort` khỏi `signal`, bọc `postMessage` trong try-catch với cleanup khi gửi lỗi.
  - `image-bg-remove-ml.ts`: Đã có cơ chế quản lý Map `pendingJobs` và gỡ tập trung, bổ sung try-catch khi `postMessage`.
- Bổ sung 4 unit tests chuyên biệt kiểm tra chạy bất đồng bộ với Worker, xử lý hủy tác vụ và chống rò rỉ listener.

~~Ưu tiên trung bình 4. Phân biệt test đã khai báo và test đã chạy thành công~~ ✅ **[ĐÃ XÁC THỰC THỰC TẾ - 2026-10-16]**

- Đã xác thực thực tế toàn bộ test suite trên commit hiện tại bằng lệnh `pnpm test`:
  - **19/19 test files pass**.
  - **300/300 unit/integration tests pass 100%** (bao gồm smoke tests, golden tests, regression safety net, stress load 1.000 chương, và worker lifecycle tests).
- Đã kiểm tra cấu hình workflow CI trong `.github/workflows/ci.yml`.
