'use strict';

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
};
