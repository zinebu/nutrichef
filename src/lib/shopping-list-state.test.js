const test = require('node:test');
const assert = require('node:assert/strict');

const { toggleShoppingListItem } = require('./shopping-list-state.js');

test('toggling a shopping list item flips the checked state on the matching item', () => {
  const list = {
    id: 'list-1',
    user_id: 'user-42',
    meal_plan_id: null,
    name: 'Liste de courses',
    items: [
      { id: 'a', name: 'Tomates', is_checked: false },
      { id: 'b', name: 'Pain', is_checked: true },
    ],
  };

  const updated = toggleShoppingListItem(list, 'a');
  assert.equal(updated.items[0].is_checked, true);
  assert.equal(updated.items[1].is_checked, true);

  const toggledBack = toggleShoppingListItem(updated, 'a');
  assert.equal(toggledBack.items[0].is_checked, false);
});
