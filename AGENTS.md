# Mẹo Chụp Ảnh Yedas — Ghi chú cho Agent

Trang blog tĩnh (Jekyll + theme Beautiful Jekyll), host trên GitHub Pages,
build qua GitHub Actions — chia sẻ mẹo chụp ảnh đơn giản bằng điện thoại
cho người mới bắt đầu. Xem `README.md` để biết cách chạy thử/đăng bài mới.
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
- CSS tuỳ biến: `assets/css/custom-styles.css` (giao diện "Liquid Glass" —
  kính trong suốt, highlight bóng, khối màu nền mờ phía sau để kính khúc xạ)
  — copy nguyên từ `inspiring-stories`, dùng chung được cho mọi theme nội
  dung vì không gắn cứng chữ/màu theo chủ đề cụ thể.
- JS tuỳ biến: `assets/js/custom-animations.js` (hero ảnh ngẫu nhiên + Ken
  Burns 1 lần, fade-in khi cuộn, khối màu nền "settle" khi tải trang — tất cả
  animation đều chạy 1 lần, không loop) — cũng copy nguyên, generic.
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
- Ảnh demo (`hero-*.jpg`, `cover-*.jpg`) lấy từ Unsplash (ảnh thật, miễn phí
  bản quyền) qua `images.unsplash.com/photo-<id>?w=1200&q=70`, không phải
  ảnh minh hoạ/placeholder giả.
