import {ONE_DAY, MAX_RENEW_TIME} from '../constants';
import {CronUserData} from '../cron-user-data';

export async function renewBooks(user: CronUserData) {
  if (!user.data.renewEnabled || user.failed) {
    return;
  }

  let now = new Date();
  let promises: Promise<any>[] = [];  // Promises for renewing book to be returned.
  let borrowedBooks = user.library.borrowedBooks.map(b => b.name);   // Book name for all borrowed books. For logging purpose.
  let renewBooks: string[] = [];    // Book name for all books requires to be renewed. For logging purpose.

  for (let book of user.library.borrowedBooks) {  // Each borrowed books.

    let diff = book.dueDate.getTime() - now.getTime();
    if (diff <= user.data.renewDate * ONE_DAY && diff > 0 && book.mcode) {
      // If Logic: Less than defined date, more than 0 day and have book ID.
      promises.push(user.library.renewBook(book));    // Create promise.
      renewBooks.push(book.name);    // Logging.

      // Create array of books that needs to be notified.
      if (book.renewal === MAX_RENEW_TIME - 1) {
        user.emailMsgID.push(book.mcode);
      }
    }
  }

  if (borrowedBooks.length) {
    user.log(`You have borrowed the followings books: ${borrowedBooks.join(', ')}`);
  } else {
    user.log('No borrowed books detected.');
  }

  if (renewBooks.length) {
    user.log(`The following books will be renewed: ${renewBooks.join(', ')}`);
  }

  await Promise.all(promises);
}