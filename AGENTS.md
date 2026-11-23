# Yedas — Ghi chú cho Agent

Trang blog tĩnh (Jekyll + theme Beautiful Jekyll), host trên GitHub Pages,
build qua GitHub Actions — blog đa chủ đề: mẹo chụp ảnh bằng điện thoại,
thể thao, du lịch/trải nghiệm. Chủ đề phân loại bằng **tags** trong front
matter (trang `/tags` tự gom, không cần tạo page riêng cho chủ đề mới).
Xem `README.md` để biết cách chạy thử/đăng bài mới.
Project này dựng theo đúng khung của `inspiring-stories` (cùng tác giả) —
2 project dùng chung 1 bộ quy ước bên dưới, chỉ khác nội dung/chủ đề.

## Tiêu chuẩn tối thiểu khi làm 1 website

Mỗi khi được yêu cầu tạo hoặc hoàn thiện một website, LUÔN đảm bảo có đủ các
mục dưới đây trước khi coi là "xong" (trừ khi người dùng nói rõ bỏ qua):

- [ ] **Favicon** — icon hiển thị trên tab trình duyệt (ít nhất 16x16, 32x32,
      và `apple-touch-icon` 180x180 cho iOS). Không để favicon mặc định/trống.
- [ ] **Logo/thương hiệu** — tên site + icon/logo nhất quán ở navbar.
- [ ] **Slogan/tagline** — câu mô tả ngắn thể hiện tinh thần trang (ở hero
      và/hoặc footer).
- [ ] **Nav về trang chủ** — luôn có cách quay về `/` rõ ràng (logo bấm vào
      được, và/hoặc icon/link "Trang chủ").
- [ ] **Responsive** — kiểm tra thực tế ở mobile width (không chỉ desktop),
      đặc biệt là menu mobile (hamburger) mở ra không bị vỡ layout/padding.
      Trang này ưu tiên trải nghiệm mobile vì người đọc chủ yếu xem trên
      điện thoại.
- [ ] **Meta cơ bản cho SEO/chia sẻ** — `<title>`, meta description, Open
      Graph (og:title/description/image) — theme Beautiful Jekyll đã tự làm
      phần này dựa trên `title`/`subtitle`/`cover-img` của từng trang.
- [ ] **Ảnh có kích thước hợp lý** — không nhúng ảnh gốc quá nặng; ưu tiên
      ảnh đã resize (vd `?w=1200` khi lấy từ Unsplash) để tải nhanh.
- [ ] **Trạng thái rỗng/demo hợp lý** — nếu site chưa có nội dung thật, luôn
      có ít nhất 1-2 bài demo + ảnh demo để người dùng thấy ngay hình dung
      thực tế, không để trống trơn.
- [ ] **Giải thích rõ cách thêm nội dung mới** — ghi trong README cách đăng
      bài mới (ưu tiên cách đăng THẲNG qua GitHub web/app điện thoại, không
      cần máy tính/terminal — đây là ưu tiên chính của chủ repo này: dễ cập
      nhật content).

## Quy ước riêng của project này

- Ruby: dùng Ruby 3.3 riêng qua `GEM_HOME=~/.gem-beautiful-jekyll`, KHÔNG
  dùng Ruby hệ thống (quá cũ) hay Ruby 4.0 của Homebrew (một số gem Jekyll
  cũ chưa tương thích). Chạy `./serve.sh` để tự xử lý việc này.
- Sửa `_config.yml` xong phải tắt (`Ctrl+C`) và chạy lại server — Jekyll chỉ
  đọc file này lúc khởi động, không tự reload.
- CSS tuỳ biến: `assets/css/custom-styles.css` — giao diện **"Apple-style"**
  (đổi từ "Liquid Glass" ban đầu theo yêu cầu người dùng): nền trắng/xám
  nhạt tối giản, chữ hệ thống (`-apple-system`...) to đậm cho tiêu đề,
  không backdrop-filter/blob màu/card kính. Nav là thanh mỏng mờ nhẹ full
  width (không floating pill), lưới bài viết là CSS Grid đều cột (không
  masonry lệch), footer nền xám nhạt kiểu apple.com.
  - Theme Beautiful Jekyll gán cứng font `Lora`/`Open Sans` cho rất nhiều
    selector riêng lẻ (`.post-meta`, `.blog-tags`, navbar, footer,
    pagination...) — thay vì override từng chỗ, file này dùng 1 rule
    universal `*:not(.fa):not([class*="fa-"]) { font-family: ... !important }`
    để chắc chắn MỌI nơi (kể cả nơi quên override) đều ra đúng font, trừ
    icon Font Awesome (loại trừ bằng `:not()` để icon không bị vỡ).
  - `_layouts/base.html` override lại front matter của theme để bỏ 2 dòng
    tải Google Fonts (Lora, Open Sans) — không cần nữa vì dùng font hệ
    thống, đỡ tải thêm request.
- CSS bản đồ tách riêng trong `assets/css/site-map.css`, chỉ tải qua
  `_includes/site-map.html` khi trang có map. Style bài viết như `.photo-grid`
  và `.athlete-card-skills` vẫn ở `custom-styles.css`.
- Quickview map: front matter tuỳ chọn `place_highlights` (tối đa 3 mục),
  `place_best_time`, `place_food`, `place_transport`; phần VĐV dùng
  `athlete.skills`, `athlete.achievement`, `height`, `hand`, `debut`.
  Mọi bài có thể thêm `map_ranking`, `map_score` (vd `"8.5/10"`),
  `map_rating_updated` (chuỗi ngày do người viết nhập). Đây là đánh giá thủ
  công, không tự tính; giá trị rỗng tự ẩn. Bài Đài Bắc có sẵn ô trống để nhập.
- Hai điểm quickview dùng `map_content_score` (chất lượng bài viết) và
  `map_destination_score` (độ hấp dẫn điểm đến), nhập số 0–10, không kèm `/10`.
  `map_content_note`, `map_destination_note` ghi lý do; ngày dùng chung
  `map_rating_updated`. Hiển thị một dòng icon + số + thanh màu: đỏ <5,
  vàng 5–<8, xanh ≥8; lý do/ngày nằm trong tooltip, chú giải ở icon thông tin
  cạnh tiêu đề bản đồ. Địa điểm chưa có điểm hiện dấu gạch với tooltip
  “Chưa đánh giá”; VĐV không có điểm hấp dẫn điểm đến. Trường `map_score`
  cũ chỉ hiển thị khi chưa có hai điểm mới.
- Điểm các bài Đông Nam Á là đánh giá biên tập sơ bộ, không phải điểm du khách
  hay xếp hạng chính thức. Chất lượng xét tính hữu ích, bố cục, tư liệu và
  nguồn; điểm đến xét trải nghiệm cùng hạn chế nêu trong bài. Đây không phải
  kết quả kiểm chứng thực địa hoặc xác minh toàn bộ thông tin hiện hành.
- JS tuỳ biến: `assets/js/custom-animations.js` (hero ảnh ngẫu nhiên + Ken
  Burns 1 lần, fade-in khi cuộn khi tải trang — animation chạy 1 lần, không
  loop). Bản gốc "Liquid Glass" còn có khối màu nền "blob" + masonry lệch
  cột — đã bỏ cả 2 khi đổi sang Apple-style vì không hợp phong cách tối
  giản.
- Theme Beautiful Jekyll dùng 2 class ảnh: `.post-image-normal` (ảnh lớn đầu
  bài) và `.post-image-small` (ảnh nhỏ 100x100 theme tự hiện khi màn hình
  <500px) — ta đã ẩn `.post-image-small` và ép `.post-image-normal` luôn hiện
  để tránh vỡ layout mobile.
- Khi override file của theme (vd `_includes/nav.html`), copy nguyên bản gốc
  trong gem rồi chỉnh, không viết lại từ đầu — tránh mất tính năng có sẵn.
- Logo (`assets/img/icons/logo.svg`): camera cách điệu đơn giản, nền gradient
  cam-hồng-xanh. Favicon sinh ra từ SVG này bằng headless Chrome + `sips`
  (xem lệnh trong README mục "Tạo lại favicon từ logo.svg") — macOS `sips`
  không rasterize SVG trực tiếp được nên phải qua bước chụp màn hình headless
  trước.
- Dark mode: `data-theme` trên `<html>` (light/dark). `_includes/theme-init.html`
  đặt sớm trong `<head>` (localStorage `yedas-theme`, fallback
  `prefers-color-scheme`); nút toggle ở `_includes/nav.html` xử lý bởi
  `assets/js/theme-toggle.js`. Trong `custom-styles.css`, mọi màu theo theme
  đều đi qua biến (`--ink`/`--muted`/`--bg-white` = nền trang, `--surface` =
  nền card, `--bg-light` = panel/footer, `--hairline`, `--nav-bg`) — khi thêm
  style mới dùng biến này, và nếu cần màu cứng riêng cho dark thì thêm vào
  block override cuối file.
- Ảnh demo (`hero-*.jpg`, `cover-*.jpg`) lấy từ Unsplash (ảnh thật, miễn phí
  bản quyền) qua `images.unsplash.com/photo-<id>?w=1200&q=70`, không phải
  ảnh minh hoạ/placeholder giả.
- Ảnh nội bộ trong nội dung bài (HTML và Markdown) phải dùng `{{ site.baseurl }}`
  hoặc bộ lọc `relative_url`, không viết trực tiếp `src="/posts/..."` hay
  `![ảnh](/posts/...)`: GitHub Pages chạy dưới `/tnclub-yedas`, local dùng
  baseurl rỗng. Đường dẫn trong front matter giữ nguyên, template thêm baseurl.
  Khi sửa đường dẫn ảnh, build cả `_config.yml` và `_config.yml,_config_dev.yml`,
  kiểm tra URL ảnh đã render và file ảnh tương ứng trong thư mục build.
