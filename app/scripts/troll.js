let cheet = require('cheet.js');

module.exports = function() {
  cheet('↑ ↑ ↓ ↓ ← → ← → b a', function () {
    location.href = global.slh.route.troll;
  });
};
