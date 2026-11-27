/* Module "Vòng quay may mắn": quay chọn điểm đến du lịch ngẫu nhiên.
   Đọc window.__athletePins (kind="place") — pins giờ load async qua
   map-pins.bin nên chờ window.__mapPinsReady nếu có. */
window.__runTravelSpinner = function () {
  var root = document.querySelector('.travel-spinner');
  if (!root) return;

  var pins = (window.__athletePins || []).filter(function (p) {
    return p.kind === 'place';
  });
  if (!pins.length) { root.hidden = true; return; }

  // Chuỗi UI theo ngôn ngữ — đổ từ _data/strings.yml qua window.__spinnerStrings
  var S = window.__spinnerStrings || {};
  function tx(k, d) { return S[k] || d; }

  // Mỗi chip gom nhiều tag gần nghĩa trong front matter của bài du lịch
  // (tags khớp dữ liệu tiếng Việt, label là chuỗi UI dịch được)
  var TERRAINS = [
    { label: tx('t_beach', 'Biển đảo'), tags: ['Biển đảo', 'Biển', 'Đảo', 'Lặn biển'] },
    { label: tx('t_city', 'Thành phố'), tags: ['Thành phố'] },
    { label: tx('t_mountain', 'Núi & Cao nguyên'), tags: ['Núi', 'Núi lửa', 'Cao nguyên', 'Đồi chè', 'Đồi trà', 'Trekking'] },
    { label: tx('t_nature', 'Thiên nhiên'), tags: ['Thiên nhiên', 'Safari', 'Động vật'] },
    { label: tx('t_desert', 'Sa mạc'), tags: ['Sa mạc'] }
  ];
  var MAX_SLICES = 12;
  // Bảng màu hệ Apple — sáng vừa phải để hợp cả light/dark mode
  var PALETTE = ['#0071e3', '#34c759', '#ff9f0a', '#af52de', '#ff375f', '#5ac8fa', '#ffd60a', '#64d2ff'];
  var DARK_TEXT = { '#ffd60a': 1, '#5ac8fa': 1, '#64d2ff': 1 };

  var countrySel = document.getElementById('ts-country');
  var terrainBox = document.getElementById('ts-terrains');
  var durationInput = document.getElementById('ts-duration');
  var spinBtn = document.getElementById('ts-spin');
  var modal = document.getElementById('ts-modal');
  var closeBtn = document.getElementById('ts-close');
  var againBtn = document.getElementById('ts-again');
  var canvas = document.getElementById('ts-wheel-canvas');
  var ctx = canvas.getContext('2d');
  var countEl = document.getElementById('ts-count');
  var currentRotation = 0;
  var resultBox = document.getElementById('ts-result');
  var emptyMsg = document.getElementById('ts-empty');

  var chosenTerrains = [];

  // ---- Quốc gia: gom từ pins, sort theo tên ----
  var countries = [];
  pins.forEach(function (p) {
    if (p.country && countries.indexOf(p.country) === -1) countries.push(p.country);
  });
  countries.sort(function (a, b) { return a.localeCompare(b, 'vi'); });
  countries.forEach(function (c) {
    var opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    countrySel.appendChild(opt);
  });

  // ---- Chip địa hình: bật/tắt, vô hiệu nếu không có điểm nào khớp ----
  var chips = TERRAINS.map(function (t) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ts-terrain';
    b.textContent = t.label;
    b.dataset.terrain = t.label;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () {
      var i = chosenTerrains.indexOf(t);
      if (i === -1) chosenTerrains.push(t); else chosenTerrains.splice(i, 1);
      b.classList.toggle('is-on', i === -1);
      b.setAttribute('aria-pressed', String(i === -1));
      refreshChipStates();
    });
    terrainBox.appendChild(b);
    return b;
  });

  function matchesCountry(p) {
    return !countrySel.value || p.country === countrySel.value;
  }

  function matchesTerrain(p, group) {
    var ptags = p.tags || [];
    return group.tags.some(function (t) { return ptags.indexOf(t) !== -1; });
  }

  function candidates() {
    return pins.filter(function (p) {
      if (!matchesCountry(p)) return false;
      if (!chosenTerrains.length) return true;
      return chosenTerrains.some(function (t) { return matchesTerrain(p, t); });
    });
  }

  function refreshChipStates() {
    chips.forEach(function (b, i) {
      var g = TERRAINS[i];
      var any = pins.some(function (p) {
        return matchesCountry(p) && matchesTerrain(p, g);
      });
      b.disabled = !any && chosenTerrains.indexOf(g) === -1;
      b.style.opacity = b.disabled ? 0.4 : '';
    });
  }
  countrySel.addEventListener('change', refreshChipStates);
  refreshChipStates();

  // ---- Dialog quay trúng thưởng ----
  var spinning = false;

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    if (spinning) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  modal.querySelector('.ts-modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  // ---- Quay: xây dải tên chạy trong trống, dừng đúng ô trúng ----
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // ---- Vẽ vòng xoay trên canvas ----
  function drawWheel(list) {
    var size = canvas.width;
    var cx = size / 2;
    var radius = cx - 6;
    var n = list.length;
    var seg = (Math.PI * 2) / n;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(cx, cx);

    for (var i = 0; i < n; i++) {
      var start = -Math.PI / 2 + i * seg;
      var color = PALETTE[i % PALETTE.length];

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, start + seg);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tên điểm đến dọc theo bán kính, chữ tối đa vừa cung tròn
      ctx.save();
      ctx.rotate(start + seg / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = DARK_TEXT[color] ? 'rgba(0,0,0,0.8)' : '#fff';
      var fontSize = Math.max(13, Math.min(22, radius * seg * 0.32));
      ctx.font = '600 ' + fontSize + 'px -apple-system, "Segoe UI", sans-serif';
      var label = p_name(list[i]);
      var maxW = radius * 0.82;
      while (label.length > 3 && ctx.measureText(label).width > maxW) {
        label = label.slice(0, -2);
      }
      if (label !== p_name(list[i])) label = label.slice(0, -1) + '…';
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 2;
      ctx.fillText(label, radius - 14, 0);
      ctx.restore();
    }

    // Trục giữa
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  function p_name(p) { return p.name; }

  // Đếm ngược 3-2-1 rồi gọi done()
  function countdown(n, done) {
    if (n === 0) {
      countEl.hidden = true;
      done();
      return;
    }
    countEl.hidden = false;
    countEl.innerHTML = '';
    var s = document.createElement('span');
    s.textContent = n;
    countEl.appendChild(s);
    setTimeout(function () { countdown(n - 1, done); }, 800);
  }

  function spin() {
    if (spinning) return;
    var list = candidates();
    emptyMsg.hidden = true;
    resultBox.hidden = true;
    againBtn.hidden = true;
    if (!list.length) { emptyMsg.hidden = false; return; }

    spinning = true;
    openModal();

    var duration = Math.min(15, Math.max(2, Number(durationInput.value) || 5));

    // Vòng xoay chỉ chứa tối đa MAX_SLICES miếng — lấy ngẫu nhiên từ danh sách khớp
    var slices = shuffle(list).slice(0, Math.min(MAX_SLICES, list.length));
    var winnerIdx = Math.floor(Math.random() * slices.length);
    var winner = slices[winnerIdx];
    drawWheel(slices);

    var segDeg = 360 / slices.length;
    // Góc dừng: tâm miếng winner nằm dưới kim ở đỉnh, lệch ngẫu nhiên nhẹ
    var jitter = (Math.random() - 0.5) * segDeg * 0.5;
    var targetMod = (-(winnerIdx + 0.5) * segDeg + jitter) % 360;
    // Xoay tiếp về phía trước (không reset về 0 gây giật giữa các lần quay)
    var delta = ((targetMod - (currentRotation % 360)) % 360 + 360) % 360;
    // Số vòng quay ít thôi cho chậm — tốc độ chủ yếu do easing chậm dần quyết định
    var turns = Math.max(2, Math.round(duration / 3));
    currentRotation += turns * 360 + delta;

    spinBtn.disabled = true;
    spinBtn.textContent = tx('spinning', 'Đang quay…');

    // Đếm ngược 3-2-1 rồi mới bắt đầu xoay
    countdown(3, function () {
      canvas.style.transition = 'transform ' + duration + 's cubic-bezier(0.2, 0.88, 0.28, 1)';
      canvas.style.transform = 'rotate(' + currentRotation + 'deg)';
    });

    var countdownMs = 3 * 800;
    setTimeout(function () {
      setTimeout(function () {
        spinBtn.disabled = false;
        spinBtn.textContent = tx('spin', 'Quay!');
        spinning = false;
        showResult(winner);
        againBtn.hidden = false;
      }, 400);
    }, countdownMs + duration * 1000);
  }

  function showResult(p) {
    resultBox.innerHTML = '';
    if (p.image) {
      var img = document.createElement('img');
      img.src = p.image;
      img.alt = p.name;
      img.loading = 'lazy';
      resultBox.appendChild(img);
    }
    var info = document.createElement('div');
    var h = document.createElement('h3');
    h.className = 'ts-result-name';
    h.textContent = p.name;
    var meta = document.createElement('p');
    meta.className = 'ts-result-meta';
    var bits = [p.country, p.region, p.bestTime ? tx('best_time', 'Nên đi') + ': ' + p.bestTime : ''].filter(Boolean);
    meta.textContent = bits.join(' · ');
    var link = document.createElement('a');
    link.className = 'ts-result-link';
    link.href = p.url;
    link.textContent = tx('view_post', 'Xem bài viết →');
    info.appendChild(h);
    info.appendChild(meta);
    info.appendChild(link);
    resultBox.appendChild(info);
    resultBox.hidden = false;
  }

  spinBtn.addEventListener('click', spin);
  againBtn.addEventListener('click', spin);

  // ---- Kéo chuột/cảm ứng xoay chơi (không tính kết quả) ----
  var dragging = false;
  var dragBase = 0;
  var dragStartAngle = 0;
  var lastAngle = 0;
  var lastTime = 0;
  var dragVel = 0; // deg/ms

  function pointerAngle(e) {
    var r = canvas.getBoundingClientRect();
    return Math.atan2(
      e.clientY - (r.top + r.height / 2),
      e.clientX - (r.left + r.width / 2)
    ) * 180 / Math.PI;
  }

  canvas.addEventListener('pointerdown', function (e) {
    if (spinning || modal.hidden) return;
    dragging = true;
    canvas.setPointerCapture(e.pointerId);
    canvas.style.transition = 'none';
    dragBase = currentRotation;
    dragStartAngle = lastAngle = pointerAngle(e);
    lastTime = performance.now();
    dragVel = 0;
    e.preventDefault();
  });

  canvas.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var a = pointerAngle(e);
    var now = performance.now();
    var dt = now - lastTime;
    var dA = a - lastAngle;
    // Chuẩn hoá góc về [-180, 180] tránh nhảy khi qua vạch ±180°
    if (dA > 180) dA -= 360;
    if (dA < -180) dA += 360;
    if (dt > 0) dragVel = dragVel * 0.7 + (dA / dt) * 0.3;
    lastAngle = a;
    lastTime = now;
    var total = a - dragStartAngle;
    if (total > 180) total -= 360;
    if (total < -180) total += 360;
    canvas.style.transform = 'rotate(' + (dragBase + total) + 'deg)';
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    var a = pointerAngle(e);
    var total = a - dragStartAngle;
    if (total > 180) total -= 360;
    if (total < -180) total += 360;
    currentRotation = dragBase + total;
    // Thả mạnh → vòng trôi thêm theo quán tính
    if (Math.abs(dragVel) > 0.08) {
      currentRotation += dragVel * 350;
      canvas.style.transition = 'transform 1.4s cubic-bezier(0.15, 0.9, 0.25, 1)';
      canvas.style.transform = 'rotate(' + currentRotation + 'deg)';
    } else {
      canvas.style.transform = 'rotate(' + currentRotation + 'deg)';
    }
  }

  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  if (location.hash === '#ts-demo') {
    openModal();
    drawWheel(shuffle(pins).slice(0, Math.min(MAX_SLICES, pins.length)));
  }
};

// Trang có bản đồ (site-map.js boot) → chờ promise pins; trang khác chạy ngay
if (window.__mapPinsReady) window.__mapPinsReady.then(window.__runTravelSpinner, function () {});
else window.__runTravelSpinner();
