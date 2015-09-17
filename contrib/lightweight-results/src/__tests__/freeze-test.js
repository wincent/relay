'use strict';

const freeze = require('../freeze');

describe('freeze()', () => {
  it('passes the fixture file', () => {
    const query = require('../../fixtures/result');
    expect(freeze(query).hasOwnProperty('data')).toBe(true);
  });
});
