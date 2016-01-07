module.exports.BreakSignal = function BreakSignal() {
  // Empty object prototype.
  // This is used as a break signal to inform Promise that the chain has been breaked, and
  // Exception is handled
};

module.exports.emptyPromise = new Promise(resolve => {
  // emptyPromise is a promise that will always resolve, nomatter which situation.
  resolve();
});

module.exports.catchIgnore = function catchIgnore() {
  /* Return a empty promise in all situation.
   * Can be used to supress all error in a promise.
   *
   * E.g. makeAPromise().then(throwError).catch(catchThrowError).then(otherStuffs1).then(otherStuffs2).catch(catchIgnore)
   * This will pass otherStuffs and end the promise chain, without showing ugly error on console.
   */
  return module.exports.emptyPromise;
};
