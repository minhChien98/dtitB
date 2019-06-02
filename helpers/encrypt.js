// =======================
// Encrypt helper =========
// =======================
var crypto = require('crypto');


exports.hash = function(password) {
  return crypto.createHash('sha1').update(password).digest('base64')
}