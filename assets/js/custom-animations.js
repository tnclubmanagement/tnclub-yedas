// Animation nhẹ cho trang: chạy 1 lần khi tải / khi cuộn tới, không loop.
// Phong cách Apple-style: hiệu ứng tối giản, không khối màu nền/masonry
// lệch cột như bản "Liquid Glass" trước đây.
(function () {
  "use strict";

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  onReady(function () {
    // Đổi cách hiển thị từng gallery: lưới gọn hoặc xem từng ảnh lớn.
    var galleries = document.querySelectorAll(".post-gallery");
    galleries.forEach(function (gallery) {
      var controls = document.createElement("div");
      controls.className = "gallery-controls";
      controls.innerHTML = '<span>Hiển thị</span>' +
        '<button type="button" class="gallery-mode-btn is-active" data-mode="grid" title="Hiển thị dạng lưới">Lưới</button>' +
        '<button type="button" class="gallery-mode-btn" data-mode="single" title="Xem từng ảnh một">Từng ảnh</button>' +
        '<button type="button" class="gallery-mode-btn" data-mode="stack" title="Xếp chồng các ảnh">Xếp chồng</button>' +
        '<button type="button" class="gallery-mode-btn" data-mode="masonry" title="Hiển thị kiểu masonry">Masonry</button>' +
        '<button type="button" class="gallery-mode-btn" data-mode="film" title="Xem dạng dải phim ngang">Film strip</button>';
      if (gallery.querySelectorAll("figure").length === 2) {
        controls.innerHTML += '<button type="button" class="gallery-mode-btn" data-mode="compare" title="So sánh 2 ảnh cạnh nhau">So sánh</button>';
      }
      gallery.parentNode.insertBefore(controls, gallery);

      controls.querySelectorAll(".gallery-mode-btn").forEach(function (button) {
        button.addEventListener("click", function () {
          var mode = button.dataset.mode;
          ["single", "stack", "masonry", "film", "compare"].forEach(function (name) {
            gallery.classList.toggle("gallery-mode-" + name, mode === name);
          });
          controls.querySelectorAll(".gallery-mode-btn").forEach(function (item) {
            var active = item === button;
            item.classList.toggle("is-active", active);
            item.setAttribute("aria-pressed", String(active));
          });
        });
      });
    });

    // Lightbox dùng chung: bấm ảnh phóng to, chuyển ảnh bằng nút hoặc phím.
    function attachLightbox(images) {
      images.forEach(function (image) {
        if (!image.title) image.title = "Bấm để phóng to";
      });

      function openLightbox(startIndex) {
        var index = startIndex;
        var lightbox = document.createElement("div");
        lightbox.className = "gallery-lightbox";
        lightbox.setAttribute("role", "dialog");
        lightbox.setAttribute("aria-modal", "true");
        lightbox.innerHTML =
          '<button type="button" class="gallery-lightbox-prev" aria-label="Ảnh trước" title="Ảnh trước"><i class="fas fa-chevron-left" aria-hidden="true"></i></button>' +
          '<button type="button" class="gallery-lightbox-close" aria-label="Đóng" title="Đóng"><i class="fas fa-times" aria-hidden="true"></i></button>' +
          '<img alt="">' +
          '<button type="button" class="gallery-lightbox-next" aria-label="Ảnh tiếp theo" title="Ảnh tiếp theo"><i class="fas fa-chevron-right" aria-hidden="true"></i></button>';

        var lightboxImage = lightbox.querySelector("img");
        var previousButton = lightbox.querySelector(".gallery-lightbox-prev");
        var nextButton = lightbox.querySelector(".gallery-lightbox-next");

        function showImage(nextIndex) {
          index = (nextIndex + images.length) % images.length;
          lightboxImage.src = images[index].currentSrc || images[index].src;
          lightboxImage.alt = images[index].alt || "";
          previousButton.hidden = images.length < 2;
          nextButton.hidden = images.length < 2;
        }

        function closeLightbox() {
          lightbox.remove();
          document.removeEventListener("keydown", handleKeydown);
        }

        function handleKeydown(event) {
          if (event.key === "Escape") closeLightbox();
          if (event.key === "ArrowLeft" && images.length > 1) showImage(index - 1);
          if (event.key === "ArrowRight" && images.length > 1) showImage(index + 1);
        }

        lightbox.addEventListener("click", function (event) {
          if (event.target === lightbox) closeLightbox();
          if (event.target.closest(".gallery-lightbox-prev")) showImage(index - 1);
          if (event.target.closest(".gallery-lightbox-next")) showImage(index + 1);
          if (event.target.closest(".gallery-lightbox-close")) closeLightbox();
        });
        document.body.appendChild(lightbox);
        showImage(index);
        document.addEventListener("keydown", handleKeydown);
        lightbox.querySelector(".gallery-lightbox-close").focus();
      }

      images.forEach(function (image, index) {
        image.addEventListener("click", function () {
          openLightbox(index);
        });
      });
    }

    // Gallery: gắn lightbox riêng cho từng cụm.
    document.querySelectorAll(".post-gallery").forEach(function (gallery) {
      attachLightbox(Array.prototype.slice.call(gallery.querySelectorAll("img")));
    });

    // Ảnh rời trong nội dung bài: gom thành 1 nhóm để lướt qua lại được.
    var contentImages = Array.prototype.slice.call(
      document.querySelectorAll(".post-body img, .post-container img")
    ).filter(function (image) {
      return !image.closest(".post-gallery") && !image.closest(".athlete-card") && !image.closest("a");
    });
    if (contentImages.length) attachLightbox(contentImages);

    // Lọc bài viết và đổi giữa chế độ lưới/danh sách trên trang chủ.
    var homeControls = document.querySelector(".home-controls");
    var postsList = document.querySelector(".posts-list");
    if (homeControls && postsList) {
      var search = document.getElementById("home-post-search");
      var tabButtons = document.querySelectorAll(".home-tab[data-tag]");
      var totalCount = document.getElementById("home-post-total");
      var modeButtons = homeControls.querySelectorAll(".home-mode-btn");
      var cards = postsList.querySelectorAll(".post-preview");
      var selectedTag = "";
      var displayMode = "grid";
      var restoringUrl = false;
      var masonryFrame;
      var supportsMasonry = !!homeControls.querySelector('[data-mode="masonry"]');

      function layoutMasonry() {
        cancelAnimationFrame(masonryFrame);
        masonryFrame = requestAnimationFrame(function () {
          var active = displayMode === "masonry" && window.innerWidth > 640;
          cards.forEach(function (card) {
            card.style.gridRowEnd = active && !card.hidden ?
              "span " + Math.ceil(card.querySelector("article").offsetHeight + 34) : "";
          });
        });
      }

      if (supportsMasonry) {
        window.addEventListener("resize", layoutMasonry);
        postsList.addEventListener("load", layoutMasonry, true);
        if ("ResizeObserver" in window) {
          var masonryObserver = new ResizeObserver(layoutMasonry);
          cards.forEach(function (card) { masonryObserver.observe(card.querySelector("article")); });
        }
        if (document.fonts) document.fonts.ready.then(layoutMasonry);
      }

      function updatePostsUrl(replace) {
        if (restoringUrl) return;
        var url = new URL(window.location.href);
        if (selectedTag) url.searchParams.set("category", selectedTag);
        else url.searchParams.delete("category");
        url.searchParams.set("view", displayMode);
        if (search.value.trim()) url.searchParams.set("q", search.value);
        else url.searchParams.delete("q");
        if (url.href !== window.location.href) {
          window.history[replace ? "replaceState" : "pushState"](null, "", url.href);
        }
      }

      function restorePostsUrl() {
        restoringUrl = true;
        var params = new URL(window.location.href).searchParams;
        var category = (params.get("category") || "").toLowerCase();
        var validCategory = Array.from(tabButtons).some(function (button) {
          return button.dataset.tag === category;
        });
        search.value = params.get("q") || "";
        setTag(validCategory ? category : "");
        var savedMode;
        try { savedMode = localStorage.getItem("yedas-home-display-mode"); } catch (error) {}
        var mode = params.get("view") || savedMode;
        setDisplayMode(mode === "list" || (mode === "masonry" && supportsMasonry) ? mode : "grid");
        restoringUrl = false;
      }
      var PAGE_SIZE = 24;
      var visibleLimit = PAGE_SIZE;
      var moreBtn = document.getElementById("posts-load-more");

      function filterPosts() {
        var query = (search.value || "").trim().toLowerCase();
        var matched = 0;
        cards.forEach(function (card) {
          var title = (card.dataset.postTitle || "").toLowerCase();
          var category = (card.dataset.postCategory || "").toLowerCase();
          var tags = (card.dataset.postTags || "").toLowerCase();
          var matches = (!query || title.indexOf(query) !== -1) &&
            (!selectedTag || category === selectedTag ||
              (!category && tags.split(",").indexOf(selectedTag) !== -1));
          card.hidden = !matches || matched >= visibleLimit;
          if (matches) matched++;
        });
        layoutMasonry();
        var shown = Math.min(matched, visibleLimit);
        if (totalCount) {
          var unit = totalCount.dataset.unit || "bài viết";
          totalCount.textContent = matched > shown ? shown + "/" + matched + " " + unit : matched + " " + unit;
        }
        if (moreBtn) moreBtn.hidden = matched <= shown;
        var empty = document.getElementById("posts-empty");
        if (empty) {
          empty.hidden = matched !== 0;
          if (!matched) {
            var topic = Array.from(document.querySelectorAll(".posts-empty-topic")).find(function (item) {
              return item.dataset.tag === selectedTag;
            });
            document.getElementById("posts-empty-icon").className = "fas fa-" + (query ? "search" : (topic ? topic.dataset.icon : "book-open"));
            document.getElementById("posts-empty-title").textContent = query ? empty.dataset.searchTitle : (topic ? topic.dataset.title : empty.dataset.title);
            document.getElementById("posts-empty-description").textContent = query ? empty.dataset.searchDescription : (topic ? topic.dataset.description : empty.dataset.description);
          }
        }
      }

      function resetLimit() {
        visibleLimit = PAGE_SIZE;
        filterPosts();
      }

      function setTag(tag) {
        selectedTag = tag.toLowerCase();
        tabButtons.forEach(function (button) {
          var active = button.dataset.tag === tag;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", String(active));
        });
        resetLimit();
        updatePostsUrl(false);
      }

      var emptyReset = document.getElementById("posts-empty-reset");
      if (emptyReset) {
        emptyReset.addEventListener("click", function () {
          search.value = "";
          setTag("");
        });
      }

      function setDisplayMode(mode) {
        displayMode = mode;
        postsList.classList.toggle("posts-list-mode-list", mode === "list");
        postsList.classList.toggle("posts-list-mode-masonry", mode === "masonry" && supportsMasonry);
        layoutMasonry();
        modeButtons.forEach(function (button) {
          var active = button.dataset.mode === mode;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", String(active));
        });
        try { localStorage.setItem("yedas-home-display-mode", mode); } catch (error) {}
        updatePostsUrl(false);
      }

      search.addEventListener("input", function () {
        resetLimit();
        updatePostsUrl(true);
      });
      if (moreBtn) {
        moreBtn.addEventListener("click", function () {
          visibleLimit += PAGE_SIZE;
          filterPosts();
        });
      }
      tabButtons.forEach(function (button) {
        button.addEventListener("click", function () { setTag(button.dataset.tag); });
      });
      modeButtons.forEach(function (button) {
        button.addEventListener("click", function () { setDisplayMode(button.dataset.mode); });
      });
      window.addEventListener("popstate", restorePostsUrl);
      restorePostsUrl();
      updatePostsUrl(true);
    }

    // Hiện tiêu đề và mô tả ngắn đè lên ảnh khi rê chuột.
    var postImages = document.querySelectorAll(".post-body img");
    postImages.forEach(function (image) {
      var imageBlock = image.closest("p");
      if (!imageBlock || imageBlock.querySelector(".post-photo-overlay")) return;

      var heading = imageBlock.previousElementSibling;
      var description = heading && heading.tagName === "P" ? heading : null;
      var title = description ? description.previousElementSibling : heading;
      var overlayTitle = title && title.tagName === "H3" ? title.textContent.trim() : "";
      var overlayText = description ? description.textContent.trim() : "";
      if (!overlayTitle && !overlayText) return;

      imageBlock.classList.add("post-photo-block");
      var overlay = document.createElement("span");
      overlay.className = "post-photo-overlay";
      if (overlayTitle) {
        var titleElement = document.createElement("strong");
        titleElement.textContent = overlayTitle;
        overlay.appendChild(titleElement);
      }
      if (overlayText) {
        var textElement = document.createElement("span");
        textElement.textContent = overlayText;
        overlay.appendChild(textElement);
      }
      imageBlock.appendChild(overlay);
    });

    // Cho phép chuyển nhanh giữa chế độ xem ảnh/tiêu đề và toàn bộ nội dung.
    var postToggle = document.querySelector(".post-view-toggle-btn");
    var postBody = document.querySelector(".post-body");
    if (postToggle && postBody) {
      var storageKey = "yedas-post-view:" + window.location.pathname;
      var isCompact = localStorage.getItem(storageKey) === "compact";

      function updatePostView() {
        document.body.classList.toggle("post-compact-view", isCompact);
        postToggle.setAttribute("aria-pressed", String(isCompact));
      }

      postToggle.addEventListener("click", function () {
        isCompact = !isCompact;
        localStorage.setItem(storageKey, isCompact ? "compact" : "full");
        updatePostView();
      });
      updatePostView();
    }

    // Tooltip kiểu Bootstrap cho mọi element có attribute `title` — gắn
    // delegated trên body nên element tạo động sau (nút gallery, lightbox,
    // nút playlist...) cũng được tooltip mà không cần init lại. Site đã load
    // sẵn jQuery + Popper + bootstrap.js trong footer-scripts.
    if (window.jQuery && jQuery.fn.tooltip) {
      // Trigger nằm trong navbar `position: fixed`: Popper mặc định tính vị
      // trí theo document nên tooltip bị lệch đúng bằng khoảng scroll đã
      // cuộn - cần positionFixed để tính theo viewport.
      jQuery("body").tooltip({
        selector: ".navbar-custom [title]",
        trigger: "hover",
        container: "body",
        boundary: "window",
        popperConfig: { positionFixed: true }
      });

      jQuery("body").tooltip({
        selector: "[title]:not(.navbar-custom [title]):not(.footer-icon-link)",
        trigger: "hover",
        container: "body",
        boundary: "window"
      });

      // 2 icon link cuối footer: init tường minh + ép placement top để
      // tooltip luôn bật lên trên (footer nằm sát cuối trang, để auto dễ
      // bị flip xuống bottom tràn viewport gây giật trang).
      jQuery(".footer-icon-link[title]").tooltip({
        placement: "top",
        container: "body",
        boundary: "window"
      });
    }

    // 1) Hero: chọn ngẫu nhiên 1 trong các ảnh (window.HERO_IMAGES, tránh lặp
    // lại ảnh vừa xem lần trước), rồi zoom nhẹ 1 lần (Ken Burns), không lặp.
    var hero = document.querySelector(".header-section.has-img .big-img.intro-header");
    if (hero) {
      var bannerImages = document.getElementById("banner-images");
      if (bannerImages) {
        var bannerIndex = 0;
        var bannerCount = Number(bannerImages.dataset.numImg);
        var bannerDots = hero.querySelectorAll("[data-banner-index]");
        function showBanner(index) {
          bannerIndex = (index + bannerCount) % bannerCount;
          hero.style.backgroundImage = 'url("' + bannerImages.getAttribute("data-img-src-" + (bannerIndex + 1)) + '")';
          bannerDots.forEach(function (dot, i) {
            dot.setAttribute("aria-pressed", String(i === bannerIndex));
          });
        }
        hero.querySelectorAll("[data-banner-step]").forEach(function (button) {
          button.addEventListener("click", function () {
            showBanner(bannerIndex + Number(button.dataset.bannerStep));
          });
        });
        bannerDots.forEach(function (dot) {
          dot.addEventListener("click", function () {
            showBanner(Number(dot.dataset.bannerIndex));
          });
        });
        showBanner(0);
      }
      var images = window.HERO_IMAGES;
      if (Array.isArray(images) && images.length > 0) {
        var prev = sessionStorage.getItem("heroImagePrev");
        var choices = images.length > 1 ? images.filter(function (src) { return src !== prev; }) : images;
        var chosen = choices[Math.floor(Math.random() * choices.length)];
        hero.style.backgroundImage = 'url("' + chosen + '")';
        sessionStorage.setItem("heroImagePrev", chosen);
      }
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          hero.classList.add("kenburns-settle");
        });
      });
    }

    // 2) Fade-in-up khi cuộn tới, chỉ chạy 1 lần cho mỗi phần tử.
    var revealTargets = document.querySelectorAll(
      ".landing-intro, .latest-heading, .posts-list li.post-preview, .pagination.main-pager, .featured-stories-heading, .featured-story-card, .home-info-card, .athlete-card, .athlete-index-card"
    );
    revealTargets.forEach(function (el) {
      el.classList.add("reveal");
    });

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      revealTargets.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Không hỗ trợ IntersectionObserver: hiện luôn, không animate.
      revealTargets.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }

    // Stagger nhẹ cho các thẻ trong lưới bài viết.
    document.querySelectorAll(".posts-list li.post-preview").forEach(function (li, i) {
      li.style.transitionDelay = Math.min(i * 80, 320) + "ms";
    });

    // Toggle so sánh trước/sau trong bài viết.
    initBeforeAfterToggles();

    // Homepage: lọc bài viết tiêu biểu theo tag + dots điều hướng section.
    initFeaturedStories();
    initHomeSectionDots();
  });

  // Lọc card "Bài viết tiêu biểu" trên trang chủ theo tag của nút bấm;
  // mỗi nhóm hiện tối đa 4 bài mới nhất.
  function initFeaturedStories() {
    var section = document.querySelector(".featured-stories");
    if (!section) return;
    var filters = section.querySelectorAll(".featured-filter");
    var cards = Array.prototype.slice.call(section.querySelectorAll(".featured-story-card"));
    if (!filters.length) return;

    function select(tag) {
      var selectedTags = tag.split(",");
      var shown = 0;
      cards.forEach(function (card) {
        var cardTags = (card.getAttribute("data-featured-tags") || "").split(",");
        var matches = selectedTags.some(function (selectedTag) {
          return cardTags.indexOf(selectedTag) !== -1;
        });
        card.hidden = !matches || shown >= 4;
        if (matches && shown < 4) shown += 1;
      });
      filters.forEach(function (filter) {
        var active = filter.getAttribute("data-featured-tag") === tag;
        filter.classList.toggle("is-active", active);
        filter.setAttribute("aria-selected", active ? "true" : "false");
      });
    }

    filters.forEach(function (filter) {
      filter.addEventListener("click", function () {
        select(filter.getAttribute("data-featured-tag"));
      });
    });
    select(filters[0].getAttribute("data-featured-tag"));
  }

  // Các chấm điều hướng bên phải trang chủ: tự tô sáng theo section đang xem.
  function initHomeSectionDots() {
    var sections = document.querySelectorAll("[data-home-section]");
    var dots = document.querySelectorAll("[data-home-dot]");
    if (!sections.length || !dots.length) return;

    var ticking = false;
    function update() {
      var marker = window.innerHeight * 0.35;
      var current = sections[0].getAttribute("data-home-section");
      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= marker) {
          current = section.getAttribute("data-home-section");
        }
      });
      dots.forEach(function (dot) {
        var active = dot.getAttribute("data-home-dot") === current;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-current", active ? "true" : "false");
      });
      ticking = false;
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();
  }

  function initBeforeAfterToggles() {
    document.querySelectorAll("[data-ba-toggle]").forEach(function (toggle) {
      var img = toggle.querySelector("img");
      var caption = toggle.querySelector(".ba-caption");
      var buttons = toggle.querySelectorAll(".ba-btn");

      function setMode(btn) {
        var mode = btn.dataset.mode;
        var captions = {
          before: img.dataset.beforeCaption || "",
          after: img.dataset.afterCaption || "",
          compare: img.dataset.compareCaption || ""
        };

        img.src = img.dataset[mode] || img.dataset.before;
        if (caption) caption.textContent = captions[mode] || "";

        buttons.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
      }

      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () { setMode(btn); });
      });
    });
  }
})();
