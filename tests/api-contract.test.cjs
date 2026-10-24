const { test } = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-api.cjs');

test('NUMERIC(19,4) values preserve exact precision and reject invalid payments', () => {
  const { money } = load();
  assert.equal(money.paymentAmount('900719925474099.1234'), '900719925474099.1234');
  assert.equal(money.sumAmounts(['0.1001', '0.2002']), '0.3003');
  assert.equal(money.formatMoney('900719925474099.1234'), '$900,719,925,474,099.1234');
  assert.equal(money.formatMoney('10'), '$10.00');
  for (const invalid of ['0', '-1', '0.00001', '1e3', '1000000000000000']) assert.throws(() => money.paymentAmount(invalid));
});

test('client sends backend field names, decimal strings, and protected Bearer auth', async () => {
  const calls = [];
  const { api, storage } = load(async (url, options) => {
    calls.push({ url, options });
    return Response.json({ message: 'ok' });
  });
  storage.set('token', 'test-session');
  await api.createAccount('Office');
  await api.deposit('source', '125.0001');
  await api.withdraw('source', '0.0001');
  await api.transfer('source', 'recipient', '25.1234');
  await api.login('test@example.test', 'password');
  assert.deepEqual(JSON.parse(calls[0].options.body), { name: 'Office' });
  assert.deepEqual(JSON.parse(calls[1].options.body), { amount: '125.0001' });
  assert.equal(calls[2].url, '/accounts/source/withdraw');
  assert.deepEqual(JSON.parse(calls[3].options.body), { from_id: 'source', to_id: 'recipient', amount: '25.1234' });
  assert.equal(calls[3].options.headers.Authorization, 'Bearer test-session');
  assert.equal(calls[4].options.headers.Authorization, undefined);
});

test('history retrieves every server page rather than silently stopping at twenty', async () => {
  const calls = [];
  const { api } = load(async url => {
    calls.push(url);
    const offset = Number(new URL(url, 'http://localhost').searchParams.get('offset'));
    return Response.json(Array.from({ length: offset === 0 ? 100 : 5 }, (_, i) => ({ id: String(offset + i) })));
  });
  const entries = await api.getAllEntries('account');
  assert.equal(entries.length, 105);
  assert.deepEqual(calls, ['/accounts/account/entries?limit=100&offset=0', '/accounts/account/entries?limit=100&offset=100']);
});

test('failed history never returns misleading partial totals; expired sessions log out', async () => {
  const { api, storage, events } = load(async () => Response.json({ error: 'access denied' }, { status: 401 }));
  storage.set('token', 'expired');
  await assert.rejects(api.getAllEntries('account'), /Session expired/);
  assert.equal(storage.has('token'), false);
  assert.deepEqual(events, ['auth:logout']);
});
