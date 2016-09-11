'use strict';

class ServerData {
  constructor() {
    this._data = {};
    this.dialogID = {};
    this.route = {};
  }

  read($) {
    let select = $('#server-data');
    let data = this._data = select.data();
    this.dialogID = data.dialogid;
    this.route = data.route;
  }
}

module.exports = new ServerData();
