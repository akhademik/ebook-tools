Điểm 4: Xử lý một nửa. Đã thêm .prettierrc (chuẩn hóa dùng tab, single quote, no trailing comma) — có định hướng rõ ràng. Nhưng:

    Prettier chưa được thêm vào devDependencies, chưa có script format/format:check, và CI cũng chưa enforce nó.
    Code hiện tại vẫn còn 34 file tab / 19 file space — file config có rồi nhưng chưa chạy prettier --write . lên toàn bộ codebase để áp dụng thật.


    Xử lý nặng chạy main thread	🔴 Chưa xử lý	🔴 Vẫn chưa xử lý — chỉ còn duy nhất 1 file worker (image-bg-remove.worker.ts)

File lớn (epub-validator.ts, epub-editor.ts, epub-cleaner.ts ~650-700 dòng) Chưa tách 🟡 Vẫn chưa tách — đây là 3 file còn lại to nhất, cùng nhóm epub-editor, chưa được modularize như epub-packer đã làm

Worker offloading: vẫn là điểm rủi ro UX lớn nhất còn sót — với giới hạn PDF giờ đã nâng lên 1GB, xử lý PDF/EPUB lớn trên main thread càng dễ làm UI đơ. Đáng ưu tiên tiếp theo.
