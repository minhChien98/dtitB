// =======================
// Random helper =========
// =======================

exports.generate = function(low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low);
}