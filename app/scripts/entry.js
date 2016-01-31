'use strict';

let $ = require('jquery');
global.jQuery = $;

require('bootstrap-material-design');

require('bootstrap-sass/assets/javascripts/bootstrap/alert');
require('bootstrap-sass/assets/javascripts/bootstrap/collapse');
require('bootstrap-sass/assets/javascripts/bootstrap/modal');
require('bootstrap-sass/assets/javascripts/bootstrap/transition');

let slh = require('./slh');
global.slh = global.slh || new slh();

$(() => {
  $.material.init();
});
$(require('./utils'));
$(require('./user'));
$(require('./troll'));
$(require('./form'));
