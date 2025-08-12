// backend/utils/dateUtils.js

/**
 * Returns true if today is a weekday (Monday to Friday).
 */
function isWeekday() {
  const today = new Date().getDay(); 
  // Sunday = 0, Monday = 1, ..., Saturday = 6
  return today >= 1 && today <= 5;
}

/**
 * Formats a JavaScript Date object to YYYY-MM-DD string.
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2,'0');
  const day = String(date.getDate()).padStart(2,'0');
  return `${year}-${month}-${day}`;
}

module.exports = {
  isWeekday,
  formatDate,
};
