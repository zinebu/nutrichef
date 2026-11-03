const test = require('node:test');
const assert = require('node:assert/strict');

const { isVisibleToFriends, filterVisibleToFriends } = require('./recipe-visibility.js');

test('friend-visible recipes exclude breakfast and snack categories', () => {
  assert.equal(isVisibleToFriends('petit_dejeuner'), false);
  assert.equal(isVisibleToFriends('snack'), false);
  assert.equal(isVisibleToFriends('dejeuner'), true);
  assert.equal(isVisibleToFriends('diner'), true);
  assert.equal(isVisibleToFriends('dessert'), true);
});

test('shared recipe lists hide breakfast and snack items', () => {
  const recipes = [
    { id: '1', category: 'dejeuner' },
    { id: '2', category: 'petit_dejeuner' },
    { id: '3', category: 'snack' },
    { id: '4', category: 'dessert' },
  ];

  assert.deepEqual(
    filterVisibleToFriends(recipes).map((recipe) => recipe.id),
    ['1', '4']
  );
});
