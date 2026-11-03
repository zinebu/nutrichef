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

function mergeShoppingListState(localList, serverList) {
  if (!localList) return serverList ?? null;
  if (!serverList) return localList;

  const localItems = Array.isArray(localList.items) ? localList.items : [];
  const serverItems = Array.isArray(serverList.items) ? serverList.items : [];

  if (localItems.length === 0) return serverList;
  if (serverItems.length === 0) return localList;

  const localChecked = localItems.filter((item) => item?.is_checked).length;
  const serverChecked = serverItems.filter((item) => item?.is_checked).length;

  if (localChecked >= serverChecked || localItems.length >= serverItems.length) {
    return localList;
  }

  return serverList;
}

module.exports = {
  toggleShoppingListItem,
  mergeShoppingListState,
};
