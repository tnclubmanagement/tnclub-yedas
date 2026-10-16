# Mẹo Chụp Ảnh Yedas

Trang blog tĩnh dùng theme **[Beautiful Jekyll](https://beautifuljekyll.com)**
(Jekyll), build và host hoàn toàn miễn phí bằng **GitHub Pages**. Không cần
chạy server/backend. Mỗi mẹo chụp ảnh là một file Markdown, có thể kèm ảnh
lớn kiểu tạp chí.

## 1. Đưa lên GitHub lần đầu

```bash
cd /Users/Tri.Ngo/training/tnclub-yedas
git add .
git commit -m "Khởi tạo site Beautiful Jekyll"
git push -u origin main
```

(Repo đã được tạo sẵn trên GitHub và remote `origin` đã trỏ tới
`git@github.com:tnclubmanagement/tnclub-yedas.git` qua SSH.)

## 2. Bật GitHub Pages (build bằng GitHub Actions)

File build đã có sẵn ở `.github/workflows/pages-deploy.yml`, không cần sửa gì.

Vào repo trên GitHub → **Settings** → **Pages** → ở "Build and deployment",
chọn **Source: GitHub Actions** (không chọn "Deploy from a branch").

Sau khi push code, vào tab **Actions** của repo để xem quá trình build
(~1-2 phút). Xong, trang sẽ có ở:
`https://tnclubmanagement.github.io/tnclub-yedas/`

## 3. Đăng mẹo mới — cách dễ nhất, không cần máy tính

Vào GitHub (web hoặc app điện thoại) → mở repo → vào thư mục `_posts/` →
**Add file → Create new file**.

- Tên file **phải** theo định dạng: `YYYY-MM-DD-ten-bai-viet.md`
  (ví dụ: `2026-10-20-meo-chup-do-an.md`)
- Nội dung file:

```markdown
---
title: "Tên mẹo của bạn"
subtitle: "Một câu mô tả ngắn, tuỳ chọn"
cover-img: /assets/img/ten-anh.jpg   # ảnh lớn ở đầu bài, tuỳ chọn
tags: [tag1, tag2]
---

Nội dung mẹo viết bằng Markdown bình thường ở đây.

Có thể chèn **chữ đậm**, *chữ nghiêng*, ảnh, link, v.v.
```

- Bấm **Commit changes** → xong! Sau ~1-2 phút (Actions build) bài sẽ tự
  xuất hiện trên trang.

### Thêm ảnh cho bài viết

Upload ảnh vào thư mục `assets/img/` (trên GitHub: vào thư mục đó → **Add
file → Upload files**), rồi dùng đường dẫn `/assets/img/ten-anh.jpg` trong
`cover-img` hoặc chèn vào nội dung bài bằng Markdown: `![mô tả](/assets/img/ten-anh.jpg)`.

Ưu tiên ảnh đã resize gọn (không cần quá 1600px chiều ngang) để trang tải
nhanh, nhất là khi xem trên điện thoại.

## 4. Đăng bài từ máy (nếu muốn viết bằng app soạn thảo quen thuộc)

```bash
git add _posts/2026-10-20-meo-chup-do-an.md assets/img/ten-anh.jpg
git commit -m "Thêm mẹo: Chụp đồ ăn ngon hơn"
git push
```

## 5. Chạy thử trên máy trước khi đăng (tuỳ chọn)

```bash
./serve.sh
```

Mở `http://localhost:4000` để xem trước. Nhấn `Ctrl+C` trong terminal để tắt
server. Script này tự trỏ đúng phiên bản Ruby và cài gem nếu thiếu, bạn không
cần tự chạy `bundle install`/`bundle exec jekyll serve` thủ công.

Lưu ý: nếu bạn sửa `_config.yml`, phải tắt (`Ctrl+C`) và chạy lại `./serve.sh`
thì thay đổi mới áp dụng (Jekyll chỉ đọc file này lúc khởi động).

## 6. Bật bình luận bằng Facebook

Theme đã tích hợp sẵn Facebook Comments, chỉ cần lấy 1 **Facebook App ID**
miễn phí (vài bước bấm chuột, không cần viết code):

1. Vào https://developers.facebook.com/apps → **Create App** → chọn loại
   "Other" / "Consumer" (không cần use-case cụ thể) → đặt tên app bất kỳ
   (ví dụ "Yedas Photo Tips Comments").
2. Sau khi tạo xong, vào **App Settings → Basic**, copy **App ID**.
3. Dán App ID vào `_config.yml`, dòng `fb_comment_id: ""` → `fb_comment_id: "123456789..."`.
4. Commit, push — bình luận sẽ xuất hiện ở cuối mỗi bài khi trang đã deploy
   (không hoạt động đầy đủ trên `localhost`, chỉ hoạt động trên domain thật).

Muốn tắt comment ở một bài cụ thể: thêm `comments: false` vào phần front
matter (đầu file) của bài đó.

## 7. Tuỳ biến thêm

- `_config.yml`: đổi tên trang (`title`), tác giả (`author`), màu sắc
  (`page-col`, `link-col`, v.v.), link Facebook ở footer
  (`social-network-links.facebook`), avatar (`avatar: "/assets/img/..."`).
- `aboutme.md`: nội dung trang "Giới thiệu".
- `assets/img/icons/logo.svg`: logo/favicon — sửa file SVG rồi chạy lại
  lệnh rasterize (xem phần dưới) để cập nhật `favicon-16.png`,
  `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`.
- Theme Beautiful Jekyll có sẵn: tìm kiếm, tag, chia sẻ lên mạng xã hội,
  ảnh cover lớn cho từng bài — không cần cấu hình thêm.

### Tạo lại favicon từ logo.svg (nếu sửa logo)

```bash
cd assets/img/icons
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless --disable-gpu --screenshot=tmp-512.png --window-size=512,512 --default-background-color=00000000 "file://$(pwd)/logo.svg"
sips -z 180 180 tmp-512.png --out apple-touch-icon.png
sips -z 32 32 tmp-512.png --out favicon-32.png
sips -z 16 16 tmp-512.png --out favicon-16.png
cp tmp-512.png icon-512.png
rm tmp-512.png
```

## Cấu trúc project

```
_config.yml       Cấu hình chung của site (tên, màu sắc, comment, v.v.)
_posts/           Nơi chứa mẹo chụp ảnh (mỗi file .md = 1 bài)
aboutme.md        Trang giới thiệu
assets/img/       Ảnh dùng trong bài viết / cover image / icon
.github/workflows/  Workflow build & deploy tự động lên GitHub Pages
```
