import * as iconv from 'iconv-lite';

/**
 * Returns difference between two arrays (Delta comparing).
 * However, only items that a have but not in b will be returned. See example for a better
 * explain.
 *
 * @example
 * utils.diff([1, 2, 3], [3, 4, 5]); // Returns [1, 2], but not [1, 2, 4, 5]
 *
 * @param {Array} a - One of the arrays to be compared.
 * @param {Array} b - The other array to be compared.
 * @see http://stackoverflow.com/questions/1187518/javascript-array-difference
 */
export function diff(a, b) {
  return a.filter(i =>
    b.indexOf(i) < 0
  );
}

export async function deocdeBig5(res) {
  let buffer = await res.buffer();
  return iconv.decode(buffer, 'big5');
}