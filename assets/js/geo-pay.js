// Nếu khách truy cập từ nước ngoài (không phải VN) thì hiện thêm ghi chú
// "MoMo chỉ hỗ trợ VN" bên cạnh block MoMo — không bao giờ ẩn nội dung
// chính, vì định vị IP có thể nhận diện sai quốc gia.
// Dùng ipwho.is (free, không key), cache localStorage 24h.
(function () {
  var KEY = "yedas-geo-cc";
  var TTL = 24 * 60 * 60 * 1000;

  function mark(cc) {
    if (cc === "VN") return;
    var intlBlocks = document.querySelectorAll(".geo-intl");
    for (var j = 0; j < intlBlocks.length; j++) {
      intlBlocks[j].classList.add("geo-show");
    }
  }

  try {
    var cached = JSON.parse(localStorage.getItem(KEY));
    if (cached && Date.now() - cached.t < TTL) {
      mark(cached.cc);
      return;
    }
  } catch (e) {}

  fetch("https://ipwho.is/")
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var cc = d && d.success ? d.country_code : "VN";
      try {
        localStorage.setItem(KEY, JSON.stringify({ cc: cc, t: Date.now() }));
      } catch (e) {}
      mark(cc);
    })
    .catch(function () {});
})();
