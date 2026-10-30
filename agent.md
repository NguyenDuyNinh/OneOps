# Hướng dẫn giao module cho AI

Quy tắc kiến trúc, chuẩn code và UI nằm trong [AGENTS.md](AGENTS.md). Đọc file đó trước khi sửa mã. `AGENTS.md` được dùng để các công cụ AI hỗ trợ tên file này tự nhận hướng dẫn; với công cụ khác, đính kèm AGENTS.md vào yêu cầu. File này chỉ là điểm dẫn, không sao chép quy tắc.

Dùng mẫu sau khi giao việc:

```text
Đọc AGENTS.md và hướng dẫn trong thư mục con trước khi làm.
Chức năng được giao: hr-management/organization/departments-teams.
Phạm vi: [FE / BE / cả hai].
Yêu cầu và tiêu chí hoàn thành: [mô tả cụ thể].
Chỉ sửa bên trong feature này và các điểm tích hợp tối thiểu cần thiết.
Giữ nguyên module khác; không đổi cấu trúc hoặc sửa token/style toàn cục.
Route nằm trực tiếp trong apps/web/src/app/<main>/..., không tạo lớp bọc admin.
Nghiệp vụ nằm trong apps/web/src/features/<feature-path> và API tương ứng.
UI phải theo design-system và tokens hiện có, component được sở hữu cục bộ.
Chạy các kiểm tra áp dụng; báo rõ file ngoài feature, migration và kết quả test.
```

Thay đường dẫn ví dụ bằng chức năng thật trong `feature-structure.json`. Hướng dẫn này không tự giao triển khai `departments-teams` hay bất kỳ phần đang trống nào. Xem [README.md](README.md) để cài đặt và chạy dự án.
