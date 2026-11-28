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
      phần này dựa trên `title`/`subtitle`/`banner-img` của từng trang.
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
- CSS trang chủ tách riêng trong `assets/css/home.css` (hero, intro,
  bài tiêu biểu, info cards, dots và responsive), chỉ tải qua
  `_includes/head.html` khi `page.url` là `/` hoặc `/index.html`, cả VI/EN.
  Các class `home-*` của bộ lọc/danh sách bài vẫn dùng chung ở
  `custom-styles.css` vì trang `/posts/` cũng sử dụng.
  Trang `/posts/` hỗ trợ Grid / Masonry / List, không áp dụng cho trang chủ.
  Masonry dùng CSS Grid row spans, đo chiều cao article bằng ResizeObserver
  trong `custom-animations.js`; mobile ≤640px trở về một cột. Chế độ lưu ở
  `yedas-home-display-mode`, tham số URL `view` được ưu tiên hơn lựa chọn lưu.
- Các khối CSS lớn tải có điều kiện qua `_includes/head.html`:
  - `assets/css/header.css`: ảnh bìa/header và banner controls, khi có
    `page.banner-img` hoặc `page.banner-nav`.
  - `assets/css/post.css`: chế độ rút gọn, gallery/lightbox, before/after,
    typography, ảnh, video và `.photo-grid`, khi `page.layout == 'post'`.
  - `assets/css/tags-series.css`: toolbar, tag cloud, danh sách/grid và
    dark-mode tag, khi `page.url` là `/tags/` hoặc `/series/`.
  - `.tag-section-title` và `.tag-pill-count` vẫn ở CSS chung vì bản đồ
    cũng dùng; không chuyển chúng sang CSS chỉ tải ở tags/series.
- CSS bản đồ tách riêng trong `assets/css/site-map.css`, chỉ tải qua
  `_includes/site-map.html` khi trang có map. CSS hồ sơ VĐV (`.athlete-card-*`,
  `.athlete-index-*`, kỹ năng, responsive và animation) ở
  `assets/css/athlete-card.css`, chỉ tải qua `_includes/head.html` khi
  `page.athlete` có giá trị hoặc `page.url == '/series/'`.
- Bộ lọc ẩm thực trên bản đồ ưu tiên `place_region`; nếu thiếu thì lấy tag
  `Miền Bắc` / `Miền Trung` / `Miền Nam` (không phân biệt hoa thường).
  Khi thêm bài ẩm thực có `geo`, cần có tag miền hoặc `place_region` để lọc theo miền.
  `site-map.js` chuẩn hóa `Vietnam` / `Việt Nam` / `Viet Nam` về khóa `Vietnam`
  cho dữ liệu và lựa chọn đã lưu; nhãn hiển thị lấy từ `map.country_vietnam`.
- Dữ liệu ghim bản đồ: `_plugins/map_pins_index.rb` xuất raw front matter
  ra `/map-pins.bin` (mỗi ngôn ngữ 1 file như search-index), làm nhiễu
  XOR + base64 (`XOR_KEY` phải khớp giữa plugin và `map-pins.js`) — chỉ là
  obfuscation chống đọc trực tiếp, KHÔNG phải mã hóa an toàn. JS fetch qua
  `MapPins.load(pinsUrl, opts)` trong `assets/js/map-pins.js` (load trước
  `site-map.js`) rồi `MapPins.build` tạo `window.__athletePins`. Toàn bộ
  logic phân loại kind/topic, chuẩn hóa miền, fallback ảnh/tên nằm ở JS —
  không thêm `case`/`if` nghiệp vụ vào Liquid. `base`/`lang`/`defaultLang`/
  `pinsUrl`/`foodCategories` emit qua `__athleteMapConfig` trong
  `_includes/site-map.html`; mọi URL pin đi qua `rel()` trong map-pins.js —
  nó tự thêm prefix `en/` khi `lang != defaultLang` nên pin trang /en/ trỏ
  về bài /en/; `pinsUrl` kèm `?v={{ site.map_pins_digest }}` chống cache cũ;
  `pinAvatar` resolve trong plugin bằng `File.exist?` (ảnh posts/ không nằm
  trong `site.static_files`). Fetch lỗi hiện `.map-load-error` với chuỗi
  `map.load_failed_pins`. Test logic bằng `node --test _tests/map_pins_test.js`,
  test plugin `bundle exec ruby _tests/map_pins_index_test.rb`, test emit
  `_tests/site_map_images_test.rb`.
- Thời tiết quickview là module riêng: `assets/js/map-weather.js`
  (`window.MapWeather.create({ badge, fx, tx })` → `show(place)` / `clear()`,
  tải trước `site-map.js` trong `_includes/site-map.html`) và
  `assets/css/map-weather.css`. `site-map.js` chỉ gọi `show`/`clear`, không
  chứa logic thời tiết. Logic thuần (`kindFromCode`, `fxPlan`, `badgeIcon`)
  test bằng `node --test _tests/map_weather_test.js`.
- Thời tiết quickview (chỉ địa điểm): Open-Meteo `current` (kèm `is_day`),
  cache `yedas-map-weather-v3` 6 giờ dạng `{text, kind, wind, day}`. `kind`
  (clear/partly/cloudy/fog/drizzle/rain/snow/storm) chọn icon Font Awesome
  trong nhãn và hiệu ứng CSS `.athlete-qv-wx-fx[data-wx]` trên ảnh (mưa,
  tuyết, vệt nắng, sương qua pseudo-element) cùng hình minh hoạ `.wx-part`
  do `WX_PARTS` trong JS tạo: mặt trời (đêm đổi mặt trăng), mây trôi, mây đen
  khi mưa, sét; gió ≥ `WX_WINDY` (20 km/h) thêm lá bay (`fa-leaf`). Mặt trời
  và mây vẽ bằng CSS (người dùng chê icon mây Font Awesome xấu; mặt trời phải
  vàng tươi), mây chỉ trôi chậm một đoạn ngắn, không vụt ngang cả ảnh. Chạy 1
  lần khi mở, không loop; tắt khi `prefers-reduced-motion`. Giữ hình tránh
  nhãn (trái trên) và nút đóng (phải trên). Đổi cấu trúc cache thì tăng `-vN`.
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
  `prefers-color-scheme`); nút toggle ở `_includes/footer.html` xử lý bởi
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
- Đa ngôn ngữ (i18n): dùng gem `jekyll-polyglot` (vi mặc định, en ở `/en/`).
  Cấu hình ở `_config.yml` (`languages`, `default_lang`,
  `exclude_from_localization`). Quy ước:
  - Trang/bài KHÔNG khai báo `lang:` = bản tiếng Việt, được Polyglot nhân bản
    sang `/en/` (fallback — khách xem bản EN vẫn thấy nội dung tiếng Việt,
    bài viết kèm banner "chưa có bản dịch" từ `_includes/untranslated-note.html`,
    phát hiện qua `page.rendered_lang != site.active_lang`).
  - Muốn dịch một trang/bài: tạo file cùng đường dẫn tương đối (vd
    `posts/2026/11/04/foo/index.en.md` hoặc file riêng có cùng `permalink`)
    với front matter `lang: en`.
  - `page.url` trong cả bản EN vẫn là URL gốc (không có `/en`) — Polyglot chỉ
    thêm prefix khi ghi file VÀ tự rewrite `href="/..."` trong HTML đầu ra
    thành `/en/...`. Link quay về bản VI phải dùng `absolute_url` + đặt
    `hreflang="vi"` ngay TRƯỚC `href` (lookbehind của regex plugin), xem mẫu
    trong `_includes/lang-switcher.html`.
  - Chuỗi UI dùng chung ở `_data/strings.yml` (key theo ngôn ngữ `vi`/`en`;
    `nav` tra theo nhãn tiếng Việt gốc trong `navbar-links`). Trong template:
    `{% assign s = site.data.strings[site.active_lang] | default: site.data.strings.vi %}`
    rồi `{{ s.ui.<key> }}`. Lưu ý Liquid KHÔNG đọc được lookup lồng nhau kiểu
    `s.nav[link[0]]` — phải gán `link[0]` ra biến trước.
  - Ảnh trong `posts/` dùng đường dẫn tương đối theo URL bài nên PHẢI được
    nhân bản sang `/en/` — không thêm pattern posts vào
    `exclude_from_localization`.
  - `<html lang>` ở `_layouts/base.html` theo `site.active_lang`.
  - Chuỗi UI trong JS: include xuất `window.__mapStrings` / `__spinnerStrings`
    (jsonify từ `strings.yml` mục `map`/`spinner`), file JS đọc qua helper
    `tx(key, fallback_vi)` — xem mẫu trong `site-map.js`/`travel-spinner.js`.
    Chuỗi mang ý nghĩa DỮ LIỆU (`data-filter`, tên quốc gia, series, tags)
    giữ nguyên tiếng Việt, chỉ dịch chuỗi hiển thị.
  - Search: `_plugins/search_index.rb` tạo `/search-index.json` và
    `/en/search-index.json` một lần mỗi ngôn ngữ, chỉ index tiêu đề/tags
    như search cũ, không index toàn văn. Cache fingerprint metadata từng
    entry ở `.jekyll-cache/yedas-search/<lang>.json` (đã được gitignore),
    tự bỏ entry bài xóa và tự rebuild khi cache hỏng/đổi code index/baseurl.
    `--disable-disk-cache` bỏ qua cache này. `_includes/search.html` giữ ID
    overlay của theme; `assets/js/search.js` tải JSON khi mở search, dùng
    hash nội dung trong URL để tránh index cũ, hỗ trợ tiếng Việt không dấu.
    Không đưa lại vòng lặp `site.html_pages` vào include search: từng khiến
    phần này chiếm phần lớn thời gian render. CI lưu/khôi phục cache search.
    Kiểm tra bằng `bundle exec ruby _tests/search_index_test.rb` và
    `node --test _tests/search_test.js`; profile bằng lệnh build thêm
    `--profile` (dùng destination ngoài repo để tránh đụng server watch).
  - Playlist VI/EN dùng `_includes/playlist-body.html`; chuỗi ở mục
    `playlist` trong `strings.yml`. `_layouts/base.html` xuất
    `window.__playlistStrings` trước `footer-scripts.html` để cả trang
    playlist và nút lưu trong bài viết dùng chung bản dịch. Giữ nguyên key
    localStorage `yedas_playlists_v1` / `yedas_playlist_v1` và tên, dữ liệu
    playlist người dùng đã lưu khi đổi ngôn ngữ.

## Kiểm tra ảnh và bài du lịch

- `ruby _tests/post_compact_test.rb`: kiểm tra CSS chế độ “Ảnh + tiêu đề mẹo” bằng Chrome headless ở desktop/mobile, gồm bố cục ảnh–chữ ẩm thực, heading, figure, grid, gallery và chuyển về đầy đủ. Mặc định dùng Google Chrome trên macOS; đặt `CHROME_BIN` khi dùng đường dẫn khác.

- `node --test _tests/site_map_cluster_test.js`: kiểm tra popup ghim nhóm: gom tiền tố series/vị trí, rút gọn tên bài ẩm thực, giữ chỉ số click và escape HTML.
- `bundle exec ruby _tests/site_map_images_test.rb`: kiểm tra avatar bản đồ,
  fallback sang thumbnail/cover khi thiếu avatar và đường dẫn VI/EN/baseurl.
- `bundle exec ruby _tests/travel_batch_test.rb`: kiểm tra các bài có `photo_id`,
  nguồn/bản quyền trong `_data/travel_2027_credits.json`, ảnh JPEG local và
  avatar nhỏ hơn 100 KB. Bài dùng `_includes/travel-cover-reference.html` để
  hiển thị ảnh, credit và nguồn; khi thêm bài nhớ tạo cả `cover.jpg`, `avatar.jpg`.
- `bundle exec ruby _tests/post_frontmatter_test.rb`: validate front matter của
  mọi `posts/**/index.md` theo JSON Schema `_tests/post.schema.json` (validator
  tự viết, subset draft-07, không cần gem). Có rule riêng ngoài schema: bài có
  `geo` phải có `place_region` hoặc tag miền. Khi thêm field front matter mới,
  khai báo trong schema thay vì chỉ dùng tuỳ ý — CI chạy test này.

## Bài ẩm thực

- Quy ước người dùng: **banner** là ảnh lớn đầu bài (`banner-img` trong theme); **cover** là ảnh đại diện (`cover-img`) và ảnh card ở trang tổng hợp. Hai ảnh thường KHÁC NHAU. Yêu cầu đổi cover chỉ sửa `cover-img` và card gán ảnh riêng, KHÔNG ghi đè banner; yêu cầu đổi banner chỉ sửa `banner-img`. Ảnh nội dung là loại riêng, không tự đồng bộ với hai loại trên.

- Ưu tiên ảnh cận cảnh món ăn và chỗ ngồi trong nhà, bàn ghế đàng hoàng; không dùng ảnh vỉa hè/hàng rong hoặc gợi ý ngồi ăn vỉa hè.
- Mỗi bài con có ít nhất hai ảnh trong thân bài, không tính ảnh bìa/thumbnail. Bài tổng hợp ốc và hải sản cần bộ 10 ảnh món ăn khác nhau. Không gắn tên món cho ảnh món khác; thiếu ảnh đúng món thì báo rõ.
- Có thể dùng Wikimedia Commons/Flickr với giấy phép tái sử dụng rõ ràng khi Pexels thiếu ảnh; ghi tác giả, link gốc, giấy phép và thay đổi ảnh.
- Các series Ăn ngon miền Bắc/Trung/Nam chỉ giữ món mặn; chè, bánh ngọt thuộc mục Tráng miệng, cà phê thuộc series riêng.
- Video nhúng cuối bài (`## Xem thêm qua video`, `.video-embed` + iframe
  `youtube.com/embed`): mặc định ~4 video mỗi bài, ưu tiên video CHẤT LƯỢNG CAO — kênh uy tín/dựng hình
  tốt (Gordon Ramsay, Epicurious, Joshua Weissman, Natasha's Kitchen...),
  đúng món trong bài; tránh video mờ, quay ẩu hay nội dung lệch chủ đề.
