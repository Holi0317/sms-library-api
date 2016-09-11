'use strict';

let moment = require('moment');

module.exports = function($) {

  $('.moment.moment-relative').each(function () {
    let element = $(this);
    let time = element.attr('data-time');
    let deltaString = moment(time, 'x').fromNow();
    element.text(deltaString);
  });

  $('.log-detail-dialog-entry').on('click', function (event) {
    event.preventDefault();
    let element = $(this);
    let message = element.attr('data-message');
    let level = element.attr('data-level');
    let time = moment(element.attr('data-time'), 'x').format('LLLL');

    $('#log-detail-dialog [replace-time]').text(time);
    $('#log-detail-dialog [replace-message]').text(message);
    $('#log-detail-dialog [replace-level]').text(level);

    $('#log-detail-dialog').modal('show');
  });

  $('#delete-account').on('click', () => {
    $.ajax({
      type: 'DELETE',
      url: 'user',
      contentType: 'application/json; charset=utf-8'
    })
    .always(() => {
      window.location.reload();
    });
  });

  $('#toggle-debug').on('click', () => {
    $('.debug').toggleClass('hidden');
  });
};
