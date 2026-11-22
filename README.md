# Yedas

Blog cá nhân đa chủ đề (mẹo chụp ảnh, thể thao, du lịch/trải nghiệm) dùng
theme **[Beautiful Jekyll](https://beautifuljekyll.com)** (Jekyll), build và
host hoàn toàn miễn phí bằng **GitHub Pages**. Không cần chạy server/backend.
Mỗi bài viết là một thư mục trong `posts/YYYY/MM/DD/<slug>/` chứa file
`index.md` kèm ảnh của bài đó, chủ đề được phân loại bằng `tags` trong
front matter (xem tất cả ở trang `/tags`).

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

## 3. Đăng bài mới — cách dễ nhất, không cần máy tính

Vào GitHub (web hoặc app điện thoại) → mở repo → vào thư mục `posts/` →
**Add file → Create new file**.

- Mỗi bài là **một thư mục** theo ngày đăng: `posts/YYYY/MM/DD/<slug>/index.md`
  (ví dụ: `posts/2027/03/01/meo-chup-do-an/index.md`). Gõ đường dẫn trên vào
  ô tên file, GitHub tự tạo các thư mục cha.
- Ảnh của bài (`cover.jpg`, `photo-2.jpg`...) upload vào **đúng thư mục đó**,
  không để chung trong `assets/img/`.
- Nội dung file `index.md`:

```markdown
---
layout: post
date: "2027-03-01 00:00:00 +0700"
title: "Tên bài của bạn"
subtitle: "Một câu mô tả ngắn, tuỳ chọn"
cover-img: "/posts/2027/03/01/meo-chup-do-an/cover.jpg"
thumbnail-img: "/posts/2027/03/01/meo-chup-do-an/cover.jpg"
category: "Chụp ảnh"                 # chuyên mục chính: Chụp ảnh / Thể thao / Du lịch
tags: [tag1, tag2]
---

Nội dung bài viết bằng Markdown bình thường ở đây.

Có thể chèn **chữ đậm**, *chữ nghiêng*, ảnh, link, v.v.
```

Bài **du lịch** khai báo thêm toạ độ để hiện chấm trên bản đồ `/map`:

```yaml
geo: [37.5796, 126.9770]        # [vĩ độ, kinh độ]
place_name: "Seoul, Hàn Quốc"
place_country: "Korea"          # PHẢI là 1 trong: Vietnam / China / Japan /
                                # Taiwan / Thailand / Korea / Indonesia /
                                # Malaysia / Philippines / Laos / Cambodia /
                                # India / Australia / France / Italy / Spain /
                                # United Kingdom / Germany / Netherlands /
                                # Switzerland / Greece / United States /
                                # Canada / Brazil / Argentina / Peru / Chile /
                                # Colombia / Morocco / Egypt / Tunisia /
                                # Algeria / Ethiopia / Kenya / Tanzania /
                                # Uganda / Rwanda / Senegal / Ghana / Nigeria /
                                # Namibia / Zimbabwe / South Africa / Mauritius
                                # (khớp nút lọc trên bản đồ — quốc gia mới cần
                                # thêm nút + khung nhìn trong
                                # _includes/athlete-map.html)
place_region: "Đông Á"
```

Tuỳ chọn thêm: `travel_photos` (danh sách `[tên-file.jpg, "chú thích"]`) và
`travel_videos` (danh sách `[youtube-id, "tiêu đề", "kênh"]`) — xem bài mẫu
trong `posts/2027/01/28/cap-nhi-tan/`. Ảnh chèn trong nội dung dùng
`{{ site.baseurl }}` hoặc `relative_url`, không viết `/posts/...` trực tiếp.

Bài profile vận động viên (series "VĐV cầu lông") khai báo thêm khối
`athlete` để hiện khung hồ sơ đầu bài + card đẹp ở trang `/series/`:

```yaml
category: "Thể thao"
series: "VĐV cầu lông"
athlete:
  name: "Viktor Axelsen"
  nickname: "Cỗ máy Đan Mạch"
  avatar: /posts/.../avatar.jpg
  country: "Đan Mạch"
  hometown: "Odense, Đan Mạch"
  born: "04/01/1994"
  height: "1m94"
  hand: "Phải"
  event: "Đơn nam"
  debut: "2010"
  racket: "Yonex Astrox 100ZZ"
  current_rank: "Số 2"
  highest_rank: "Số 1 thế giới"
  skills: ["Smash từ độ cao", "Bỏ nhỏ chéo lưới", "Phủ cầu sát lưới"]
```

- Bấm **Commit changes** → xong! Sau ~1-2 phút (Actions build) bài sẽ tự
  xuất hiện trên trang.

### Thêm ảnh cho bài viết

Upload ảnh vào **thư mục của bài** `posts/YYYY/MM/DD/<slug>/` (trên GitHub:
vào thư mục đó → **Add file → Upload files**), rồi dùng đường dẫn
`/posts/YYYY/MM/DD/<slug>/ten-anh.jpg` trong `cover-img`/`thumbnail-img`/
`travel_photos`. Ảnh chèn giữa nội dung dùng `{{ site.baseurl }}` hoặc
`relative_url` để chạy đúng cả trên GitHub Pages (`/tnclub-yedas`).

Ưu tiên ảnh đã resize gọn (không cần quá 1600px chiều ngang) để trang tải
nhanh, nhất là khi xem trên điện thoại.

## 4. Đăng bài từ máy (nếu muốn viết bằng app soạn thảo quen thuộc)

```bash
git add posts/2027/03/01/meo-chup-do-an/
git commit -m "Thêm bài: Chụp đồ ăn ngon hơn"
git push
```

## 5. Chạy thử trên máy trước khi đăng (tuỳ chọn)

```bash
./serve.sh
```

Mở `http://localhost:4010` để xem trước. Nhấn `Ctrl+C` trong terminal để tắt
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
- `about-me.md`: nội dung trang "Giới thiệu".
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
posts/            Nơi chứa bài viết — mỗi bài là 1 thư mục YYYY/MM/DD/<slug>/
                  gồm index.md + ảnh của bài đó
about-me.md       Trang giới thiệu
assets/img/       Ảnh dùng chung cho site (hero, icon, logo) — ảnh của bài
                  viết để trong thư mục bài, không để đây
.github/workflows/  Workflow build & deploy tự động lên GitHub Pages
```
