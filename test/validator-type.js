import test from 'ava';
import '../lib/validate/validator-type'
import * as validate from 'validate.js';

test('validator-type should pass if type is correct', async t => {
  const constraints = {
    foo: {
      type: 'string'
    }
  };
  const data = {
    foo: 'this is a string'
  };
  await validate.async(data, constraints);
  t.pass();
});

test('validator-type should fail if type is incorrect', async t => {
  const constraints = {
    foo: {
      type: 'string'
    }
  };
  const data = {
    foo: 0
  };
  try {
    await validate.async(data, constraints);
    t.fail();
  } catch (err) {
    t.pass();
  }
});