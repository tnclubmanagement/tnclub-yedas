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
    // 1) Hero: chọn ngẫu nhiên 1 trong các ảnh (window.HERO_IMAGES, tránh lặp
    // lại ảnh vừa xem lần trước), rồi zoom nhẹ 1 lần (Ken Burns), không lặp.
    var hero = document.querySelector(".header-section.has-img .big-img.intro-header");
    if (hero) {
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
      ".landing-intro, .latest-heading, .posts-list li.post-preview, .post-container, .pagination.main-pager"
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
  });

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
