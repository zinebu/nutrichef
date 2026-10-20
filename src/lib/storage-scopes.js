function normalizeUserId(userId) {
  const normalized = userId == null ? 'local' : String(userId).trim();
  return normalized || 'local';
}

function getUserScopedStorageKey(key, userId) {
  return `${key}:${normalizeUserId(userId)}`;
}

module.exports = {
  getUserScopedStorageKey,
  normalizeUserId,
};
