import test from 'ava';
import m from './';

function asserter(t, result) {
  t.is(typeof result, 'object');
  t.is(typeof result.deviceName, 'string');
  t.is(typeof result.modified, 'object');
  t.is(typeof result.tabCount, 'number');
  t.is(typeof result.tabs, 'object');
}

test('Asynchronously return Firefox tabs', t => {
  return m().then(data => {
    asserter(t, data);
  });
});

test('Synchronously return Firefox tabs', t => {
  asserter(t, m.sync());
});

test('uses default profile when profiles.ini contains multiple profiles', t => {
  t.true(m.profilePath({firefoxPath: 'fixtures/'}).indexOf('fixtures/work') !== -1);
});

test('allows selecting a profile by name', t => {
  t.true(m.profilePath({firefoxPath: 'fixtures/', profile: 'work'}).indexOf('fixtures/work') !== -1);
});

test('allows selecting a profile by index', t => {
  t.true(m.profilePath({firefoxPath: 'fixtures/', profile: 0}).indexOf('fixtures/default') !== -1);
});
