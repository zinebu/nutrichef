const test = require('node:test');
const assert = require('node:assert/strict');

const { getUserScopedStorageKey } = require('./storage-scopes.js');

test('scopes local storage per account to avoid cross-user leakage', () => {
  assert.equal(getUserScopedStorageKey('cherry_recipes', 'user-123'), 'cherry_recipes:user-123');
  assert.equal(getUserScopedStorageKey('cherry_recipes', null), 'cherry_recipes:local');
  assert.equal(getUserScopedStorageKey('cherry_recipes', undefined), 'cherry_recipes:local');
});
