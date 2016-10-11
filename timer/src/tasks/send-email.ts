import {MAIL_TEMPLATE, MAIL_SENDER, MAIL_SUBJECT} from '../constants';
import {gmailSend} from '../promisify';
import {config} from '../config';

/**
 * Create a Email content following the RFC2822 format. (The one used by Gmail)
 * This function can only create plain text email.
 * (i.e. No email with attachment or using HTML)
 *
 * @param {String} from_ - Sender of the email. Optional (Ignore this using null).
 * @param {String} to - Receiver of the email.
 * @param {String} subject - Subject of the email.
 * @param {String} body - Text content of the email.
 * @returns {String} - Base64 encoded email message.
 */
function makeEmail(from_, to, subject, body) {
  let lines = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 8bit',
    (from_) ? `from: ${from_}` : '',
    `to: ${to}`,
    `subject: ${subject}`,
    '',
    body
  ];

  let mail = lines.join('\n');
  return new Buffer(mail).toString('base64');
}

export async function sendEmail(user) {
  if (!user.data.renewEnabled || user.failed || !user.data.emailEnabled) {
    return;
  }

  let books = user.library.borrowedBooks.filter(b => user.emailMsgID.indexOf(b.mcode) !== -1);
  let message = MAIL_TEMPLATE({books: books});
  let email = makeEmail(MAIL_SENDER, user.data.emailAddress, MAIL_SUBJECT, message);

  await gmailSend({
    auth: config.jwt,
    userId: 'me',
    resource: {
      raw: email
    }
  });
}