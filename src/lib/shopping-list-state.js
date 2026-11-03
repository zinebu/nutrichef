function toggleShoppingListItem(list, itemId) {
  if (!list || !Array.isArray(list.items)) {
    return list;
  }

  return {
    ...list,
    items: list.items.map((item) =>
      item.id === itemId ? { ...item, is_checked: !item.is_checked } : item
    ),
  };
}

module.exports = {
  toggleShoppingListItem,
};
