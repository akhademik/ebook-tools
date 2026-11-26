# Danh sách Tác vụ & Vấn đề Kỹ thuật (TASKS)

## 1. Trạng thái giải quyết vấn đề (Cập nhật 2026-11-26)

Toàn bộ 4 vấn đề kỹ thuật bổ sung (P1, 2x P2, P3) đã được giải quyết triệt để và kiểm thử tự động 100%:

---

### [ĐÃ XONG] P1 — Kiểm chứng Abort giữa lúc JSZip đang nén thực tế

- **Vị trí**: `tests/epub-packer-lifecycle.test.ts`
- **Vấn đề trước đây**: Test cũ gọi `ac.abort()` và gọi mock callback tiến độ trước khi `origGenerateAsync()` chạy, dẫn đến việc abort bị kích hoạt từ trước khi quá trình nén bắt đầu.
- **Giải pháp đã triển khai**:
  - Tái cấu trúc spy trên `JSZip.prototype.generateAsync`: Chuyển tiếp trực tiếp sang `origGenerateAsync.call(this, options, wrappedUpdate)`.
  - Trong `wrappedUpdate`, chỉ kích hoạt `ac.abort()` khi JSZip thực sự phát ra callback tiến độ đầu tiên trong lúc nén các file.
  - Callback `onUpdate` của `zip-writer.ts` ném lỗi `AbortError` từ bên trong luồng nén của JSZip, khiến Promise bị reject chuẩn xác và không trả về Blob.
- **Kiểm thử**: Unit test `should abort generateAsync mid-compression when signal is aborted during progress callback` với `expect(updateCallCount).toBeGreaterThanOrEqual(1)`.

---

### [ĐÃ XONG] P2 — Bổ sung cộng dồn hạn mức 150MB cho ZIP ảnh khi thiếu metadata

- **Vị trí**: `src/lib/epub-packer/state/epub-images-state.svelte.ts`
- **Vấn đề trước đây**: Khi file ZIP không chứa metadata `uncompressedSize` (`preUncompressedSize === null`), code giải nén blob và kiểm tra giới hạn đơn lẻ nhưng không cộng dồn `blob.size` vào `cumulativeZipImageBytes`, khiến giới hạn tổng 150MB có thể bị vượt qua.
- **Giải pháp đã triển khai**:
  - Bổ sung kiểm tra `cumulativeZipImageBytes + blob.size > MAX_IMAGES_ZIP_TOTAL_UNCOMPRESSED_SIZE` ngay sau khi giải nén blob nếu `preUncompressedSize === null`.
  - Cộng dồn `cumulativeZipImageBytes += blob.size`, đảm bảo hạn mức 150MB luôn được thực thi nghiêm ngặt dù file ZIP có hay không có metadata kích thước.
- **Kiểm thử**: Unit test `should track cumulative image size and abort when metadata is missing (preUncompressedSize === null)`.

---

### [ĐÃ XONG] P2 — Chuẩn hóa trích xuất metadata ZIP qua Helper an toàn

- **Vị trí**: `src/lib/utils/zip.ts`, `epub-images-state.svelte.ts`, `epub-source-state.svelte.ts`
- **Vấn đề trước đây**: Sử dụng ép kiểu `(zip.files[name] as any)._data?.uncompressedSize` rải rác ở nhiều state, phụ thuộc trực tiếp vào thuộc tính nội bộ của JSZip.
- **Giải pháp đã triển khai**:
  - Xây dựng helper `getZipEntryUncompressedSize(entry: JSZip.JSZipObject | undefined | null): number | null` trong `src/lib/utils/zip.ts`.
  - Kiểm tra type guard an toàn, số nguyên hữu hạn không âm (`Number.isFinite(size) && size >= 0`).
  - Thay thế toàn bộ các điểm truy cập `_data` trực tiếp trong `epub-images-state.svelte.ts` và `epub-source-state.svelte.ts`.
- **Kiểm thử**: Unit test `getZipEntryUncompressedSize should safely extract size or return null`.

---

### [ĐÃ XONG] P3 — Đồng nhất trạng thái ảnh bìa khi chọn file không hợp lệ

- **Vị trí**: `src/lib/epub-packer/state/epub-images-state.svelte.ts`
- **Vấn đề trước đây**: Khi người dùng chọn file bìa mới quá lớn (> 30MB) hoặc lỗi, hàm thoát sớm nhưng vẫn giữ `coverOriginalUrl` của ảnh bìa cũ, dẫn đến việc giao diện báo lỗi nhưng khi bấm đóng gói vẫn lấy ảnh cũ.
- **Giải pháp đã triển khai**:
  - Bổ sung hàm `clearCoverData()` dọn dẹp triệt để: thu hồi Object URL nếu có, đặt `coverFile = null`, `coverOriginalUrl = null`, `coverWidth = 0`, `coverHeight = 0` và reset crop.
  - Tự động gọi `clearCoverData()` khi file mới vượt quá dung lượng cho phép, thiếu thư viện PDF.js, hoặc xảy ra lỗi đọc/trích xuất.
  - Bảo đảm trạng thái giao diện và dữ liệu đóng gói hoàn toàn đồng nhất.
- **Kiểm thử**: Unit test `should clear existing cover data when selecting an invalid or oversized cover file`.
