'use strict';

let template = require('lodash.template');

/**
 * One day in milisecond.
 * @const {number} ONE_DAY
 * @default 8.64e+7
 */
const ONE_DAY = 8.64e+7;
/**
 * Timezone that library system is at.
 * @const {string} TIMEZONE
 * @default 'Asia/Hong_Kong'
 */
const TIMEZONE = 'Asia/Hong_Kong';
/**
 * Maximum log to be kept.
 * @const {number} MAX_LOG_RECORD
 * @default 100
 */
const MAX_LOG_RECORD = 100;
/**
 * The maximum renew time for library system.
 * @const {number} MAX_RENEW_TIME
 * @default 5
 */
const MAX_RENEW_TIME = 5;
/**
 * Template for a mail that reminds user that this is the last time for renewal.
 * This is in fact a lodash template function.
 * @const {function} MAIL_TEMPLATE
 * @default (Check the source. It is long.)
 */
const MAIL_TEMPLATE = template(`
Good day,

This mail is sent from Library helper. You know, that auto renew thingee.
(By the way, my main function is to add due date to Google Calendar and many of you guys don't know this function. QAQ)

I am here to remind you that the following books has hit their maximum renew time. They cannot be renewed in the future.
Please renew them before due date.

The book(s) are:
<% books.forEach(function(book) { %>

=====================
Book name: <%- book.name %>

Due date: <%- book.dueDate.toDateString() %>
=====================

<% }); %>
Due date of these books should appear on your Google calendar. Please set notification on those events as I will not remind you to return books.

Regards,
Library Helper.

P.S. This message is sent by a stupid robot. Please be nice and do not reply email to him.
He is not clever enough to read these messages.
`);
/**
 * Subject for the email.
 * @const {string} MAIL_SUBJECT
 * @default 'Library Helper reminder'
 */
const MAIL_SUBJECT = 'Library Helper reminder';
/**
 * Sender name of the email.
 * @const {string} MAIL_SENDER
 * @default 'Library Helper'
 */
const MAIL_SENDER = 'Library Helper';

module.exports = {
  ONE_DAY,
  TIMEZONE,
  MAX_LOG_RECORD,
  MAX_RENEW_TIME,
  MAIL_TEMPLATE,
  MAIL_SUBJECT,
  MAIL_SENDER
};