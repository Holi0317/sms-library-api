'use strict';

let sinon = require('sinon');
let sinonChai = require('sinon-chai');
let chai = require('chai');

chai.use(sinonChai);
chai.should();

require('../backend/validate/validator-fn');
let validate = require('validate.js');

describe('Validator-fn', function() {

  it('should register to validate.js.', function() {
    validate.validators.fn.should.be.a('function');
  });

  it('should accept function as parameter.', function() {
    let stub = sinon.stub();
    let constraints = {
      foo: {
        fn: [stub]
      }
    };

    let res = validate({foo: 'value'}, constraints);

    (typeof res === 'undefined').should.be.true;
    stub.should.have.been.calledOnce;
    stub.args[0][1].should.be.a('array');
  });

  it('should return error when the function do so.', function() {
    let stub = sinon.stub();
    stub.returns('Error');

    let constraints = {
      foo: {
        fn: [stub]
      }
    };

    let res = validate({foo: 'value'}, constraints);

    res.should.be.a('object');
  });

});
