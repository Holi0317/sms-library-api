'use strict';

let chai = require('chai');

chai.should();

require('../backend/validate/validator-type');
let validate = require('validate.js');

describe('Validator-type', function() {

  it('should register to validate.js.', function() {
    validate.validators.type.should.be.a('function');
  });

  it('should assert type correctly.', function() {
    let data = {
      foo: 'I am a potato!'
    };
    let constraints = {
      foo: {
        type: 'string'
      }
    };

    let res = validate(data, constraints);

    (typeof res === 'undefined').should.be.true;
  });

  it('should assert multiple types correctly.', function() {
    let data = {
      foo: 'I am a potato!'
    };
    let constraints = {
      foo: {
        type: 'object|array|string'
      }
    };

    let res = validate(data, constraints);

    (typeof res === 'undefined').should.be.true;
  });

  it('should raise error if type is not correct', function() {
    let data = {
      foo: 0
    };
    let constraints = {
      foo: {
        type: 'string'
      }
    };

    let res = validate(data, constraints);

    res.should.be.an('object');
  });

});
