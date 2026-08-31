const crypto = require('crypto');

// Generates something like "A1B2C3D4" - 8 chars, uppercase alphanumeric
function generateAccessCode() {
  return crypto.randomBytes(6).toString('hex').toUpperCase().slice(0, 8);
}

module.exports = generateAccessCode;