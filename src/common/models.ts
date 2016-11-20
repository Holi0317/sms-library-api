import * as Sequelize from 'sequelize';
import {config} from './config';

export type LogLevels = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | 'SUCCESS';

export interface IUser {
  refreshToken: string
  accessToken: string
  googleID: string
  renewEnabled: boolean
  libraryLogin: string
  libraryPassword: string
  renewDate: string
  calendarEnabled: string
  calendarName: string
  emailEnabled: boolean
  emailAddress: string
  isAdmin: boolean
}

export interface ILog {
  userID: string
  time: Date
  message: string
  level: LogLevels
}

export const User = config.sequelize.define('User', {
  refreshToken: {
    type: Sequelize.STRING,
    allowNull: false
  },
  accessToken: {
    type: Sequelize.STRING,
    allowNull: false
  },

  googleID: {
    type: Sequelize.STRING,
    allowNull: false
  },

  renewEnabled: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  libraryLogin: {
    type: Sequelize.STRING,
    allowNull: true,
    unique: true
  },
  libraryPassword: {
    type: Sequelize.STRING,
    allowNull: true
  },
  renewDate: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 3,
    validate: {
      max: 13,
      min: 2
    }
  },

  calendarEnabled: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  calendarName: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: 'slh autorenew'
  },

  emailEnabled: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  emailAddress: {
    type: Sequelize.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },

  isAdmin: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

export const Logs = config.sequelize.define('Logs', {
  userID: {
    type: Sequelize.STRING,
    allowNull: false
  },
  time: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  message: {
    type: Sequelize.STRING,
    allowNull: false
  },
  level: {
    type: Sequelize.ENUM('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'SUCCESS'),
    allowNull: false
  }
});