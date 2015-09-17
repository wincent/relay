'use strict';

const freeze = require('../freeze');

describe('freeze()', () => {
  it('passes the fixture file', () => {
    const result = require('../../fixtures/result');
    expect(freeze(result).hasOwnProperty('data')).toBe(true);
  });
});
