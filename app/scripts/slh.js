module.exports = class {

  constructor() {
    this._args = {};
    this.dialogID = {};
  }

  init(args) {
    this._args = args;
    this.dialogID = args[0];
    this.route = args[1];
  }

};
