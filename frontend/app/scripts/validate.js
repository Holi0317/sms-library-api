'use strict';

let user = function (data, markError) {
  let ok = true;

  data.renewDate = Number(data.renewDate);
  data.renewEnabled = Boolean(data.renewEnabled);
  data.calendarEnabled = Boolean(data.calendarEnabled);
  data.emailEnabled = Boolean(data.emailEnabled);

  // Validate
  if (data.renewEnabled && (data.libraryLogin === '' || data.libraryPassword === '')) {
    markError('libraryLogin');
    markError('libraryPassword');
    ok = false;
  }

  if (data.renewDate < 2 || data.renewDate >= 14) {
    markError('renewDate');
    ok = false;
  }

  if (data.calendarName === '') {
    markError('calendarName');
    ok = false;
  }

  if (data.emailEnabled && data.emailAddress === '') {
    markError('emailAddress');
    ok = false;
  }

  return [data, ok];
};

let mana = function (data, markError) {
  let ok;

  [data, ok] = user(data, markError);

  data.isAdmin = Boolean(data.isAdmin);

  return [data, ok];
};

module.exports = {
  user: user,
  mana: mana
};
