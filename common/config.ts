import * as fs from 'fs';
import * as url from 'url';
import * as Sequelize from 'sequelize';
import * as google from 'googleapis';
import * as yaml from 'js-yaml';

export interface YAMLConfDoc {
  adminID: string
  secret: string
  baseURL: string
  sqlite: string
  google: {
    clientID: string
    clientSecret: string
    jwt: {
      type: 'service_account'
      project_id: string
      private_key_id: string
      private_key: string
      client_email: string
      client_id: string
      auth_uri: string
      token_uri: string
      auth_provider_x509_cert_url: string
      client_x509_cert_url: string
    }
  }
}

interface ConfigInterface {
  sequelize: Sequelize
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
    sequelize: new Sequelize(null, null, null, {
      dialect: 'sqlite'
    }),
    adminID: 'Google ID for admin',
    secret: 'Generate a totally random string here.',
    clientID: 'Client ID got from console.developer.google.com',
    clientSecret: 'Client secret got from console.developer.google.com',
    redirectUrl: 'http://localhost:3000/oauth2callback',
    jwt: 'JWT'
  };

} else if (process.env.SLH_CONFIG_PATH) {

  let doc = yaml.safeLoad(fs.readFileSync(process.env.SLH_CONFIG_PATH, 'utf8')) as YAMLConfDoc;
  let jwt = doc.google.jwt;
  config = {
    sequelize: new Sequelize(null, null, null, {
      dialect: 'sqlite',
      storage: doc.sqlite
    }),
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