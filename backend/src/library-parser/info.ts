import {deocdeBig5 as decode} from '../utils';
import * as cheerio from 'cheerio';

/**
 * Parser for info page.
 * Grep readerID from the page.
 * @param res - Fetch response for info page.
 * @returns Reader ID of given page as string.
 */
export async function info(res) {
  let body = await decode(res);
  let $ = cheerio.load(body);
  return $('form[name="PATRONF"]>table font').last().text().replace(/\s/g, '');
}