import * as cheerio from 'cheerio';

/**
 * Parser for info page.
 * Grep readerID from the page.
 * @param res - Fetch response for info page.
 * @returns Reader ID of given page as string.
 */
export function info(res) {
  let $ = cheerio.load(res.body);
  return $('form[name="PATRONF"]>table font').last().text().replace(/\s/g, '');
}