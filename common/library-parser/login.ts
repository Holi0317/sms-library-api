/**
 * Check for language user has selected.
 * @param res - fetch response to get_a_password.asp
 * @returns english or chinese.
 * @throws Error if cannot login.
 * @throws Error if password or username is incorrect.
 */
export function login(res): 'chinese' | 'english' {
  let url = res.request.uri.href;
  if (url.includes('login')) {
    throw new Error('Cannot login library system. Is ID and password correct?');
  } else if (url.includes('cschlib')) {
    return 'chinese';
  } else if (url.includes('schlib')) {
    return 'english';
  } else {
    throw new Error('Cannot login library system. Unknown error occurred');
  }
}