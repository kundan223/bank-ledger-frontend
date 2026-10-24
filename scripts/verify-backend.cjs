// Creates disposable users/accounts. Run only against a local test database.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const load = require('../tests/load-api.cjs');
const origin = process.env.TEST_FRONTEND_URL;
if (!origin || !['localhost', '127.0.0.1'].includes(new URL(origin).hostname)) throw new Error('Set TEST_FRONTEND_URL to a local frontend connected to a disposable backend.');
const { api, storage, money } = load((url, options) => fetch(new URL(url, origin), options));
function ok(result) { assert.equal(result.response.ok, true, JSON.stringify(result.data)); return result.data; }
async function main() {
  const tag = randomUUID();
  const password = randomUUID();
  const alice = ok(await api.register(`folio-alice-${tag}@example.test`, password));
  storage.set('token', alice.token);
  const source = ok(await api.createAccount('Office operating · integration test'));
  assert.equal(source.currency, 'USD');
  assert.equal(source.owner_id, alice.user_id);
  ok(await api.deposit(source.id, '100.1234'));
  ok(await api.withdraw(source.id, '0.0001'));
  const bob = ok(await api.register(`folio-bob-${tag}@example.test`, password));
  storage.set('token', bob.token);
  const destination = ok(await api.createAccount('Recipient · integration test'));
  storage.set('token', alice.token);
  ok(await api.transfer(source.id, destination.id, '3.0001'));
  assert.equal(ok(await api.getAccount(source.id)).balance, '97.1232');
  assert.equal(ok(await api.reconcileAccount(source.id)).matched, true);
  assert.equal((await api.withdraw(source.id, '1000')).response.status, 400);
  const entries = await api.getAllEntries(source.id);
  assert.equal(entries.length, 3);
  assert.equal(entries.some(entry => entry.operation_type === 'withdrawal'), true);
  const transaction = ok(await api.getTransaction(entries[0].transaction_id));
  assert.equal(transaction.length, 2);
  assert.equal(money.sumAmounts(transaction.map(entry => entry.debit)), money.sumAmounts(transaction.map(entry => entry.credit)));
  // Cross the server's 100-entry page cap using real ledger operations.
  for (let i = 0; i < 101; i++) ok(await api.deposit(source.id, '0.0001'));
  assert.equal((await api.getAllEntries(source.id)).length, 104);
  assert.equal(ok(await api.getAccount(source.id)).balance, '97.1333');
  assert.equal(ok(await api.reconcileAccount(source.id)).matched, true);
  storage.set('token', bob.token);
  assert.equal((await api.getAccount(source.id)).response.status, 403);
  assert.equal(ok(await api.getAccount(destination.id)).balance, '3.0001');
  assert.equal(ok(await api.reconcileAccount(destination.id)).matched, true);
  ok(await api.login(`folio-alice-${tag}@example.test`, password));
  console.log('PASS: frontend proxy + real backend: registration, login, account creation/detail, four-place deposits, withdrawals, cross-user transfer, ownership, insufficient funds, 104-entry pagination, balanced transaction detail and reconciliation.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
