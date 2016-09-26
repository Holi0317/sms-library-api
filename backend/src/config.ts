import * as fs from 'fs';
import * as url from 'url';
import * as mongoose from 'mongoose';
import * as google from 'googleapis';
import * as yaml from 'js-yaml';
import {Socket} from "net";

interface ConfigInterface {
  conn: Socket
  adminID: string
  secret: string
  clientID: string
  clientSecret: string
  redirectUrl: string
  jwt: any
}

export let config: ConfigInterface;

if (process.env.TRAVIS) {
  config = {
    conn: mongoose.createConnection('mongodb://localhost/noop'),
    adminID: 'Google ID for admin',
    secret: 'Generate a totally random string here.',
    clientID: 'Client ID got from console.developer.google.com',
    clientSecret: 'Client secret got from console.developer.google.com',
    redirectUrl: 'http://localhost:3000/oauth2callback',
    jwt: 'JWT'
  };
  module.exports.conn.on('error', ()=>{});
} else if (process.env.SLH_CONFIG_PATH) {
  let doc = yaml.safeLoad(fs.readFileSync(process.env.SLH_CONFIG_PATH, 'utf8'));
  let jwt = doc.google.jwt;
  config = {
    conn: mongoose.createConnection(doc.mongo.url, doc.mongo.config),
    adminID: doc.adminID,
    secret: doc.secret,
    clientID: doc.google.clientID,
    clientSecret: doc.google.clientSecret,
    redirectUrl: url.resolve(doc.baseURL, 'oauth2callback'),
    jwt: new google.auth.JWT(jwt.client_email, null, jwt.private_key, ['https://www.googleapis.com/auth/gmail.send'], null)
  };
  config.jwt.authorize(err => {
    if (err) {
      throw err;
    }
  });
} else {
  throw new Error('SLH_CONFIG_PATH environment variable is not defined. Read README.md for more details.');
}