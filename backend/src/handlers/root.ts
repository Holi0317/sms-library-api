import {Request, Response, Next} from '../IExpress';
import {User, Logs} from '../common/models';
import {oauth2clientFactory} from '../common/utils';
import validateUser from '../validate/user-update';
import {plusPeopleGet} from '../common/promisify';

/**
 * Handles index logic.
 * If user is logined, query his/her information and then render user page.
 * Else, render welcome page.
 */
export async function index(req: Request, res: Response) {
  if (req.logined) {
    let result = await User.findOne({
      attributes: ['renewEnabled', 'libraryLogin', 'renewDate', 'calendarEnabled', 'calendarName', 'emailEnabled', 'emailAddress'],
      where: {
        googleID: req.session.googleID
      }
    });

    let logs = await Logs.findAll({
      attributes: ['time', 'message', 'level'],
      where: {
        userID: req.session.googleID
      },
      order: 'time DESC'
    });

    return res.render('user', {user: result, logs});
  } else {
    return res.render('index');
  }
}


/**
 * Login page handler.
 * Generates a url for Google OAuth2 process and redirect user to that url.
 */
export function login(req: Request, res: Response) {
  if (req.logined) {
    return res.redirect(req.app.namedRoutes.build('root.index'));
  }
  // Step1, get authorize url
  let oauth2client = oauth2clientFactory();
  let authUrl = oauth2client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  });
  res.redirect(authUrl);
}

/**
 * Handles callback from Google OAuth2 process.
 * This will request for user's Google ID, their name and write into MongoDB.
 * Then redirect them to index page.
 * If any error occured, render auth-fail page.
 */
export async function googleCallback(req, res) {
  // OAUTH2 callback
  if (!req.query.code) {
    // No code is responsed.
    return res.status(401).render('auth-fail');
  }

  let oauth2client = oauth2clientFactory();

  try {
    // OAuth Step2, exchange code
    let tokens = await oauth2client.getTokenAsync(req.query.code);
    req.session.tokens = tokens;
    oauth2client.setCredentials(tokens);

    // Get Google+ profile, googleID
    let plusResponse = await plusPeopleGet({userId: 'me', auth: oauth2client});
    req.session.name = plusResponse.displayName;
    req.session.googleID = plusResponse.id;
    let googleID = req.session.googleID;

    // Get Email
    let email = '';
    if (plusResponse.emails) {
      plusResponse.emails.every(i => {
        if (i.type === 'account') {
          email = i.value;
          return false;
        } else return true;
      });
    }

    // Save information into Database
    let [instance, created] = await User.findOrCreate({
      where: {
        googleID
      },
      defaults: {
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token,
        googleID,
        emailAddress: email
      }
    });

    if (!created && ((tokens.refresh_token && instance.refreshToken !== tokens.refresh_token) || instance.accessToken !== tokens.access_token)) {
      let value = {
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token
      };
      if (!value.refreshToken) {
        delete value.refreshToken;
      }
      await User.update(value, {
        where: {
          googleID
        }
      });
    }

    return res.redirect(req.app.namedRoutes.build('root.index'));
  } catch (err) {
    console.error(err);
    return res.status(401).render('auth-fail');
  }

}

export namespace user {
  export function middleware(req: Request, res: Response, next: Next) {
    if (!req.session.tokens) {
      // No token
      return res.redirect(req.app.namedRoutes.build('root.login'));
    } else {
      return next();
    }
  }

  /**
   * Get handler for user.
   * Response with a 405(Not allowed).
   */
  export function get(req: Request, res: Response) {
    return res.status(405);
  }

  /**
   * Post handler for user route.
   * Only accept JSON request. If not, response with 406.
   * This will serialize data, update user's record in database and return result as JSON.
   */
  export async function post(req: Request, res: Response) {
    // Update information
    if (!req.is('json')) {
      // Only accept JSON request
      return res.status(406).json({
        message: 'Only accept application/json body request',
        ok: false
      });
    }

    let body = req.body;

    try {
      await validateUser(body, req.session.googleId);
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        ok: false,
        message: err.message
      });
    }

    try {
      let [affectedCount, affectedRows] = await User.update({
        libraryLogin: body.libraryLogin,
        libraryPassword: body.libraryPassword,
        renewEnabled: body.renewEnabled,
        renewDate: body.renewDate,
        calendarName: body.calendarName,
        calendarEnabled: body.calendarEnabled,
        emailEnabled: body.emailEnabled,
        emailAddress: body.emailAddress
      }, {
        where: {
          googleID: req.session.googleID
        }
      });

      if (affectedCount === 0) {
        return res.status(404).json({
          message: 'Cannot find corresponding user in database',
          ok: false
        });
      }

      await Logs.create({
        userID: req.session.googleID,
        time: new Date(),
        message: 'Changed user profile.',
        level: 'INFO'
      });

      return res.json({
        message: 'Successfully updated data.',
        ok: true
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Error when dealing with update data.',
        ok: false
      });
    }
  }

  /**
   * Delete method handler for user route.
   * Delete user from database, revoke their Google OAuth2 permission and clear session.
   */
  export async function del(req: Request, res: Response) {
    // Remove user
    let oauth2client = oauth2clientFactory();
    oauth2client.setCredentials(req.session.tokens);
    let googleID = req.session.googleID;

    try {
      await oauth2client.revokeCredentialsAsync();

      await User.destroy({
        where: {
          googleID
        }
      });

      await Logs.destroy({
        where: {
          userID: googleID
        }
      });

      await new Promise(function(resolve, reject) {
        // Express session cannot be promisify-ed by Bluebird. Donno why(Just me being lazy)
        // Quick and dirty promise wrapper for req.session.regenerate
        req.session.regenerate(err => {
          if (err) reject(err);
          else resolve();
        });
      });

      req.session.flash = 'Your account has been delected.';
      return res.json({
        message: 'Delection succeed.',
        ok: true
      });
    } catch (err) {
      req.session.flash = 'Cannot delete your account due to server issue.';
      return res.status(500).json({
        message: 'Delete failed. Server error occurred.',
        ok: false
      });
    }
  }
}

/**
 * Logout handler.
 * Just clear session.
 */
export function logout(req: Request, res: Response) {
  req.session.regenerate(err => {
    if (err) return res.status(500).render('error');
    req.session.flash = 'Logout succeed. Hope to see you in the future.';
    return res.redirect(req.app.namedRoutes.build('root.index'));
  });
}

/**
 * Troll.
 */
export function troll(req: Request, res: Response) {
  return res.status(418).render('418');
}
