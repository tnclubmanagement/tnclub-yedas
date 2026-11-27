const test = require('node:test');
const assert = require('node:assert/strict');
const W = require('../assets/js/map-weather.js');

test('WMO weather codes map to weather kinds', () => {
  const cases = { 0: 'clear', 1: 'partly', 2: 'partly', 3: 'cloudy', 45: 'fog', 48: 'fog', 51: 'drizzle',
    57: 'drizzle', 61: 'rain', 67: 'rain', 80: 'rain', 82: 'rain', 71: 'snow', 77: 'snow', 85: 'snow',
    86: 'snow', 95: 'storm', 99: 'storm', 4: '' };
  Object.entries(cases).forEach(([code, kind]) => assert.equal(W.kindFromCode(Number(code)), kind, `code ${code}`));
});

test('daytime sun and clouds, night swaps sun for moon and drops the sun sweep', () => {
  assert.deepEqual(W.fxPlan({ kind: 'partly', day: true, wind: 5 }), { kind: 'partly', parts: ['sun', 'cloud'] });
  assert.deepEqual(W.fxPlan({ kind: 'partly', day: false, wind: 5 }), { kind: 'night', parts: ['moon', 'cloud'] });
  assert.deepEqual(W.fxPlan({ kind: 'rain', day: false, wind: 5 }).kind, 'rain');
  assert.deepEqual(W.fxPlan({ kind: 'storm', day: true }).parts, ['rain-cloud', 'rain-cloud', 'bolt']);
});

test('leaves fly only from the windy threshold', () => {
  const leaves = wind => W.fxPlan({ kind: 'clear', day: true, wind }).parts.filter(p => p === 'wind').length;
  assert.equal(leaves(W.WINDY - 1), 0);
  assert.equal(leaves(W.WINDY), 3);
  assert.deepEqual(W.fxPlan({ kind: '', day: true, wind: 2 }), { kind: '', parts: [] });
});

test('badge icon follows day and night', () => {
  assert.equal(W.badgeIcon({ kind: 'clear', day: true }), 'fa-sun');
  assert.equal(W.badgeIcon({ kind: 'clear', day: false }), 'fa-moon');
  assert.equal(W.badgeIcon({ kind: 'rain', day: false }), 'fa-cloud-showers-heavy');
  assert.equal(W.badgeIcon({ kind: '' }), '');
});
