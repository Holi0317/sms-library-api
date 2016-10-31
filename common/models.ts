import * as Sequelize from 'sequelize';
import {config} from './config';

export type LogLevels = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | 'SUCCESS';

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
}, {
  classMethod: {
    log(message: string, level: LogLevels = 'INFO') {
      return Logs.create({
        userID: this.googleID,
        time: new Date(),
        message,
        level
      });
    }
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