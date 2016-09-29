import {Request, Response} from '../IExpress';
import {UserModel} from '../models';
import {oauth2clientFactory} from '../utils';

/**
 * Render debug routing page, which shows operations can be done under develop mode.
 */
export function index(req, res) {
  res.render('develop');
}

export namespace session {
  /**
   * Returns what session contains as json.
   */
  export function show(req, res) {
    res.json(req.session);
  }

  /**
   * Destroy session.
   *
   * @throws {Error} - Cannot destroy session.
   */
  export function destroy(req: Request, res: Response) {
    req.session.destroy(err => {
      if (err) {
        res.status(500).json({
          message: 'Error when destroying session.',
          ok: false
        });
        throw err;
      }
      res.json({
        message: 'success',
        ok: true
      })
    });
  }

  /**
   * Create a flash message in session.
   */
  export function flash(req: Request, res: Response) {
    req.session.flash = 'Allo Allo! This is a flash message';
    return res.json({
      message: 'Done',
      ok: true
    });
  }
}

export namespace db {
  /**
   * List contents in mongoDB users collection and render as json.
   *
   * @throws {Error} - Error when querying.
   */
  export async function users(req: Request, res: Response) {
    try {
      let data = await UserModel.find();
      return res.json(data);
    } catch (err) {
      return res.status(500).json({
        message: 'Error when quering users.'
      });
    }
  }

  /**
   * Drop all contents in mongoDB users collection.
   *
   * @throws {Error} - Error when dropping.
   */
  export async function usersDrop(req: Request, res: Response) {
    try {
      await UserModel.remove({});
      return res.json({
        message: 'Dropped all data in user collection.'
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Error when dropping users.'
      });
    }
  }
}

export namespace gapi {
  /**
   * Revoke Google API access of a user.
   *
   * @throws {Error} - Token not found.
   * @throws {Error} - Cannot revoke.
   */
  export function revoke(req, res) {
    if (!req.session.tokens) {
      return res.json({
        message: 'Tokens not found',
        ok: false
      });
    }
    let oauth2client = oauth2clientFactory();
    oauth2client.setCredentials(req.session.tokens);
    oauth2client.revokeCredentials(() => {
      return res.json({
        message: 'Tokens revoked.'
      });
    });
  }
}