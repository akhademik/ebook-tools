# Danh sách Tác vụ & Vấn đề Kỹ thuật (TASKS)

## 1. Trạng thái giải quyết vấn đề (Cập nhật 2026-11-26)

Toàn bộ 5 vấn đề cốt lõi (1 P1 và 4 P2) đã được phân tích, triển khai giải pháp kỹ thuật triệt để và kiểm thử tự động 100% thành công.

---

### [ĐÃ XONG] P1 — Ngăn chặn khởi chạy nhiều tác vụ đóng gói cùng lúc

- **Vị trí**: `src/lib/epub-packer/epub-state.svelte.ts`
- **Vấn đề trước đây**: Khi người dùng thao tác nhanh hoặc click nhiều lần, nhiều lời gọi `processEpub()` cùng lúc có thể đồng thời vượt qua `await this.activePackagingPromise` sau khi tác vụ trước giải phóng và tạo nhiều tác vụ đóng gói song song.
- **Giải pháp đã triển khai**:
  - Bổ sung cờ mutex `isLockingPack`.
  - Ngay đầu `processEpub()`, kiểm tra `if (this.processing || this.isLockingPack) return;`.
  - Đặt `this.isLockingPack = true` ngay trước khi chờ `activePackagingPromise` và giải phóng `this.isLockingPack = false` trong khối `finally`.
  - Tuần tự hóa tuyệt đối mọi tác vụ đóng gói; mọi thao tác spam click hoặc re-entrant call trong lúc đang đợi khóa đều bị bỏ qua an toàn.
- **Kiểm thử**: Unit test `should ignore concurrent processEpub calls while packaging is active or locking` trong `tests/epub-packer-lifecycle.test.ts`.

---

### [ĐÃ XONG] P2 — Kiểm soát đầy đủ file PDF bên trong ZIP ảnh minh họa

- **Vị trí**: `src/lib/epub-packer/state/epub-images-state.svelte.ts`
- **Vấn đề trước đây**: File PDF nằm trong ZIP ảnh chưa được kiểm tra `uncompressedSize` trước khi giải nén và chưa tính vào hạn ngạch dung lượng tổng (150MB).
- **Giải pháp đã triển khai**:
  - Áp dụng kiểm tra trước `preUncompressedSize > MAX_IMAGE_FILE_SIZE` (30MB) đối với PDF trong ZIP tương tự như ảnh.
  - Cộng dồn dung lượng PDF vào `cumulativeZipImageBytes` và kiểm tra tổng hạn mức `cumulativeZipImageBytes + size > MAX_IMAGES_ZIP_TOTAL_UNCOMPRESSED_SIZE` (150MB).
  - Tự động bỏ qua hoặc dừng quá trình khi vượt quá ngưỡng bộ nhớ, ngăn chặn zip-bomb và cạn kiệt RAM.
- **Kiểm thử**: Unit test `should skip PDF files inside illustration ZIP that exceed size limits based on _data.uncompressedSize` trong `tests/epub-packer-lifecycle.test.ts`.

---

### [ĐÃ XONG] P2 — Khử hoàn toàn race condition trong Import ảnh minh họa

- **Vị trí**: `src/lib/epub-packer/state/epub-images-state.svelte.ts`
- **Vấn đề trước đây**: `handleIllustrationFiles()` thực hiện nhiều thao tác bất đồng bộ (đọc ZIP, giải nén ảnh, render PDF). Nếu người dùng chọn file mới hoặc xóa ảnh, tác vụ cũ hoàn thành muộn sẽ ghi đè hoặc chèn thêm ảnh cũ vào danh sách, đồng thời khối `finally` cũ có thể tắt cờ `illustrationIsProcessing = false` của tác vụ mới.
- **Giải pháp đã triển khai**:
  - Cơ chế **Generation Token**: Bổ sung `illustrationGeneration` tăng dần mỗi khi gọi `handleIllustrationFiles()`, `removeIllustrationFile()`, hoặc `clearIllustrationFiles()`.
  - Sử dụng danh sách làm việc tạm (`workingList`) sao chép từ danh sách hiện tại. Mọi thao tác push ảnh diễn ra trên `workingList`.
  - Sau mỗi thao tác `await` (`arrayBuffer`, `loadAsync`, `async('blob')`, `renderPdfPageToBlob`), kiểm tra `if (this.illustrationGeneration !== currentGen) return;`.
  - Chỉ cập nhật `this.illustrationFiles = workingList` và tắt cờ `this.illustrationIsProcessing = false` khi token của tác vụ còn hiệu lực.
- **Kiểm thử**: Unit test `should discard results of slower illustration import if user initiates a new import` trong `tests/epub-packer-lifecycle.test.ts`.

---

### [ĐÃ XONG] P2 — Khử hoàn toàn race condition khi đổi ảnh bìa liên tục

- **Vị trí**: `src/lib/epub-packer/state/epub-images-state.svelte.ts`
- **Vấn đề trước đây**: `handleCoverFile()` có các thao tác bất đồng bộ (FileReader, đọc PDF, Image.onload). Nếu người dùng chọn ảnh A rồi chọn ảnh B, callback của ảnh A xử lý chậm có thể ghi đè `coverOriginalUrl` của ảnh B.
- **Giải pháp đã triển khai**:
  - Cơ chế **Cover Generation Token**: Bổ sung `coverGeneration` tăng dần mỗi khi gọi `handleCoverFile()` hoặc `removeCoverFile()`.
  - Đặt chốt kiểm tra `if (this.coverGeneration !== currentGen) return;` bên trong callback của FileReader, PDF render và Image.onload trước khi gán `this.coverOriginalUrl`.
  - Đảm bảo chỉ có file ảnh bìa mới nhất được áp dụng, các tác vụ cũ bị hủy bỏ an toàn.
- **Kiểm thử**: Unit test `should discard slower cover file result if a newer cover file is selected` trong `tests/epub-packer-lifecycle.test.ts`.

---

### [ĐÃ XONG] P2 — Kiểm chứng cơ chế hủy thực sự khi JSZip đang nén

- **Vị trí**: `src/lib/epub-packer/builders/zip-writer.ts`, `tests/epub-packer-lifecycle.test.ts`
- **Vấn đề trước đây**: JSZip không có API AbortSignal chính thức, cần chứng minh việc truyền signal và ném `AbortError` qua callback tiến độ của `generateAsync` thực sự hủy tiến trình và reject Promise.
- **Giải pháp đã triển khai**:
  - Trong `zip-writer.ts`, hook `onUpdate` của `generateAsync({ ... }, (metadata) => { if (signal?.aborted) throw new DOMException('Packing aborted', 'AbortError'); })`.
  - Bổ sung unit test mô phỏng thực tế: Spying vào `JSZip.prototype.generateAsync`, kích hoạt callback `metadata` với tiến độ, gọi `controller.abort()` giữa chừng, và kiểm chứng Promise của `buildEpubBlob` bị reject chính xác với lỗi `AbortError`.
- **Kiểm thử**: Unit test `should abort generateAsync mid-compression when signal is aborted during progress callback` trong `tests/epub-packer-lifecycle.test.ts`.

---

## 2. Ghi chú kiến trúc về đọc ZIP

- Hiện tại hệ thống sử dụng cơ chế bảo vệ đa tầng:
  1. **Pre-check**: Đọc thuộc tính nội bộ `_data.uncompressedSize` của JSZip entry trước khi gọi `async()` để loại bỏ zip bomb và file quá khổ ngay từ đầu.
  2. **Post-check / Fallback**: Nếu `uncompressedSize` không khả dụng, hệ thống tiến hành giải nén có kiểm soát và kiểm tra kích thước Blob thực tế trước khi đưa vào bộ nhớ chính.
  3. **Hạn ngạch số lượng entries**: Giới hạn tối đa 500 ảnh / 2000 files Markdown để ngăn chặn DoS cấu trúc thư mục.
- Nếu sau này nâng cấp thư viện ZIP (ví dụ sang `fflate`), cấu trúc kiểm soát đa tầng trên vẫn được kế thừa nguyên vẹn.
