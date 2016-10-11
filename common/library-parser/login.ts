import {URLS} from '../library';

/**
 * Check for language user has selected.
 * @param res - fetch response to get_a_password.asp
 * @returns english or chinese
 * @throws Error if cannot login
 */
export async function login(res): Promise<'chinese'|'english'> {
  if (res.url === URLS.login) {
    throw new Error('Cannot login library system. Is ID and password correct?');
  } else if (res.url.includes('cschlib')) {
    return 'chinese'
  } else if (res.url.includes('schlib')) {
    return 'english';
  } else {
    throw new Error('Cannot login library system. Unknown error occured');
  }
}