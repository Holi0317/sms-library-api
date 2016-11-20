import {Request, Response, Next} from '../IExpress';
import {config} from '../../common/config';
import {User, Logs} from '../../common/models';
import {oauth2clientFactory} from '../../common/utils';
import validateUser from '../validate/user-update';
import {plusPeopleGet} from '../../common/promisify';

/**
 * Check if user is qualified for accessing the mana page.
 * Return a 404 page is user is not qualified.
 */
export async function middleware(req: Request, res: Response, next: Next) {
  // Reject if not logined.
  if (!req.logined) {
    return res.status(404).render('error', {code: 404, message: 'Page not found'});
  }

  // Populate user from database.
  let result = await User.findOne({
    attributes: ['isAdmin', 'googleID'],
    where: {
      googleID: req.session.googleID
    }
  });

  if (result.googleID === config.adminID && !result.isAdmin) {
    await User.update({
      isAdmin: true
    }, {
      where: {
        googleID: req.session.googleID
      }
    });
    return next();
  }
  if (!result.isAdmin) {
    res.status(404).render('error', {code: 404, message: 'Page not found'});
    return
  }
  next();

}

/**
 * Query from database and render management page.
 */
export async function index(req: Request, res: Response) {
  let result = await User.findAll({
    attributes: ['googleID', 'libraryLogin', 'renewEnabled', 'isAdmin'],
    order: 'googleID DESC'
  });

  return res.render('mana', {
    data: {
      db: result,
      versions: process.versions,
      platform: process.platform,
      arch: process.arch
    }
  });
}

/**
 * Query database, get user name from Google and render user management page.
 */
export async function getUser(req: Request, res: Response) {
  try {
    let result = await User.findOne({
      where: {
        googleID: req.params.user
      }
    });
    let logs = await Logs.findAll({
      attributes: ['time', 'message', 'level'],
      where: {
        userID: req.params.user
      },
      order: 'time DESC'
    });

    if (result == null) {
      return res.render('mana-no-user');
    }

    let oauth2client = oauth2clientFactory();
    oauth2client.setCredentials({
      refresh_token: result.refreshToken,
      access_token: result.accessToken
    });

    try {
      let googleRes = await plusPeopleGet({userId: 'me', auth: oauth2client});
      return res.render('mana-user', {data: result, logs, name: googleRes.displayName});
    } catch (err) {
      console.error('Error when fetching user name. ', err);
      return res.render('mana-user', {data: result, logs, name: '<unknown>'});
    }

  } catch (err) {
    console.error(err);
    return res.status(500).render('error', {

    });
  }

}

/**
 * Edit user data, by the command of magic/mana.
 */
export async function postUser(req: Request, res: Response) {
  if (!req.is('json')) {
    // Only accept JSON request
    return res.status(406).json({
      message: 'Only accept application/json body request',
      ok: false
    });
  }

  // Validation
  try {
    await validateUser(req.body, req.params.user);
  } catch (err) {
    res.status(400).json({
      message: err.message,
      ok: false
    });
  }

  try {
    await User.update({
      libraryLogin: req.body.libraryLogin,
      libraryPassword: req.body.libraryPassword,
      renewEnabled: req.body.renewEnabled,
      renewDate: req.body.renewDate,
      calendarName: req.body.calendarName,
      isAdmin: req.body.isAdmin
    }, {
      where: {
        googleID: req.params.user
      }
    });

    await Logs.create({
      UserID: req.params.user,
      time: new Date(),
      message: 'An admin has changed your configuration.',
      level: 'WARN'
    });
  } catch (err) {
    return res.status(404).json({
      message: 'No such user.',
      ok: false
    });
  }

  return res.status(202).json({
    message: 'Data has been overridden.',
    ok: true
  });
}
