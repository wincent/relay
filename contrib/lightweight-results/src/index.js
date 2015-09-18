#!/usr/bin/env node

'use strict';

import 'babel-core/polyfill';

import Table from 'cli-table';
import flatten from './flatten';
import gzip from 'gzip-js';
import leonize from './leonize';
import messagepackize from './messagepackize';
import now from 'performance-now';
import passthrough from './passthrough';
import thin from './thin';

const fixture = require('../fixtures/result');

const baseSize = JSON.stringify(fixture).length;

const table = new Table({
  head: ['op', 'size', '%', 'time'],
});

let tests = [
  () => {
    const passed = JSON.stringify(passthrough(fixture));
    return [
      'passthrough',
      passed,
    ];
  },
  () => {
    const messagepackized = messagepackize(fixture);
    return [
      'messagepackize',
      messagepackized,
    ];
  },
  () => {
    const leonized = leonize(fixture);
    return [
      'leonize',
      leonized,
    ];
  },
  () => {
    const flattened = JSON.stringify(flatten(fixture));
    return [
      'flatten',
      flattened,
    ];
  },
  () => {
    const flatpacked = messagepackize(flatten(fixture));
    return [
      'flatten + messagepackize',
      flatpacked,
    ];
  },
  () => {
    const thinned = JSON.stringify(thin(fixture));
    return [
      'thin',
      thinned,
    ];
  },
];

function pretty(object) {
  console.log(JSON.stringify(object, null, 2));
}

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
