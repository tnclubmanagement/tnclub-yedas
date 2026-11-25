(function () {
  // Icon "x" của Lucide (inline SVG, không cần tải thư viện icon ngoài)
  var CLOSE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

  function initMap() {
    var el = document.getElementById('athlete-map');
    var qv = document.getElementById('athlete-quickview');
    var count = document.getElementById('athlete-map-count');
    if (!el || !window.L || !window.__athletePins) return;

    // Chuỗi UI theo ngôn ngữ — đổ từ _data/strings.yml qua window.__mapStrings
    // trong site-map.html. Fallback giữ nguyên tiếng Việt gốc.
    var S = window.__mapStrings || {};
    function tx(k, d) { return S[k] || d; }

    var map = L.map(el, {
      minZoom: 2, maxZoom: 10, zoomSnap: 0.5,
      worldCopyJump: true,
      attributionControl: true
    }).setView([20, 105], 2);
    map.setMaxBounds([[-75, -200], [80, 200]]);

    // Tiles kiểu Google Maps — Esri World Street Map, miễn phí không cần key
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Esri, HERE, Garmin &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      // Giữ tile đã tải ngoài viewport để pan/zoom mượt hơn; browser tự
      // cache tile theo HTTP cache của Esri nên lần sau vào sẽ nhanh hơn
      keepBuffer: 4, updateWhenZooming: false, updateWhenIdle: true
    }).addTo(map);

    function close() { qv.hidden = true; }
    var detail = document.getElementById('athlete-detail');
    var modal = document.getElementById('athlete-modal');
    var mediaContent = document.getElementById('athlete-media-content');
    var detailCache = {};

    function closeDetail() { detail.hidden = true; }
    function closeModal() {
      if (modal.hidden) return;
      modal.hidden = true;
      mediaContent.innerHTML = ''; // dừng video đang phát
      document.body.style.overflow = section && (section.classList.contains('is-max') || section.classList.contains('is-fullscreen')) ? 'hidden' : '';
    }

    modal.querySelector('.athlete-modal-backdrop').addEventListener('click', closeModal);
    modal.querySelector('.athlete-modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) {
        e.preventDefault();
        closeModal();
      }
    });

    // Fetch + parse bài viết, cache lại Document
    function fetchDoc(url) {
      if (detailCache[url]) return Promise.resolve(detailCache[url]);
      return fetch(url).then(function (r) { return r.text(); }).then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        detailCache[url] = doc;
        return doc;
      });
    }

    // Panel hồ sơ inline dưới bản đồ
    function loadPost(url) {
      close();
      detail.hidden = false;
      detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
      detail.innerHTML = '<p class="athlete-detail-loading">' + tx('loading_profile', 'Đang tải hồ sơ…') + '</p>';
      fetchDoc(url).then(function (doc) {
        var body = doc.querySelector('.post-body');
        detail.innerHTML = '<button class="athlete-detail-close" type="button" aria-label="' + tx('close_profile', 'Đóng hồ sơ') + '">' + CLOSE_ICON + '</button>' +
          (body ? '<div class="blog-post post-body">' + body.innerHTML + '</div>'
                : '<p>' + tx('no_content', 'Không đọc được nội dung bài viết.') + '</p>');
      }).catch(function () {
        detail.innerHTML = '<button class="athlete-detail-close" type="button" aria-label="' + tx('close_profile', 'Đóng hồ sơ') + '">' + CLOSE_ICON + '</button>' +
          '<p class="athlete-detail-loading"><a href="' + url + '">' + tx('load_failed', 'Không tải được bài viết — mở trang riêng.') + '</a></p>';
      });
    }

    // Modal riêng cho Galleries / Videos — trích đúng phần đó từ bài
    function openMedia(url, kind, name) {
      close();
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      mediaContent.innerHTML = '<p class="athlete-detail-loading">' + tx('loading', 'Đang tải…') + '</p>';
      fetchDoc(url).then(function (doc) {
        var body = doc.querySelector('.post-body'), inner = '';
        if (body) {
          if (kind === 'gallery') {
            var figs = body.querySelectorAll('figure');
            if (figs.length) {
              inner = '<h3 class="athlete-media-title">Galleries — ' + name + '</h3>' +
                '<div class="blog-post post-body"><div class="athlete-media-gallery">' +
                Array.prototype.map.call(figs, function (f) { return f.outerHTML; }).join('') +
                '</div></div>';
            }
          } else {
            var vids = body.querySelectorAll('.video-embed');
            if (vids.length) {
              inner = '<h3 class="athlete-media-title">Videos — ' + name + '</h3>' +
                '<div class="blog-post post-body"><div class="athlete-media-videos">' +
                Array.prototype.map.call(vids, function (v) { return v.outerHTML; }).join('') +
                '</div></div>';
            }
          }
        }
        mediaContent.innerHTML = inner ||
          '<p class="athlete-detail-loading">' + name + ' ' + tx('no_media', 'chưa có') + ' ' +
          (kind === 'gallery' ? tx('media_gallery', 'ảnh minh họa') : tx('media_video', 'video')) + '.</p>';
      }).catch(function () {
        mediaContent.innerHTML = '<p class="athlete-detail-loading">' + tx('load_failed_media', 'Không tải được nội dung.') + '</p>';
      });
    }

    detail.addEventListener('click', function (e) {
      if (e.target.closest('.athlete-detail-close')) closeDetail();
    });
    qv.querySelector('.athlete-qv-link').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      loadPost(this.href);
    });
    qv.querySelectorAll('.athlete-qv-goto').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openMedia(qv.querySelector('.athlete-qv-link').href, a.dataset.goto,
          qv.querySelector('.athlete-qv-name').textContent);
      });
    });
    map.on('click', close);
    map.on('zoomstart', close);
    qv.querySelector('.athlete-qv-close').addEventListener('click', close);

    var CONTINENT_LABEL = { asia: tx('continent_asia', 'Châu Á'), europe: tx('continent_europe', 'Châu Âu'), americas: tx('continent_americas', 'Châu Mỹ'), africa: tx('continent_africa', 'Châu Phi'), oceania: tx('continent_oceania', 'Châu Đại Dương'), mideast: tx('continent_mideast', 'Trung Đông') };
    var COUNTRY_CONTINENT = {
      Vietnam: 'asia', China: 'asia', Japan: 'asia', Taiwan: 'asia',
      Thailand: 'asia', Korea: 'asia', Indonesia: 'asia', Malaysia: 'asia',
      Philippines: 'asia', Laos: 'asia', Cambodia: 'asia', India: 'asia',
      Pakistan: 'asia', Nepal: 'asia', Bangladesh: 'asia', Bhutan: 'asia',
      'Sri Lanka': 'asia', Maldives: 'asia', Afghanistan: 'asia',
      'United Arab Emirates': 'mideast', 'Saudi Arabia': 'mideast', Israel: 'mideast',
      Jordan: 'mideast', Turkey: 'mideast', Qatar: 'mideast', Oman: 'mideast', Iran: 'mideast',
      Bahrain: 'mideast', Kuwait: 'mideast', Lebanon: 'mideast', Iraq: 'mideast', Cyprus: 'mideast',
      Georgia: 'mideast', Armenia: 'mideast', Azerbaijan: 'mideast', Syria: 'mideast', Yemen: 'mideast',
      France: 'europe', Italy: 'europe', Spain: 'europe', 'United Kingdom': 'europe',
      Germany: 'europe', Netherlands: 'europe', Switzerland: 'europe', Greece: 'europe',
      Poland: 'europe', Czechia: 'europe', Hungary: 'europe', Croatia: 'europe',
      Romania: 'europe', Bulgaria: 'europe', Ukraine: 'europe', Serbia: 'europe',
      Russia: 'europe',
      Denmark: 'europe', Norway: 'europe', Sweden: 'europe', Finland: 'europe',
      Iceland: 'europe',
      'United States': 'americas', Canada: 'americas', Brazil: 'americas',
      Argentina: 'americas', Peru: 'americas', Chile: 'americas', Colombia: 'americas',
      Australia: 'oceania', 'New Zealand': 'oceania',
      Morocco: 'africa', Egypt: 'africa', Tunisia: 'africa', Algeria: 'africa',
      Ethiopia: 'africa', Kenya: 'africa', Tanzania: 'africa', Uganda: 'africa',
      Rwanda: 'africa', Senegal: 'africa', Ghana: 'africa', Nigeria: 'africa',
      Namibia: 'africa', Zimbabwe: 'africa', 'South Africa': 'africa', Mauritius: 'africa',
      Libya: 'africa', Sudan: 'africa',
      Madagascar: 'africa', Botswana: 'africa', Zambia: 'africa', Malawi: 'africa',
      Mozambique: 'africa', Angola: 'africa', Lesotho: 'africa', Eswatini: 'africa',
      Seychelles: 'africa', 'Cape Verde': 'africa',
      Mauritania: 'africa', Mali: 'africa', 'Ivory Coast': 'africa', 'Burkina Faso': 'africa',
      Guinea: 'africa', Togo: 'africa', Benin: 'africa', Niger: 'africa',
      'Sierra Leone': 'africa', Liberia: 'africa'
    };
    var COUNTRY_LABEL = { 'United Arab Emirates': 'UAE' };
    var COUNTRY_CODE = {
      Vietnam: 'vn', China: 'cn', Japan: 'jp', Taiwan: 'tw',
      Thailand: 'th', Korea: 'kr', Indonesia: 'id', Malaysia: 'my',
      Philippines: 'ph', Laos: 'la', Cambodia: 'kh', India: 'in',
      Pakistan: 'pk', Nepal: 'np', Bangladesh: 'bd', Bhutan: 'bt',
      'Sri Lanka': 'lk', Maldives: 'mv', Afghanistan: 'af',
      'United Arab Emirates': 'ae', 'Saudi Arabia': 'sa', Israel: 'il',
      Jordan: 'jo', Turkey: 'tr', Qatar: 'qa', Oman: 'om', Iran: 'ir',
      Bahrain: 'bh', Kuwait: 'kw', Lebanon: 'lb', Iraq: 'iq', Cyprus: 'cy',
      Georgia: 'ge', Armenia: 'am', Azerbaijan: 'az', Syria: 'sy', Yemen: 'ye',
      France: 'fr', Italy: 'it', Spain: 'es', 'United Kingdom': 'gb',
      Germany: 'de', Netherlands: 'nl', Switzerland: 'ch', Greece: 'gr',
      Poland: 'pl', Czechia: 'cz', Hungary: 'hu', Croatia: 'hr',
      Romania: 'ro', Bulgaria: 'bg', Ukraine: 'ua', Serbia: 'rs',
      Russia: 'ru',
      Denmark: 'dk', Norway: 'no', Sweden: 'se', Finland: 'fi',
      Iceland: 'is',
      'United States': 'us', Canada: 'ca', Brazil: 'br',
      Argentina: 'ar', Peru: 'pe', Chile: 'cl', Colombia: 'co',
      Australia: 'au', 'New Zealand': 'nz',
      Morocco: 'ma', Egypt: 'eg', Tunisia: 'tn', Algeria: 'dz',
      Ethiopia: 'et', Kenya: 'ke', Tanzania: 'tz', Uganda: 'ug',
      Rwanda: 'rw', Senegal: 'sn', Ghana: 'gh', Nigeria: 'ng',
      Namibia: 'na', Zimbabwe: 'zw', 'South Africa': 'za', Mauritius: 'mu',
      Libya: 'ly', Sudan: 'sd',
      Madagascar: 'mg', Botswana: 'bw', Zambia: 'zm', Malawi: 'mw',
      Mozambique: 'mz', Angola: 'ao', Lesotho: 'ls', Eswatini: 'sz',
      Seychelles: 'sc', 'Cape Verde': 'cv',
      Mauritania: 'mr', Mali: 'ml', 'Ivory Coast': 'ci', 'Burkina Faso': 'bf',
      Guinea: 'gn', Togo: 'tg', Benin: 'bj', Niger: 'ne',
      'Sierra Leone': 'sl', Liberia: 'lr'
    };

    L.DomEvent.disableClickPropagation(qv);
    L.DomEvent.disableScrollPropagation(qv);

    var scoreHelp = document.querySelector('.map-score-help');
    document.addEventListener('pointerdown', function (e) {
      if (scoreHelp && !scoreHelp.contains(e.target)) scoreHelp.open = false;
      var active = document.activeElement;
      if (active && active.classList.contains('athlete-qv-score') && !active.contains(e.target)) active.blur();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      var tips = qv.querySelectorAll('.athlete-qv-score:is(:hover, :focus) .athlete-qv-score-tooltip:not([hidden])');
      if (tips.length) {
        tips.forEach(function (tip) {
          tip.hidden = true;
          tip.parentElement.blur();
        });
        e.preventDefault();
      }
      if (scoreHelp && scoreHelp.open) {
        scoreHelp.open = false;
        e.preventDefault();
      }
      if (!e.defaultPrevented) close();
    });

    function renderFacts(selector, rows) {
      var list = qv.querySelector(selector);
      list.replaceChildren();
      rows.forEach(function (row) {
        var value = Array.isArray(row[1]) ? row[1].filter(Boolean).slice(0, 3).join(' · ') : row[1];
        if (value === '' || value == null) return;
        var group = document.createElement('div');
        var label = document.createElement('dt');
        var text = document.createElement('dd');
        label.textContent = row[0];
        if (row[2]) {
          var flag = document.createElement('span');
          flag.className = 'fi fi-' + row[2];
          flag.setAttribute('aria-hidden', 'true');
          text.appendChild(flag);
        }
        text.appendChild(document.createTextNode(value));
        group.append(label, text);
        list.appendChild(group);
      });
      list.hidden = !list.childElementCount;
      return list.childElementCount;
    }

    // Thời tiết hiện tại qua Open-Meteo (miễn phí, không cần API key).
    // Cache localStorage TTL 6 giờ theo tọa độ làm tròn để giảm số lần gọi;
    // chỉ áp dụng kết quả mới nhất.
    var WX_LS = 'yedas-map-weather-v1';
    var WX_TTL = 6 * 60 * 60 * 1000;
    var weatherInflight = {};
    var weatherSeq = 0;
    function wxStore() {
      try { return JSON.parse(localStorage.getItem(WX_LS)) || {}; }
      catch (e) { return {}; }
    }
    function wxGet(key) {
      var entry = wxStore()[key];
      return entry && (Date.now() - entry.t < WX_TTL) ? entry.v : null;
    }
    function wxSet(key, value) {
      try {
        var store = wxStore();
        store[key] = { t: Date.now(), v: value };
        localStorage.setItem(WX_LS, JSON.stringify(store));
      } catch (e) {}
    }
    function wxDesc(code) {
      if (code === 0) return tx('wx_clear', 'Trời quang');
      if (code <= 2) return tx('wx_partly', 'Ít mây');
      if (code === 3) return tx('wx_cloudy', 'Nhiều mây');
      if (code === 45 || code === 48) return tx('wx_fog', 'Sương mù');
      if (code >= 51 && code <= 57) return tx('wx_drizzle', 'Mưa phùn');
      if ((code >= 71 && code <= 77) || code === 85 || code === 86) return tx('wx_snow', 'Tuyết');
      if (code >= 95) return tx('wx_storm', 'Giông bão');
      if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return tx('wx_rain', 'Mưa');
      return '';
    }
    function loadWeather(d) {
      var key = d.lat.toFixed(2) + ',' + d.lng.toFixed(2);
      var seq = ++weatherSeq;
      var apply = function (text) {
        if (seq !== weatherSeq || !text) return;
        var badge = qv.querySelector('.athlete-qv-weather');
        badge.textContent = text;
        badge.hidden = false;
      };
      var cached = wxGet(key);
      if (cached) { apply(cached); return; }
      if (!weatherInflight[key]) {
        weatherInflight[key] = fetch('https://api.open-meteo.com/v1/forecast?latitude=' + d.lat +
              '&longitude=' + d.lng + '&current=temperature_2m,weather_code,wind_speed_10m')
          .then(function (r) { return r.json(); })
          .then(function (j) {
            var c = j.current;
            if (!c) return '';
            var text = [Math.round(c.temperature_2m) + '°C', wxDesc(c.weather_code),
              Math.round(c.wind_speed_10m) + ' km/h'].filter(Boolean).join(' · ');
            wxSet(key, text);
            return text;
          })
          .catch(function () { return ''; })
          .then(function (text) { delete weatherInflight[key]; return text; });
      }
      weatherInflight[key].then(apply);
    }

    function readScore(value) {
      if (typeof value !== 'number' && typeof value !== 'string') return null;
      if (String(value).trim() === '') return null;
      var score = Number(value);
      return Number.isFinite(score) && score >= 0 && score <= 10 ? score : null;
    }

    function renderScores(d) {
      var section = qv.querySelector('.athlete-qv-scores');
      var list = section.querySelector('.athlete-qv-score-list');
      list.replaceChildren();
      var scores = [[tx('score_content', 'Chất lượng bài viết'), d.contentScore, d.contentNote]];
      if (d.kind === 'place') scores.push([tx('score_destination', 'Độ hấp dẫn điểm đến'), d.destinationScore, d.destinationNote]);
      scores.forEach(function (item, index) {
        var score = readScore(item[1]);
        if (score === null && d.kind !== 'place') return;
        var row = document.createElement('div');
        row.className = 'athlete-qv-score';
        row.dataset.level = score === null ? 'empty' : score < 5 ? 'low' : score < 8 ? 'medium' : 'high';
        var heading = document.createElement('div');
        var label = document.createElement('span');
        var value = document.createElement('strong');
        label.className = index === 0 ? 'fas fa-file-alt' : 'fas fa-map-marker-alt';
        label.setAttribute('aria-hidden', 'true');
        value.textContent = score === null ? '—' : score + '/10';
        row.tabIndex = 0;
        row.setAttribute('role', 'group');
        row.setAttribute('aria-label', item[0]);
        row.addEventListener('click', function () { row.focus(); });
        heading.append(label, value);
        var track = document.createElement('div');
        track.className = 'athlete-qv-score-track';
        var fill = document.createElement('span');
        fill.style.width = (score === null ? 0 : score * 10) + '%';
        track.appendChild(fill);
        if (score !== null) {
          track.setAttribute('role', 'meter');
          track.setAttribute('aria-label', item[0]);
          track.setAttribute('aria-valuemin', '0');
          track.setAttribute('aria-valuemax', '10');
          track.setAttribute('aria-valuenow', String(score));
        }
        row.append(heading, track);
        var tooltip = document.createElement('span');
        tooltip.className = 'athlete-qv-score-tooltip';
        tooltip.id = 'map-score-tip-' + index;
        tooltip.setAttribute('role', 'tooltip');
        tooltip.textContent = item[0] + ': ' + (score === null ? tx('not_rated', 'Chưa đánh giá') : score + '/10') +
          (score !== null && item[2] ? '. ' + item[2] : '') +
          (score !== null && d.ratingUpdated ? ' · ' + tx('updated', 'Cập nhật') + ': ' + d.ratingUpdated : '');
        row.setAttribute('aria-describedby', tooltip.id);
        function showTooltip() {
          tooltip.hidden = false;
          tooltip.style.bottom = 'auto';
          var card = qv.getBoundingClientRect();
          var anchor = row.getBoundingClientRect();
          tooltip.style.maxHeight = (card.height - 12) + 'px';
          var height = tooltip.offsetHeight;
          var top = anchor.top - height - 6;
          if (top < card.top + 6 && anchor.bottom + height + 6 <= card.bottom - 6) top = anchor.bottom + 6;
          tooltip.style.top = (Math.max(card.top + 6, Math.min(top, card.bottom - height - 6)) - anchor.top) + 'px';
        }
        row.addEventListener('mouseenter', showTooltip);
        row.addEventListener('focus', showTooltip);
        row.appendChild(tooltip);
        list.appendChild(row);
      });
      section.hidden = !list.childElementCount;
    }

    var entries = window.__athletePins.map(function (d, i) {
      var icon = L.divIcon({
        className: 'athlete-pin-wrap' + (d.kind === 'place' ? ' place-pin-wrap' : ''),
        html: '<span class="athlete-pin' + (d.kind === 'place' ? ' place-pin' : '') + '" style="animation-delay:' + Math.min(i * 20, 1200) + 'ms">' +
              (d.avatar ? '<img src="' + d.avatar + '" alt="" draggable="false" decoding="async" loading="lazy">' : '') +
              '<span class="athlete-pin-shadow"></span></span>',
        iconSize: [44, 54], iconAnchor: [22, 52]
      });
      var m = L.marker([d.lat, d.lng], { icon: icon, riseOnHover: true }).addTo(map);
      var tipHtml = d.kind === 'place'
        ? '<strong>' + d.name + '</strong>' +
          (d.region ? '<br><small>' + d.region + '</small>' : '')
        : '<strong>' + d.name + '</strong>' +
          (d.nick ? '<br><em>“' + d.nick + '”</em>' : '') +
          '<br><small>' + (d.born ? d.born.split('/').pop() : '') +
          (d.hometown ? ' · ' + d.hometown : '') + '</small>';
      m.bindTooltip(tipHtml,
        { direction: 'top', offset: [0, -24], className: 'athlete-pin-tip' }
      );
      m.on('click', function () {
        qv.querySelector('.athlete-qv-avatar').src = d.image || d.avatar;
        qv.querySelector('.athlete-qv-avatar').alt = d.name;
        qv.querySelector('.athlete-qv-name').textContent = d.name;
        var isPlace = d.kind === 'place';
        var nick = qv.querySelector('.athlete-qv-nick');
        nick.textContent = !isPlace && d.nick ? '“' + d.nick + '”' : '';
        nick.hidden = !nick.textContent;
        var summary = qv.querySelector('.athlete-qv-summary');
        summary.textContent = (isPlace ? d.subtitle : d.summary) || '';
        summary.hidden = !summary.textContent;
        renderScores(d);
        var hasScores = readScore(d.contentScore) !== null || (isPlace && readScore(d.destinationScore) !== null);
        var hasLegacyScore = d.score !== '' && d.score != null;
        renderFacts('.athlete-qv-rating', [
          [tx('f_ranking', 'Xếp hạng'), d.ranking], [tx('f_score', 'Điểm hiện tại'), hasScores ? '' : d.score],
          [tx('updated', 'Cập nhật'), d.ranking || (!hasScores && hasLegacyScore) ? d.ratingUpdated : '']
        ]);
        renderFacts('.athlete-qv-grid', isPlace
          ? [[tx('f_country', 'Quốc gia'), d.country, COUNTRY_CODE[d.country]], [tx('f_region', 'Vùng'), d.region], [tx('f_area', 'Diện tích'), d.area], [tx('f_population', 'Dân số'), d.population]]
          : [[tx('f_nationality', 'Quốc tịch'), d.country, COUNTRY_CODE[d.country]], [tx('f_event', 'Nội dung'), d.event], [tx('f_best_rank', 'Hạng cao nhất'), d.rank]]);
        renderFacts('.athlete-qv-facts', isPlace
          ? [[tx('f_highlights', 'Nên ghé'), d.highlights], [tx('f_best_time', 'Thời điểm nên đi'), d.bestTime]]
          : [[tx('f_skills', 'Kỹ năng nổi bật'), d.skills], [tx('f_achievement', 'Thành tích'), d.achievement]]);
        var more = qv.querySelector('.athlete-qv-more');
        more.open = false;
        more.hidden = !renderFacts('.athlete-qv-extra', isPlace
          ? [[tx('f_transport', 'Di chuyển'), d.transport], [tx('f_food', 'Món nên thử'), d.food],
             [tx('f_economy', 'Kinh tế'), d.economy], [tx('f_festival', 'Lễ hội'), d.festival]]
          : [[tx('f_hometown', 'Nguyên quán'), d.hometown], [tx('f_born', 'Ngày sinh'), d.born], [tx('f_height', 'Chiều cao'), d.height],
             [tx('f_hand', 'Tay thuận'), d.hand], [tx('f_debut', 'Ra mắt'), d.debut]]);
        var directions = qv.querySelector('.athlete-qv-directions');
        directions.hidden = !isPlace;
        if (isPlace) directions.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(d.lat + ',' + d.lng);
        var google = qv.querySelector('.athlete-qv-google');
        var googleQuery = [d.name, d.country, isPlace ? '' : d.event].filter(Boolean).join(' ');
        google.href = 'https://www.google.com/search?q=' + encodeURIComponent(googleQuery);
        google.setAttribute('aria-label', tx('google_aria', 'Tìm %1 trên Google (mở tab mới)').replace('%1', d.name));
        qv.scrollTop = 0;
        qv.querySelector('.athlete-qv-link').href = d.url;
        qv.querySelector('.athlete-qv-link').textContent = d.kind === 'place'
          ? tx('view_post', 'Xem bài viết') : tx('view_profile', 'Xem hồ sơ');
        var wdl = qv.querySelector('.athlete-qv-weather');
        wdl.hidden = true;
        wdl.textContent = '';
        wdl.href = 'https://www.windy.com/' + d.lat.toFixed(3) + '/' + d.lng.toFixed(3);
        if (isPlace) loadWeather(d); else weatherSeq++;
        qv.hidden = false;
      });
      return {
        marker: m, kind: d.kind, series: d.series, country: d.country || '',
        searchText: normalizeText([d.name, d.nick, d.series, d.country, d.hometown,
          d.event, d.subtitle, d.region, d.economy, d.festival,
          CONTINENT_LABEL[COUNTRY_CONTINENT[d.country]] || ''].join(' '))
      };
    });

    // Khung nhìn theo quốc gia — dùng khi chọn trong dropdown Du lịch
    var COUNTRY_BOUNDS = {
      Vietnam:  [[8.0, 102.0], [23.5, 110.5]],
      China:    [[18.0, 73.0], [54.0, 135.0]],
      Japan:    [[30.0, 129.0], [45.5, 146.0]],
      Taiwan:   [[21.4, 119.0], [25.6, 122.5]],
      Thailand: [[5.5, 97.0], [20.6, 106.0]],
      Korea:    [[33.0, 124.0], [39.5, 132.5]],
      Indonesia:  [[-11.0, 95.0], [6.0, 141.0]],
      Malaysia:   [[0.5, 99.0], [7.5, 119.5]],
      Philippines: [[4.5, 116.0], [19.5, 127.0]],
      Laos:      [[13.8, 100.0], [22.6, 107.8]],
      Cambodia:  [[10.3, 102.3], [14.7, 107.7]],
      India:     [[6.5, 68.0], [35.5, 97.5]],
      Pakistan:  [[23.5, 60.5], [37.5, 78.0]],
      Nepal:     [[26.3, 80.0], [30.5, 88.5]],
      Bangladesh: [[20.5, 88.0], [26.7, 93.0]],
      Bhutan:    [[26.7, 88.5], [28.4, 92.2]],
      "Sri Lanka": [[5.8, 79.5], [10.0, 82.2]],
      Maldives:  [[-1.0, 72.5], [7.5, 74.0]],
      Afghanistan: [[29.0, 60.5], [38.5, 75.5]],
      Australia: [[-44.5, 112.0], [-10.0, 154.5]],
      France:    [[41.0, -5.5], [51.5, 10.0]],
      Italy:     [[35.5, 6.0], [47.5, 19.0]],
      Spain:     [[35.5, -10.0], [44.0, 4.5]],
      "United Kingdom": [[49.5, -8.5], [59.0, 2.0]],
      Germany:   [[47.0, 5.5], [55.2, 15.5]],
      Netherlands: [[50.7, 3.0], [53.8, 7.5]],
      Switzerland: [[45.5, 5.5], [48.0, 11.0]],
      Greece:    [[34.5, 19.0], [42.0, 30.0]],
      "United States": [[18.0, -160.0], [48.5, -66.0]],
      Canada:    [[41.5, -141.0], [60.0, -52.0]],
      Brazil:    [[-34.0, -74.0], [5.5, -34.5]],
      Argentina: [[-55.5, -73.5], [-21.5, -53.5]],
      Peru:      [[-18.5, -81.5], [0.5, -68.5]],
      Chile:     [[-56.0, -109.5], [-17.0, -66.5]],
      Colombia:  [[-4.5, -79.5], [12.5, -66.5]],
      Morocco:   [[27.0, -13.5], [36.0, -0.5]],
      Egypt:     [[22.0, 24.5], [32.0, 37.0]],
      Tunisia:   [[30.0, 7.5], [38.0, 12.0]],
      Algeria:   [[18.5, -9.0], [39.0, 12.0]],
      Ethiopia:  [[3.0, 33.0], [15.0, 48.5]],
      Kenya:     [[-5.0, 33.5], [5.5, 42.5]],
      Tanzania:  [[-12.0, 29.0], [-0.5, 41.0]],
      Uganda:    [[-1.5, 29.5], [4.5, 35.5]],
      Rwanda:    [[-3.0, 28.5], [-0.5, 31.0]],
      Senegal:   [[12.0, -18.0], [17.0, -11.0]],
      Ghana:     [[4.5, -3.5], [11.5, 1.5]],
      Nigeria:   [[4.0, 2.5], [14.0, 15.0]],
      Namibia:   [[-29.5, 11.5], [-16.5, 25.5]],
      Zimbabwe:  [[-22.5, 25.0], [-15.5, 33.5]],
      "South Africa": [[-35.0, 16.0], [-22.0, 33.0]],
      Mauritius: [[-20.6, 57.0], [-19.9, 58.0]],
      "United Arab Emirates": [[22.5, 51.5], [26.5, 56.5]],
      "Saudi Arabia": [[16.0, 34.5], [32.5, 55.5]],
      Israel:    [[29.4, 34.2], [33.5, 35.9]],
      Jordan:    [[29.0, 34.5], [33.5, 39.5]],
      Turkey:    [[35.8, 25.5], [42.5, 44.5]],
      Qatar:     [[24.4, 50.7], [26.3, 51.7]],
      Oman:      [[16.5, 52.0], [26.5, 60.0]],
      Iran:      [[24.5, 43.5], [40.0, 63.5]],
      Poland:    [[48.5, 14.0], [55.0, 24.5]],
      Czechia:   [[48.5, 12.0], [51.1, 19.0]],
      Hungary:   [[45.5, 16.0], [48.8, 23.0]],
      Croatia:   [[42.3, 13.4], [46.5, 19.5]],
      Romania:   [[43.5, 20.2], [48.5, 29.8]],
      Bulgaria:  [[41.2, 22.3], [44.3, 28.7]],
      Ukraine:   [[44.0, 22.0], [52.5, 40.5]],
      Serbia:    [[42.0, 18.8], [46.3, 23.1]],
      Bahrain:   [[25.5, 50.3], [26.4, 50.9]],
      Kuwait:    [[28.5, 46.5], [30.2, 48.6]],
      Lebanon:   [[33.0, 35.0], [34.8, 36.7]],
      Iraq:      [[29.0, 38.5], [37.5, 48.8]],
      Cyprus:    [[34.5, 32.2], [35.8, 34.7]],
      Georgia:   [[41.0, 39.5], [43.6, 47.0]],
      Armenia:   [[38.8, 43.4], [41.4, 46.7]],
      Azerbaijan: [[38.4, 44.5], [42.0, 51.0]],
      Syria:     [[32.2, 35.5], [37.4, 42.5]],
      Yemen:     [[12.0, 42.5], [19.0, 55.0]],
      Libya:     [[19.0, 9.0], [33.5, 25.5]],
      Sudan:     [[8.5, 21.5], [22.5, 39.0]],
      Madagascar: [[-26.0, 42.5], [-11.5, 51.0]],
      Botswana:  [[-27.0, 19.5], [-17.5, 29.5]],
      Zambia:    [[-18.5, 21.5], [-8.0, 34.0]],
      Malawi:    [[-17.5, 32.5], [-9.0, 36.5]],
      Mozambique: [[-27.0, 30.0], [-10.0, 41.5]],
      Angola:    [[-18.5, 11.0], [-4.0, 24.5]],
      Lesotho:   [[-30.8, 26.8], [-28.4, 29.5]],
      Eswatini:  [[-27.5, 30.5], [-25.5, 32.3]],
      Seychelles: [[-10.5, 46.0], [-3.5, 57.0]],
      "Cape Verde": [[14.5, -25.5], [17.5, -22.5]],
      Mauritania: [[14.5, -17.5], [27.5, -4.5]],
      Mali:      [[10.0, -12.5], [25.0, 4.5]],
      "Ivory Coast": [[4.0, -8.8], [10.8, -2.2]],
      "Burkina Faso": [[9.3, -5.8], [15.2, 2.5]],
      Guinea:    [[7.0, -15.5], [12.8, -7.5]],
      Togo:      [[6.0, -0.5], [11.2, 1.9]],
      Benin:     [[6.0, 0.5], [12.5, 4.0]],
      Niger:     [[11.5, 0.0], [23.5, 16.0]],
      "Sierra Leone": [[6.8, -13.4], [10.1, -10.2]],
      Liberia:   [[4.2, -11.6], [8.6, -7.3]],
      Russia:    [[41.0, 19.0], [78.0, 180.0]],
      Denmark:   [[54.5, 8.0], [57.8, 15.5]],
      Norway:    [[57.5, 4.0], [71.5, 31.5]],
      Sweden:    [[55.0, 10.5], [69.5, 24.5]],
      Finland:   [[59.5, 19.0], [70.5, 32.0]],
      Iceland:   [[63.0, -24.5], [66.8, -13.0]],
      "New Zealand": [[-47.5, 165.5], [-34.0, 179.5]]
    };
    var HOME_VIEW = { center: [20, 105], zoom: 2 };

    var filterBar = document.getElementById('athlete-map-filters');
    var sportDrop = document.getElementById('filter-drop-sport');
    var travelDrop = document.getElementById('filter-drop-travel');
    var sportLabel = sportDrop.querySelector('.filter-drop-label');
    var travelLabel = travelDrop ? travelDrop.querySelector('.filter-drop-label') : null;
    var activeFilter = 'all', activeSport = 'all', activeCountry = 'all';
    var countryDialog = document.getElementById('map-country-dialog');
    if (countryDialog) {
      document.getElementById('map-country-close').addEventListener('click', function () { countryDialog.close(); });
      countryDialog.addEventListener('click', function (e) {
        if (e.target === countryDialog) {
          var bounds = countryDialog.getBoundingClientRect();
          if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) countryDialog.close();
        }
      });
    }

    // Sinh nút quốc gia trong dropdown Du lịch từ COUNTRY_CONTINENT —
    // thêm nước chỉ cần sửa 1 chỗ (và COUNTRY_BOUNDS nếu muốn auto-zoom)
    if (travelDrop) {
      Object.keys(COUNTRY_CONTINENT).forEach(function (country) {
        var group = travelDrop.querySelector('[data-continent-group="' + COUNTRY_CONTINENT[country] + '"]');
        if (!group) return;
        var b = document.createElement('button');
        b.className = 'drop-item';
        b.type = 'button';
        b.dataset.country = country;
        if (COUNTRY_CODE[country]) {
          var fl = document.createElement('span');
          fl.className = 'fi fi-' + COUNTRY_CODE[country];
          fl.setAttribute('aria-hidden', 'true');
          b.appendChild(fl);
        }
        b.appendChild(document.createTextNode(COUNTRY_LABEL[country] || country));
        group.appendChild(b);
      });
    }

    // Filter mặc định + ghi nhớ lựa chọn của người dùng
    var DEFAULT_FILTER = (window.__athleteMapConfig || {}).defaultFilter || 'all';
    var LS_KEY = 'yedas-map-filters';
    function saveFilters() {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({
          f: activeFilter, sport: activeSport, country: activeCountry
        }));
      } catch (e) {}
    }
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    function normalizeText(value) {
      return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
    }

    var searchInput = document.getElementById('athlete-map-search');
    searchInput.addEventListener('input', function () { applyFilters(true); });

    function applyFilters(silent) {
      var shown = 0;
      var terms = normalizeText(searchInput.value).trim().split(/\s+/).filter(Boolean);
      entries.forEach(function (en) {
        var on;
        if (activeFilter === 'all') on = true;
        else if (activeFilter === 'Thể thao')
          on = en.kind === 'athlete' && (activeSport === 'all' || en.series === activeSport);
        else if (activeFilter === 'Du lịch')
          on = en.kind === 'place' &&
            (activeCountry === 'all' ||
             (activeCountry.indexOf('continent:') === 0
               ? COUNTRY_CONTINENT[en.country] === activeCountry.slice(10)
               : en.country === activeCountry));
        else on = false;
        on = on && terms.every(function (term) { return en.searchText.indexOf(term) !== -1; });
        if (on) {
          en.marker.addTo(map);
          var pinEl = en.marker.getElement() &&
            en.marker.getElement().querySelector('.athlete-pin');
          if (pinEl) pinEl.style.animationDelay = Math.min(shown * 20, 1200) + 'ms';
          shown++;
        }
        else map.removeLayer(en.marker);
      });
      if (count) count.textContent = shown;
      close();

      // Tự zoom theo filter: quốc gia cụ thể → khung nước đó;
      // "Tất cả" → về khung nhìn mặc định; còn lại fit theo các pin đang hiện
      if (silent) return;
      focusView();
    }

    // Bay về đúng khung nhìn của lựa chọn hiện tại — nút ◎ trên bản đồ
    // và filter đều đi qua hàm này (zoom luôn được áp theo vùng đích).
    function focusView() {
      if (activeFilter === 'Du lịch' && activeCountry !== 'all' && COUNTRY_BOUNDS[activeCountry]) {
        map.flyToBounds(COUNTRY_BOUNDS[activeCountry], { padding: [40, 40], duration: 1.2, maxZoom: 8 });
      } else if (activeFilter === 'all') {
        map.flyTo(HOME_VIEW.center, HOME_VIEW.zoom, { duration: 1.0 });
      } else {
        var bounds = [];
        entries.forEach(function (en) {
          if (map.hasLayer(en.marker)) bounds.push(en.marker.getLatLng());
        });
        if (bounds.length) {
          map.flyToBounds(L.latLngBounds(bounds), { padding: [50, 50], duration: 1.2, maxZoom: 7 });
        }
      }
    }

    function resetDrop(wrap, label, baseLabel, key, items) {
      wrap.querySelectorAll('.drop-item').forEach(function (b) {
        b.classList.toggle('drop-item-active', b.dataset[key] === 'all');
      });
      wrap.querySelectorAll('.drop-group-title').forEach(function (b) {
        b.classList.remove('drop-group-title-active');
      });
      label.textContent = baseLabel;
    }

    function setMainFilter(name, btn, silent) {
      activeFilter = name;
      filterBar.querySelectorAll(':scope > .home-tab, :scope .filter-drop > .home-tab').forEach(function (b) {
        b.classList.toggle('home-tab-active', b === btn);
      });
      if (name !== 'Thể thao' && activeSport !== 'all') {
        activeSport = 'all';
        resetDrop(sportDrop, sportLabel, tx('sport', 'Thể thao'), 'sport');
      }
      if (name !== 'Du lịch' && activeCountry !== 'all' && travelDrop) {
        activeCountry = 'all';
        resetDrop(travelDrop, travelLabel, tx('travel', 'Du lịch'), 'country');
      }
      applyFilters(silent);
      saveFilters();
    }

    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;

      // Chọn môn trong dropdown Thể thao → tự bật filter Thể thao
      if (btn.dataset.sport) {
        activeSport = btn.dataset.sport;
        sportDrop.querySelectorAll('.drop-item').forEach(function (b) {
          b.classList.toggle('drop-item-active', b === btn);
        });
        sportLabel.textContent = activeSport === 'all' ? tx('sport', 'Thể thao')
          : tx('sport', 'Thể thao') + ': ' + cap(btn.textContent.trim());
        setMainFilter('Thể thao', sportDrop.querySelector('[data-filter="Thể thao"]'));
        sportDrop.classList.remove('open');
        return;
      }

      // Chọn quốc gia trong dropdown Du lịch → tự bật filter Du lịch
      if (btn.dataset.country) {
        activeCountry = btn.dataset.country;
        travelDrop.querySelectorAll('.drop-item').forEach(function (b) {
          b.classList.toggle('drop-item-active', b === btn);
        });
        travelDrop.querySelectorAll('.drop-group-title').forEach(function (b) {
          b.classList.remove('drop-group-title-active');
        });
        travelLabel.textContent = activeCountry === 'all' ? tx('travel', 'Du lịch') : tx('travel', 'Du lịch') + ': ' + activeCountry;
        setMainFilter('Du lịch', travelDrop.querySelector('[data-filter="Du lịch"]'));
        countryDialog.close();
        return;
      }

      // Chọn cả châu lục → lọc tất cả quốc gia thuộc châu đó
      if (btn.dataset.continent) {
        activeCountry = 'continent:' + btn.dataset.continent;
        travelDrop.querySelectorAll('.drop-item').forEach(function (b) {
          b.classList.remove('drop-item-active');
        });
        travelDrop.querySelectorAll('.drop-group-title').forEach(function (b) {
          b.classList.toggle('drop-group-title-active', b === btn);
        });
        travelLabel.textContent = tx('travel', 'Du lịch') + ': ' + (CONTINENT_LABEL[btn.dataset.continent] || btn.dataset.continent);
        setMainFilter('Du lịch', travelDrop.querySelector('[data-filter="Du lịch"]'));
        countryDialog.close();
        return;
      }

      if (!btn.dataset.filter) return;
      var f = btn.dataset.filter;
      if (f === 'Thể thao') sportDrop.classList.toggle('open');
      else sportDrop.classList.remove('open');
      if (f === 'Du lịch' && countryDialog) {
        countryDialog.showModal();
        return;
      }
      if (f === activeFilter) {
        sportDrop.classList.remove('open');
        if (travelDrop) travelDrop.classList.remove('open');
        setMainFilter('all', null);
      } else {
        setMainFilter(f, btn);
      }
    });

    // Phóng to trong tab trình duyệt — phủ viewport, giữ hàng filter phía trên
    var section = el.closest('.athlete-map-section');
    var fsBtn = document.getElementById('map-fs-btn');
    var expandBtn = document.getElementById('map-expand-btn');
    L.DomEvent.disableClickPropagation(el.querySelector('#map-fs-btn'));
    L.DomEvent.disableClickPropagation(expandBtn);
    L.DomEvent.disableClickPropagation(document.getElementById('map-center-btn'));
    var fullscreenFallback = false;
    function syncFullscreen() {
      var on = document.fullscreenElement === section || fullscreenFallback;
      section.classList.toggle('is-fullscreen', on);
      fsBtn.setAttribute('aria-pressed', String(on));
      fsBtn.title = on ? tx('exit_fullscreen', 'Thoát toàn màn hình') : tx('fullscreen', 'Fullscreen — Toàn màn hình');
      fsBtn.setAttribute('aria-label', fsBtn.title);
      document.body.style.overflow = on || section.classList.contains('is-max') ? 'hidden' : '';
      map.invalidateSize();
    }
    document.addEventListener('fullscreenchange', syncFullscreen);
    fsBtn.addEventListener('click', function () {
      if (document.fullscreenElement === section) {
        document.exitFullscreen().catch(function () {});
      } else if (fullscreenFallback) {
        fullscreenFallback = false;
        syncFullscreen();
      } else if (section.requestFullscreen && document.fullscreenEnabled) {
        section.requestFullscreen().catch(function () {
          fullscreenFallback = true;
          syncFullscreen();
        });
      } else {
        fullscreenFallback = true;
        syncFullscreen();
      }
    });
    if (window.ResizeObserver) new ResizeObserver(function () { map.invalidateSize(); }).observe(el);
    function setMax(on) {
      if (on) {
        var nav = document.querySelector('.navbar-custom');
        section.style.setProperty('--nav-h', (nav ? nav.offsetHeight : 66) + 'px');
      }
      section.classList.toggle('is-max', on);
      document.body.style.overflow = on || section.classList.contains('is-fullscreen') ? 'hidden' : '';
      expandBtn.textContent = on ? '↙' : '↗';
      expandBtn.title = on ? tx('collapse', 'Thu gọn bản đồ') : tx('expand', 'Expand — Mở rộng bản đồ');
      expandBtn.setAttribute('aria-label', expandBtn.title);
      expandBtn.setAttribute('aria-pressed', String(on));
      setTimeout(function () { map.invalidateSize(); }, 60);
    }
    expandBtn.addEventListener('click', function () {
      setMax(!section.classList.contains('is-max'));
    });
    document.getElementById('map-center-btn').addEventListener('click', function () {
      close();
      focusView();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || e.defaultPrevented || (countryDialog && countryDialog.open)) return;
      if (fullscreenFallback) {
        fullscreenFallback = false;
        syncFullscreen();
      } else if (!document.fullscreenElement && section.classList.contains('is-max')) setMax(false);
    });

    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.filter-drop')) {
        sportDrop.classList.remove('open');
        if (travelDrop) travelDrop.classList.remove('open');
      }
    });

    // Khôi phục filter lần trước (localStorage), fallback về default
    try {
      var saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null') || {};
      var f = ['all', 'Thể thao', 'Du lịch'].indexOf(saved.f) >= 0 ? saved.f : DEFAULT_FILTER;
      if (f === 'Du lịch' && !travelDrop) f = 'all';
      if (saved.sport && sportDrop.querySelector('[data-sport="' + saved.sport + '"]')) {
        activeSport = saved.sport;
        var sb = sportDrop.querySelector('[data-sport="' + saved.sport + '"]');
        sportDrop.querySelector('[data-sport="all"]').classList.remove('drop-item-active');
        sb.classList.add('drop-item-active');
        sportLabel.textContent = tx('sport', 'Thể thao') + ': ' + cap(sb.textContent.trim());
      }
      if (saved.country && travelDrop && travelDrop.querySelector('[data-country="' + saved.country + '"]')) {
        activeCountry = saved.country;
        var cb = travelDrop.querySelector('[data-country="' + saved.country + '"]');
        travelDrop.querySelector('[data-country="all"]').classList.remove('drop-item-active');
        cb.classList.add('drop-item-active');
        travelLabel.textContent = tx('travel', 'Du lịch') + ': ' + activeCountry;
      }
      if (saved.country && travelDrop && saved.country.indexOf('continent:') === 0 &&
          travelDrop.querySelector('[data-continent="' + saved.country.slice(10) + '"]')) {
        activeCountry = saved.country;
        var gb = travelDrop.querySelector('[data-continent="' + saved.country.slice(10) + '"]');
        travelDrop.querySelector('[data-country="all"]').classList.remove('drop-item-active');
        gb.classList.add('drop-group-title-active');
        travelLabel.textContent = tx('travel', 'Du lịch') + ': ' + (CONTINENT_LABEL[saved.country.slice(10)] || '');
      }
      var initBtn = f === 'all' ? filterBar.querySelector('[data-filter="all"]')
        : (f === 'Thể thao' ? sportDrop : travelDrop).querySelector(':scope > .home-tab');
      setMainFilter(f, initBtn, true); // silent: không bay zoom lúc mới load
    } catch (e) {}

    // Lần đầu vào map (chưa lưu filter): đoán quốc gia theo IP (ipwho.is,
    // cache 24h) và tự lọc "Du lịch" tới nước đó nếu trên bản đồ có điểm.
    // Không áp dụng nếu người dùng đã từng chọn filter, hoặc nước detect
    // được không có pin — khi đó giữ nguyên chế độ "Tất cả".
    if (activeFilter === 'all' && travelDrop) {
      var placeCountries = {};
      entries.forEach(function (en) {
        if (en.kind === 'place' && en.country) placeCountries[en.country] = 1;
      });
      var isoToName = {};
      Object.keys(COUNTRY_CODE).forEach(function (name) {
        isoToName[COUNTRY_CODE[name]] = name;
      });

      var GEO_KEY = 'yedas-geo-cc';
      var GEO_TTL = 24 * 60 * 60 * 1000;
      function applyGeo(cc) {
        var name = cc && isoToName[String(cc).toLowerCase()];
        if (!name || !placeCountries[name]) return;
        var btn = travelDrop.querySelector('[data-country="' + name + '"]');
        if (!btn) return;
        activeCountry = name;
        travelDrop.querySelectorAll('.drop-item').forEach(function (b) {
          b.classList.toggle('drop-item-active', b === btn);
        });
        travelDrop.querySelectorAll('.drop-group-title').forEach(function (b) {
          b.classList.remove('drop-group-title-active');
        });
        travelLabel.textContent = tx('travel', 'Du lịch') + ': ' + name;
        setMainFilter('Du lịch', travelDrop.querySelector('[data-filter="Du lịch"]'));
      }

      try {
        var gc = JSON.parse(localStorage.getItem(GEO_KEY));
        if (gc && Date.now() - gc.t < GEO_TTL) {
          applyGeo(gc.cc);
        } else {
          fetch('https://ipwho.is/')
            .then(function (r) { return r.json(); })
            .then(function (d) {
              var cc = d && d.success ? d.country_code : null;
              try {
                localStorage.setItem(GEO_KEY, JSON.stringify({ cc: cc, t: Date.now() }));
              } catch (e) {}
              applyGeo(cc);
            })
            .catch(function () {});
        }
      } catch (e) {}
    }
  }

  if (window.L) initMap();
  else document.addEventListener('DOMContentLoaded', initMap);
})();
