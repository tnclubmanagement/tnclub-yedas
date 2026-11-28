const test = require('node:test');
const assert = require('node:assert/strict');
const MapPins = require('../assets/js/map-pins.js');

const FOOD = ['ăn ngon', 'uống ngon', 'tráng miệng', 'ẩm thực'];

function build(posts, base = '/tnclub-yedas/') {
  return MapPins.build(posts, { base, foodCategories: FOOD });
}

test('athlete post maps front matter to pin fields', () => {
  const [pin] = build([{
    athlete: {
      geo: [10.5, 106.7], name: 'VĐV A', nickname: 'Sấm', country: 'Vietnam',
      born: '01/01/1990', hometown: 'Huế', event: 'Singles', highest_rank: '5',
      skills: ['S1', 'S2'], achievement: 'Gold', height: '1m80', hand: 'Phải',
      debut: '2010', avatar: '/posts/a/avatar.jpg'
    },
    series: 'VĐV Tennis', subtitle: 'Giới thiệu',
    banner: '/posts/a/cover.jpg', url: '/posts/a/',
    contentScore: 8.5
  }]);
  assert.equal(pin.kind, 'athlete');
  assert.equal(pin.lat, 10.5);
  assert.equal(pin.lng, 106.7);
  assert.equal(pin.nick, 'Sấm');
  assert.equal(pin.rank, '5');
  assert.equal(pin.summary, 'Giới thiệu');
  assert.equal(pin.url, '/tnclub-yedas/posts/a/');
  assert.equal(pin.image, '/tnclub-yedas/posts/a/cover.jpg');
  assert.equal(pin.avatar, '/tnclub-yedas/posts/a/avatar.jpg');
  assert.equal(pin.contentScore, 8.5);
});

test('athlete image falls back to avatar when no banner', () => {
  const [pin] = build([{ athlete: { geo: [1, 2], name: 'A', avatar: '/a.jpg' } }], '/');
  assert.equal(pin.image, '/a.jpg');
});

test('absolute image URLs keep their host', () => {
  const [pin] = build([{ geo: [1, 2], banner: 'https://images.example.test/cover.jpg', url: '/p/' }]);
  assert.equal(pin.image, 'https://images.example.test/cover.jpg');
  assert.equal(pin.avatar, 'https://images.example.test/cover.jpg');
});

test('place pin prefers cover over banner and pinAvatar over both', () => {
  const [pin] = build([{
    geo: [1, 2], cover: '/p/thumb.jpg', banner: '/p/cover.jpg',
    pinAvatar: '/p/avatar.jpg', title: 'Huế', url: '/p/'
  }]);
  assert.equal(pin.topic, 'travel');
  assert.equal(pin.image, '/tnclub-yedas/p/thumb.jpg');
  assert.equal(pin.avatar, '/tnclub-yedas/p/avatar.jpg');
});

test('food categories classify regardless of tag case', () => {
  const pins = build([
    { geo: [1, 2], category: 'Ăn Ngon', title: 'Cơm tấm' },
    { geo: [1, 2], category: 'uống ngon', title: 'Cà phê' },
    { geo: [1, 2], category: 'Tráng Miệng', title: 'Chè' },
    { geo: [1, 2], category: 'Du lịch', title: 'Hà Nội' }
  ]);
  assert.deepEqual(pins.map(p => p.topic), ['food', 'food', 'food', 'travel']);
});

test('food region falls back to region tags, normalized to title case', () => {
  const pins = build([
    { geo: [1, 2], category: 'Ăn Ngon', tags: ['Miền Bắc'], title: 'A' },
    { geo: [1, 2], category: 'Uống Ngon', tags: ['miền trung'], title: 'B' },
    { geo: [1, 2], category: 'Tráng miệng', tags: ['miền nam ', 'khác'], title: 'C' }
  ]);
  assert.deepEqual(pins.map(p => p.region), ['Miền Bắc', 'Miền Trung', 'Miền Nam']);
});

test('explicit place_region beats tags and travel posts ignore region tags', () => {
  const pins = build([
    { geo: [1, 2], category: 'Ăn Ngon', placeRegion: 'Vùng tùy chỉnh', tags: ['Miền Bắc'], title: 'A' },
    { geo: [1, 2], category: 'Du lịch', tags: ['Miền Bắc'], title: 'B' }
  ]);
  assert.equal(pins[0].region, 'Vùng tùy chỉnh');
  assert.equal(pins[1].region, '');
});

test('place defaults: Vietnam country, name falls back to title', () => {
  const [pin] = build([{ geo: [1, 2], category: 'Du lịch', title: 'Hà Nội' }]);
  assert.equal(pin.country, 'Vietnam');
  assert.equal(pin.name, 'Hà Nội');
  assert.equal(pin.nick, '');
  assert.equal(pin.series, 'Du lịch');
});

test('EN lang prefix applies to every relative path', () => {
  const posts = [{ geo: [1, 2], banner: '/p/cover.jpg', url: '/p/' }];
  const [vi] = MapPins.build(posts, { base: '/tnclub-yedas/', lang: 'vi', defaultLang: 'vi', foodCategories: FOOD });
  const [en] = MapPins.build(posts, { base: '/tnclub-yedas/', lang: 'en', defaultLang: 'vi', foodCategories: FOOD });
  assert.equal(vi.url, '/tnclub-yedas/p/');
  assert.equal(en.url, '/tnclub-yedas/en/p/');
  assert.equal(en.image, '/tnclub-yedas/en/p/cover.jpg');
  assert.equal(en.avatar, '/tnclub-yedas/en/p/cover.jpg');
});

test('posts without geo are skipped', () => {
  const pins = build([{ title: 'No geo' }, { athlete: { name: 'No geo either' } }]);
  assert.equal(pins.length, 0);
});

test('decode reverses the plugin XOR + base64 obfuscation', () => {
  const key = 'yedas-map-pins-v1';
  const json = JSON.stringify([{ placeName: 'Huế', geo: [1, 2], tags: ['Miền Trung'] }]);
  const encoded = Buffer.from([...Buffer.from(json, 'utf8')].map((b, i) => b ^ key.charCodeAt(i % key.length))).toString('base64');
  assert.ok(!encoded.includes('placeName'));
  assert.deepEqual(MapPins.decode(encoded), JSON.parse(json));
});
