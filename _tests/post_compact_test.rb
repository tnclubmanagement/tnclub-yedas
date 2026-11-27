require 'json'
require 'open3'
require 'tmpdir'
require 'cgi'

chrome = ENV.fetch('CHROME_BIN', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
css = File.read(File.expand_path('../assets/css/post.css', __dir__))
html = <<~HTML
  <!doctype html>
  <html><head><meta charset="utf-8"><style>#{css}</style></head><body>
    <div class="post-meta" id="meta">Metadata</div>
    <article class="blog-post post-body">
      <p id="intro">Introduction</p>
      <h2 id="food-heading">Food heading</h2>
      <div class="coffee-media-row" id="food-row">
        <div class="coffee-media-text" id="food-text"><p>Instructions</p></div>
        <figure><img id="food-image" alt="Food"><figcaption id="food-credit">Credit</figcaption></figure>
      </div>
      <h2 id="left-heading">Left image heading</h2>
      <div class="coffee-media-row coffee-media-row-left" id="left-row">
        <div class="coffee-media-text" id="left-text"><p>Instructions</p></div>
        <figure><img id="left-image" alt="Food"></figure>
      </div>
      <h3 id="tip-heading">Tip heading</h3>
      <p id="tip-text">Tip instructions</p>
      <p><img id="tip-image" alt="Tip"></p>
      <figure id="standalone"><img id="standalone-image" alt="Standalone"></figure>
      <div class="photo-grid" id="grid"><figure><img id="grid-image" alt="Grid"></figure></div>
      <div class="post-gallery" id="gallery"><figure><img id="gallery-image" alt="Gallery"><figcaption id="gallery-credit">Credit</figcaption></figure></div>
      <div class="gallery-controls" id="controls">Controls</div>
    </article>
    <script>
      var failures = [];
      function visible(id) {
        var node = document.getElementById(id);
        while (node) {
          if (getComputedStyle(node).display === 'none') return false;
          node = node.parentElement;
        }
        return true;
      }
      function expect(id, wanted) {
        if (visible(id) !== wanted) failures.push(id + ': expected visible=' + wanted);
      }
      function checkFull() {
        document.body.classList.remove('post-compact-view');
        ['intro', 'food-heading', 'food-image', 'food-text', 'food-credit', 'left-image', 'left-text', 'tip-heading', 'tip-text', 'tip-image', 'standalone-image', 'grid-image', 'gallery-image', 'gallery-credit'].forEach(function(id) { expect(id, true); });
      }
      checkFull();
      document.body.classList.add('post-compact-view');
      ['food-heading', 'food-image', 'left-heading', 'left-image', 'tip-heading', 'tip-image', 'standalone-image', 'grid-image', 'gallery-image', 'controls'].forEach(function(id) { expect(id, true); });
      ['meta', 'intro', 'food-text', 'food-credit', 'left-text', 'tip-text', 'gallery-credit'].forEach(function(id) { expect(id, false); });
      ['stack', 'masonry', 'film'].forEach(function(mode) {
        document.getElementById('gallery').className = 'post-gallery gallery-mode-' + mode;
        expect('gallery-image', true);
      });
      checkFull();
      var result = document.createElement('pre');
      result.id = 'result';
      result.textContent = JSON.stringify(failures);
      document.body.appendChild(result);
    </script>
  </body></html>
HTML

Dir.mktmpdir('yedas-compact-test') do |dir|
  path = File.join(dir, 'index.html')
  File.write(path, html)
  [1280, 390].each do |width|
    output, errors, status = Open3.capture3(chrome, '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-search-engine-choice-screen', '--disable-background-networking', '--disable-extensions', "--window-size=#{width},900", '--dump-dom', "file://#{path}")
    raise "Chrome failed: #{errors}" unless status.success?
    result = output[/<pre id="result">(.*?)<\/pre>/m, 1]
    raise 'Missing browser test result' unless result
    failures = JSON.parse(CGI.unescapeHTML(result))
    raise "Compact view failed at #{width}px: #{failures.join(', ')}" unless failures.empty?
  end
end

puts 'Compact view tests passed: food rows, headings, figures, grids, galleries and full-view restoration at desktop/mobile widths'
