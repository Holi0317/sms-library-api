let cheet = require('cheet.js');
let serverData = require('./server-data');

module.exports = function() {
  cheet('↑ ↑ ↓ ↓ ← → ← → b a', () => {
    location.href = serverData.route.troll;
  });
};
