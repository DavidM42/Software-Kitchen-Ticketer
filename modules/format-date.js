/**
 * Formats given date or current date
 */
function formatDate(dateString) {
  if (dateString) {
    return new Date(dateString).toLocaleString("de-DE");
  }
  return new Date().toLocaleString("de-DE");
}

module.exports = { formatDate };
