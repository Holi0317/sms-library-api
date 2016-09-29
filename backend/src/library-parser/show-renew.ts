import {deocdeBig5 as decode} from '../utils';
import * as cheerio from 'cheerio';
import {Book} from '../library';

function bookParser($: Cheerio): Book {
  let childrens = $.children();

  return {
    mcode: $.find('input').attr('value') || null,
    name: cheerio(childrens[1]).text(),
    borrowDate: new Date(cheerio(childrens[2]).text()),
    dueDate: new Date(cheerio(childrens[3]).text()),
    renewal: Number(cheerio(childrens[4]).text()),
  }
}

export async function showRenew(res): Promise<Book[]> {
  let body = await decode(res);
  let $ = cheerio.load(body);
  let borrowedBooks = [];

  $('form tr:not(:first-child)').each(function() {
    borrowedBooks.push(bookParser(cheerio(this)));
  });

  return borrowedBooks;
}