// Stock rules for Stripe checkout. Node strips the TypeScript types: `node --test tests/stock.test.mjs`.
import assert from 'node:assert/strict';
import test from 'node:test';
import { claimed, EDITION_SIZE, inStock, paid } from '../src/lib/stock.ts';

const s = (slug, kind, status, payment_status = status === 'complete' ? 'paid' : 'unpaid') => ({ status, payment_status, metadata: { slug, kind } });

test('an original sells once; an open checkout holds it', () => {
  assert.equal(inStock([], 'pitch', 'original'), true);
  assert.equal(inStock([s('pitch', 'original', 'open')], 'pitch', 'original'), false);
  assert.equal(inStock([s('pitch', 'original', 'complete')], 'pitch', 'original'), false);
  assert.equal(inStock([s('pitch', 'original', 'expired')], 'pitch', 'original'), true, 'an expired checkout releases the hold');
});

test('other works, other kinds and unpaid completions do not count', () => {
  const sessions = [s('bruise', 'original', 'complete'), s('pitch', 'print', 'complete'), s('pitch', 'original', 'complete', 'unpaid'), { status: 'complete', payment_status: 'paid', metadata: null }];
  assert.equal(claimed(sessions, 'pitch', 'original'), 0);
  assert.equal(inStock(sessions, 'pitch', 'original'), true);
});

test('a print edition sells up to its size', () => {
  const nine = Array.from({ length: EDITION_SIZE - 1 }, () => s('pitch', 'print', 'complete'));
  assert.equal(inStock(nine, 'pitch', 'print'), true);
  assert.equal(inStock([...nine, s('pitch', 'print', 'open')], 'pitch', 'print'), false);
});

test('paid() counts settled sales only, for the double-sale warning', () => {
  assert.equal(paid([s('pitch', 'original', 'complete'), s('pitch', 'original', 'open'), s('pitch', 'original', 'complete')], 'pitch', 'original'), 2);
});
