'use strict';

let validate = require('./validate');
let swal = require('sweetalert');

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
      swal({
        title: 'Error :(',
        type: 'error',
        text: 'Error was found in the form. Fix them and submit again.',
        allowOutsideClick: true
      });
      formLock = false;
      return;
    }

    swal({
      title: 'Loading',
      type: 'info',
      text: 'Sit back, sir. Your request will be done in any second.',
      allowOutsideClick: false,
      showConfirmButton: false,
      allowEscapeKey: false
    });

    $.ajax({
      type: form.attr('method'),
      url: form.attr('action'),
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(data),
      dataType: 'json'
    })
    .done(res => {
      swal({
        title: 'Success',
        type: 'success',
        allowOutsideClick: true,
        text: res.message
      });
      formLock = false;
    })
    .fail(jqxhr => {
      swal({
        title: 'Error',
        type: 'error',
        allowOutsideClick: true,
        text: jqxhr.responseJSON.message
      });
      formLock = false;
    });

  });
};
