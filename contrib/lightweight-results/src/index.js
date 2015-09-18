#!/usr/bin/env node

'use strict';

import 'babel-core/polyfill';

import Table from 'cli-table';
import leonize from './leonize';
import messagepackize from './messagepackize';
import passthrough from './passthrough';
import gzip from 'gzip-js';
import now from 'performance-now';

const fixture = require('../fixtures/result');

const baseSize = JSON.stringify(fixture).length;

const table = new Table({
  head: ['op', 'size', '%', 'time/100 ops'],
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
];

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
