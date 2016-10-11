import {Request, Response, Next} from '../IExpress';
import {config} from '../common/config';
import {UserModel, Log, UserDocument} from '../common/models';
import {oauth2clientFactory} from '../common/utils';
import validateUser from '../validate/user-update';
import {plusPeopleGet} from '../common/promisify';

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
  let result = await UserModel.findOne({
    googleId: req.session.googleId
  }) as UserDocument;

  if (result.googleId === config.adminID) {
    result.isAdmin = true
  }
  if (!result.isAdmin) {
    res.status(404).render('error', {code: 404, message: 'Page not found'});
    return
  }
  await result.save();
  next();

}

/**
 * Query from database and render management page.
 */
export async function index(req: Request, res: Response) {
  let result = await UserModel.find()
  .sort({
    googleId: -1
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
  let result = await UserModel.findOne({
    googleId: req.params.user
  }) as UserDocument;

  if (!result) {
    return res.render('mana-no-user');
  }

  result.logs.sort((a: Log, b: Log) => {
    return b.time.getTime() - a.time.getTime();
  });

  let oauth2client = oauth2clientFactory();
  oauth2client.setCredentials(result.tokens);

  let googleRes = await plusPeopleGet({userId: 'me', auth: oauth2client});
  return res.render('mana-user', {data: result, name: googleRes.displayName});
}

/**
 * Edit user data, by the command of magic/mana.
 */
export async function postUser(req, res) {
  if (!req.is('json')) {
    // Only accept JSON request
    return res.status(406).json({
      message: 'Only accept application/json body request',
      ok: false
    });
  }

  let body: UserDocument = req.body;

  // Validation
  try {
    await validateUser(body, req.params.user);
  } catch (err) {
    res.status(400).json({
      message: err.message,
      ok: false
    });
  }

  let message = new Log('An admin has changed your configuration.', 'WARN');

  let result = await UserModel.findOneAndUpdate({
    googleId: req.params.user
  }, {
    $set: {
      libraryLogin: body.libraryLogin,
      libraryPassword: body.libraryPassword,
      renewEnabled: body.renewEnabled,
      renewDate: body.renewDate,
      calendarName: body.calendarName,
      isAdmin: body.isAdmin
    },
    $push: {
      logs: message
    }
  }) as UserDocument;

  if (!result) {
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
