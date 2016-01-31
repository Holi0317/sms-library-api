let moment = require('moment');
let validate = require('./validate');

function _markError(name) {
  this.find(`[name='${name}']`).parents('.form-group:first').addClass('has-error');
}

module.exports = function($) {
  let formLock = false;

  $('form[data-async]').on('submit', function (event) {
    // Acquire lock
    if (formLock) {
      return event.preventDefault();
    }
    formLock = true;
    event.preventDefault();

    // Make variables.
    let form = $(this);
    let ok;

    // Serialize form
    let data = {};
    let _data = form.serializeArray();
    for (let val of _data) {
      data[val.name] = val.value;
    }

    // Clean error
    for (let element in data) {
      form.find(`[name='${element}']`).parents('.form-group:first').removeClass('has-error');
    }

    // Validate
    [data, ok] = validate[form.attr('validator')](data, _markError.bind(form));

    if (!ok) {
      formLock = false;
      return;
    }

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
};
