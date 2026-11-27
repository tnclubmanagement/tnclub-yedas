const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function render(pins) {
  const context = { window: {}, document: { addEventListener() {} } };
  const source = fs.readFileSync('assets/js/site-map.js', 'utf8')
    .replace('  function initMap() {', '  window.renderCluster = buildClusterPopup;\n  function initMap() {');
  vm.runInNewContext(source, context);
  return context.window.renderCluster(pins.map(d => ({ d })), { Vietnam: 'Việt Nam' });
}

function food(title, region = 'Miền Trung') {
  return { kind: 'place', topic: 'food', title, name: 'Huế', country: 'Vietnam', region, avatar: '/food.jpg' };
}

test('shared food prefix and location appear once, leaving full dish titles', () => {
  const html = render([
    food('[03 · Ăn ngon miền Trung] : Bánh bèo, nậm, lọc ở Huế'),
    food('[04 · Ăn ngon miền Trung] : Cơm hến và bữa hải sản xứ Huế'),
    food('[05 · Ăn ngon miền Trung] : Nem lụi và bánh khoái Huế')
  ]);
  assert.equal((html.match(/Ăn ngon miền Trung/g) || []).length, 1);
  assert.equal((html.match(/Việt Nam · Miền Trung/g) || []).length, 1);
  assert.ok(html.includes('<strong>Bánh bèo, nậm, lọc ở Huế</strong>'));
  assert.ok(html.includes('<strong>Cơm hến và bữa hải sản xứ Huế</strong>'));
  assert.ok(!html.includes('[03'));
  assert.ok(html.includes('data-idx="0"'));
  assert.ok(html.includes('data-idx="2"'));
});

test('mixed series stay separate without changing click indexes', () => {
  const html = render([
    food('[03 · Ăn ngon miền Trung] : Bánh bèo'),
    food('[01 · Cà phê Việt] : Cà phê muối'),
    food('[04 · Ăn ngon miền Trung] : Cơm hến')
  ]);
  assert.equal((html.match(/Ăn ngon miền Trung/g) || []).length, 1);
  assert.ok(html.includes('Cà phê Việt'));
  assert.match(html, /data-idx="2"[\s\S]*?<strong>Cơm hến<\/strong>/);
  assert.match(html, /data-idx="1"[\s\S]*?<strong>Cà phê muối<\/strong>/);
});

test('unprefixed food, travel and athletes keep their labels', () => {
  const html = render([
    food('Một bữa ăn ở Huế'),
    { kind: 'place', topic: 'travel', name: 'Hà Nội', country: 'Vietnam', region: 'Miền Bắc' },
    { kind: 'athlete', name: 'Athlete', event: 'Singles', country: 'Vietnam' }
  ]);
  assert.ok(html.includes('<strong>Một bữa ăn ở Huế</strong>'));
  assert.ok(html.includes('<strong>Hà Nội</strong>'));
  assert.ok(html.includes('Singles · Việt Nam'));
});

test('group headings, labels and attributes escape markup', () => {
  const pin = food('[01 · <Series>] : <img onerror="bad">');
  pin.avatar = '/image.jpg" onerror="bad';
  const html = render([pin]);
  assert.ok(html.includes('&lt;Series&gt;'));
  assert.ok(html.includes('&lt;img onerror=&quot;bad&quot;&gt;'));
  assert.ok(!html.includes('<img onerror='));
  assert.ok(!html.includes('src="/image.jpg" onerror='));
});
