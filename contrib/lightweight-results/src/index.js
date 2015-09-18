#!/usr/bin/env node

'use strict';

import 'babel-core/polyfill';

import Table from 'cli-table';
import arrayrefize from './arrayrefize';
import flatten from './flatten';
import gzip from 'gzip-js';
import leonize from './leonize';
import messagepackize from './messagepackize';
import now from 'performance-now';
import passthrough from './passthrough';
import thin from './thin';

const fixture = require('../fixtures/result');
const baseSize = JSON.stringify(fixture).length;

let tests = [
  () => {
    return [
      'passthrough',
      JSON.stringify(passthrough(fixture)),
    ];
  },
  () => {
    return [
      'messagepackize',
      messagepackize(fixture),
    ];
  },
  () => {
    return [
      'leonize',
      leonize(fixture),
    ];
  },
  () => {
    return [
      'flatten',
      JSON.stringify(flatten(fixture)),
    ];
  },
  () => {
    return [
      'flatten + messagepackize',
      messagepackize(flatten(fixture)),
    ];
  },
  () => {
    return [
      'thin',
      JSON.stringify(thin(fixture)),
    ];
  },
  () => {
    return [
      'thin + messagepackize',
      messagepackize(thin(fixture)),
    ];
  },
  () => {
    return [
      'arrayrefize',
      JSON.stringify(arrayrefize(fixture)),
    ];
  },
  () => {
    return [
      'arrayrefize + messagepackize',
      messagepackize(arrayrefize(fixture)),
    ];
  },
];

function pretty(object) { // eslint-disable-line no-unused-vars
  console.log(JSON.stringify(object, null, 2));
}

// Add three copies of each test, applying three levels of gzip compression.
tests = tests.reduce((tests, test) => {
  tests.push(test);
  [1, 6, 9].forEach(level => {
    tests.push(() => {
      const [op, result] = test();
      return [
        `${op} + gzip(${level})`,
        gzip.zip(result, {level}),
      ];
    });
  });
  return tests;
}, []);

function print(str) {
  process.stdout.write(str);
}

const table = new Table({
  head: ['op', 'size', '%', 'time'],
});

tests.forEach(test => {
  const [op, result] = test();
  print(op + ': ');
  const before = now();
  for (let i = 0; i < 100; i++) {
    test();
    if (i % 10 === 0) {
      print('.');
    }
  }
  const after = now();
  print('\n');
  table.push([
    op,
    result.length,
    (result.length / baseSize * 100).toFixed(2) + '%',
    (after - before).toFixed(2) + 'ms',
  ]);
});

console.log(table.toString());
