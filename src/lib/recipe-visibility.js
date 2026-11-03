const RESTRICTED_FRIEND_VISIBLE_CATEGORIES = new Set(['petit_dejeuner', 'snack']);

function isVisibleToFriends(category) {
  return category != null && !RESTRICTED_FRIEND_VISIBLE_CATEGORIES.has(category);
}

function filterVisibleToFriends(recipes) {
  return recipes.filter((recipe) => isVisibleToFriends(recipe?.category));
}

module.exports = {
  RESTRICTED_FRIEND_VISIBLE_CATEGORIES,
  isVisibleToFriends,
  filterVisibleToFriends,
};
