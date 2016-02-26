'use strict';

module.exports = function($) {
  $('tr.clickable-row').on('click', function () {
    location.href = $(this).data('href');
  });
};
