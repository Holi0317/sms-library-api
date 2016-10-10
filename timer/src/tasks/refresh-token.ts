module.exports = function(user) {
  return user.oauth2client.refreshAccessTokenAsync()
    .catch(err => {
      console.error('Error when refreshing access token. Error: ', err);
      user.log('Cannot refresh Google token. Aborting.', 'FATAL');
      user.failed = true;
      throw new BreakSignal();
    })
    .then(newTokens => {
      user.log('Refreshed Google tokens.', 'DEBUG');
      // OAuth2 does not pass back refresh_token.
      newTokens.refresh_token = user.data.tokens.refresh_token;
      user.data.tokens = newTokens;
      return user.data.save();
    });
};