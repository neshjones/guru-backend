// backend/utils/mpesaUtils.js

/**
 * Validates a M-Pesa transaction code format.
 * Typical M-Pesa codes are alphanumeric, about 10-15 chars.
 * Adjust regex as per your expected format.
 */
function validateTransactionCode(code) {
  return /^[A-Z0-9]{10,15}$/.test(code);
}

/**
 * Sanitizes transaction code - trims and uppercases input.
 */
function sanitizeTransactionCode(code) {
  if (!code) return '';
  return code.trim().toUpperCase();
}

module.exports = {
  validateTransactionCode,
  sanitizeTransactionCode,
};
