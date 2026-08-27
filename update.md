🟡 Điểm cần làm rõ: PDF splitter CHƯA thực sự offload

Tôi xem trực tiếp diff của commit và code hiện tại: không có new Worker() hay file .worker.ts nào cho PDF splitter cả. Thay đổi thực tế chỉ là:

Đổi type signature của applyGrayscale/cropCanvas để generic hỗ trợ OffscreenCanvas (chuẩn bị hạ tầng, chưa dùng thật)
loadPdfPreview và processPdfToJpg vẫn dùng document.createElement('canvas') — canvas thường trên main thread
Cái tên runWorker(workerIndex) trong code là hàm async chạy song song bằng Promise.all, không phải Web Worker thật — vẫn cùng 1 thread, chỉ là concurrency dạng cooperative multitasking (có await setTimeout(0) để nhường event loop mỗi trang, giúp UI không đơ hoàn toàn nhưng CPU vẫn tốn trên main thread)

Nói cách khác: commit message "pdf splitter canvas to background workers" hơi lạc quan hơn thực tế code — mới dừng ở mức chuẩn bị type, chưa thực sự đưa việc render canvas ra khỏi main thread. Đây vẫn là module tốn CPU nhất (render từng trang PDF ở scale 2.0 + grayscale pixel-by-pixel) và với giới hạn 1GB, vẫn là nơi dễ thấy UI giật nhất trong toàn app.

Việc còn lại nếu muốn hoàn thiện nốt

Để PDF splitter thực sự offload, cần thêm bước tương tự 2 worker kia: tạo pdf-render.worker.ts, dùng OffscreenCanvas thật bên trong worker (pdf.js hỗ trợ render vào OffscreenCanvas context), rồi transfer ImageBitmap/Blob kết quả về main thread. Đây là việc phức tạp hơn 2 worker trước một chút vì phải đưa cả instance pdfjsLib.getDocument() chạy trong worker context (cần đảm bảo workerSrc của pdf.js cũng load được từ trong worker lồng worker), nhưng khung sẵn có (OffscreenCanvas type đã generic hóa) cho thấy hướng đi đã đúng, chỉ cần hoàn tất nốt bước cuối.

11. Nhưng có một vấn đề mới: Worker proliferation

Đây là thứ mình bắt đầu quan tâm.

Hiện bạn có:

Worker #1 → image ML
Worker #2 → duplicate detection
Worker #3 → TXT parser
Worker #4 → PDF

Không có gì sai.

Nhưng nếu mỗi module tự quản lý:

let workerInstance
let pendingJobs
let jobId

thì về lâu dài sẽ duplicate infrastructure.

Bạn có thể cân nhắc một abstraction nhẹ:

src/lib/workers/
├── worker-client.ts
├── worker-pool.ts
└── types.ts

Ví dụ concept:

const client = createWorkerClient(
() => new Worker(...)
);

const result = await client.run(payload);

Nhưng chưa cần làm ngay.

Nếu mỗi worker hiện tại chỉ 50–100 dòng thì abstraction chung có thể còn làm code khó đọc hơn.

12. 🔴 Thứ mình muốn bạn test tiếp: Worker cancellation

Đây là missing piece mình thấy quan trọng.

Ví dụ user đang:

TXT 50 MB
↓
parse worker
↓
30%

rồi bấm:

Cancel

Worker có bị terminate không?

Nên có:

AbortController

hoặc worker protocol:

START
PROGRESS
CANCEL
DONE
ERROR

Tương tự PDF:

PDF 300 pages
↓
page 100
↓
Cancel

Nếu hiện tại cancellation chưa tốt thì đây là P1.
