/* Nút chuyển Sáng/Tối trên navbar.
   Lưu lựa chọn vào localStorage ('yedas-theme') và đặt lại data-theme trên
   <html>. Việc áp theme lúc tải trang nằm trong _includes/theme-init.html
   (chạy sớm trong <head> để tránh flash). */
(function () {
  document.addEventListener('click', function (event) {
    var btn = event.target.closest('.theme-toggle-btn');
    if (!btn) return;
    var current = document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'dark' : 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('yedas-theme', next); } catch (e) {}
  });
})();
