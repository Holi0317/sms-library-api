'use strict';

let $ = require('jquery');
global.jQuery = $;

require('bootstrap-material-design');

require('bootstrap-sass/assets/javascripts/bootstrap/alert');
require('bootstrap-sass/assets/javascripts/bootstrap/collapse');
require('bootstrap-sass/assets/javascripts/bootstrap/modal');
require('bootstrap-sass/assets/javascripts/bootstrap/transition');

$(() => {
  $.material.init();
});
$(require('./utils'));
$(require('./user'));
