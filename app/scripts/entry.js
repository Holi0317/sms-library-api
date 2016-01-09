'use strict';

let $ = require('jquery');
let moment = require('moment');
global.jQuery = $;

require('bootstrap-material-design');

// Example bootstrap plugin.
require('bootstrap-sass/assets/javascripts/bootstrap/alert');
require('bootstrap-sass/assets/javascripts/bootstrap/collapse');
require('bootstrap-sass/assets/javascripts/bootstrap/modal');
require('bootstrap-sass/assets/javascripts/bootstrap/transition');

let formLock = false;

$(() => {
  $.material.init();

  // Route: index at logined
  $('form[data-async]').on('submit', function (event) {
    if (formLock) {
      return event.preventDefault();
    }
    formLock = true;
    event.preventDefault();

    let form = $(this);
    let data = {};
    let _data = form.serializeArray();
    for (let val of _data) {
      data[val.name] = val.value;
    }

    // Change type
    data.renewDate = Number(data.renewDate);
    data.renewEnabled = Boolean(data.renewEnabled);

    // Validicate
    let ok = true;
    if (data.renewEnabled && (data.libraryLogin === '' || data.libraryPassword === '')) {
      form.find('[name="libraryLogin"]').parents('.form-group:first').addClass('has-error');
      form.find('[name="libraryPassword"]').parents('.form-group:first').addClass('has-error');
      ok = false;
    }

    if (data.renewDate < 2 || data.renewDate >= 14) {
      form.find('[name="renewDate"]').focus().parents('.form-group:first').addClass('has-error');
      ok = false;
    }
    if (!ok) return;

    $('#req-success').slideUp();
    $('#req-fail').slideUp();

    $.ajax({
      type: form.attr('method'),
      url: form.attr('action'),
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(data),
      dataType: 'json',
      success: res => {
        $('#req-success > span').text(res.message);
        $('#req-success').slideDown();
        formLock = false;
      },
      error: jqxhr => {
        $('#req-fail > span').text(jqxhr.responseJSON.message);
        $('#req-fail').slideDown();
        formLock = false;
      }
    });

  });

  $('.moment.moment-relative').each(function () {
    let element = $(this);
    let time = element.attr('data-time');
    let deltaString = moment(time, 'x').fromNow();
    element.text(deltaString);
  });

  $('.dynamic-dialog-entry').on('click', function (event) {
    event.preventDefault();
    let element = $(this);
    let message = element.attr('data-message');
    let level = element.attr('data-level');
    let time = moment(element.attr('data-time'), 'x').format('LLLL');

    $('#dynamic-dialog [replace-time]').text(time);
    $('#dynamic-dialog [replace-message]').text(message);
    $('#dynamic-dialog [replace-level]').text(level);

    $('#dynamic-dialog').modal('show');
  });

  $('#delete-account').on('click', () => {
    $.ajax({
      type: 'DELETE',
      url: 'user',
      contentType: 'application/json; charset=utf-8',
      success: () => {
        window.location.reload();
      },
      error: () => {
        window.location.reload();
      }
    });
  });

  $('#toggle-debug').on('click', () => {
    $('.debug').toggleClass('hidden');
  });
});
