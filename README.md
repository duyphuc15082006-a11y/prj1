# Vocab Levels (A1–C1)

Ứng dụng học từ vựng theo level với đăng nhập, đánh dấu đã học, quiz, leaderboard và admin quản trị.

## Yêu cầu
- Node.js >= 18
- Docker Desktop

## Cài đặt & chạy
```bash
cp .env.example .env
# sửa JWT_SECRET trong .env nếu cần

docker-compose up -d
npm install
npm run db:migrate
npm run db:seed
npm run dev
```
Mở: http://localhost:3000

## Tài khoản admin mặc định
- Username: `admin`
- Password: `admin123`

> Nên đổi mật khẩu sau khi login.

## Chức năng chính
- User: học từ (từng từ một, theo alphabet), đánh dấu đã học, làm quiz 3 kiểu, xem leaderboard
- Admin: CRUD từ vựng, khoá/mở khoá/xoá user, import hàng loạt

## Quiz (3 kiểu)
- `mcq`: chọn 1/4 đáp án
- `en_vi`: EN → VI (điền nghĩa)
- `vi_en`: VI → EN (điền từ)

## Import hàng loạt
### Cách 1: UI Admin
Vào `http://localhost:3000/admin.html` → mục **Nhập hàng loạt** → dán dữ liệu theo format:
```
word | meaning | example | level
```
Nếu chọn **default level**, bạn có thể bỏ cột level.

### Cách 2: CLI (CSV)
CSV cần header (tiếng Anh hoặc tiếng Việt đều được):
- `word,meaning,example,level`
- hoặc `level,từ,nghĩa tiếng việt,ví dụ ngắn,ví dụ ngắn 2`

Chạy:
```bash
npm run import:csv -- /đường/dẫn/tới/file.csv
```

## API chính
- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Vocab: `GET /api/vocab?level=A1`
- Progress: `PUT /api/progress/:vocabId`
- Quiz: `POST /api/quiz/start`, `POST /api/quiz/submit`
- Leaderboard: `GET /api/leaderboard?level=A1`
- Admin: `POST /api/admin/vocab`, `PUT /api/admin/vocab/:id`, `DELETE /api/admin/vocab/:id`
- Admin users: `GET /api/admin/users`, `PATCH /api/admin/users/:id/lock`, `DELETE /api/admin/users/:id`
- Bulk vocab: `POST /api/admin/vocab/bulk`

