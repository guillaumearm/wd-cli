#!/usr/bin/env node

// const R = require('ramda')
const { fx, handler, testHandler } = require ('./fx-handler')

// eslint-disable-next-line no-console
const consoleLog = console.log;
const log = fx(consoleLog)
// const idfx = fx(x => x)

const test = handler(function* (...args) {
  for (const arg of args) {
    yield log(arg)
  }
  return 42
})

testHandler(test('a', 'b', 'c'))
  .matchFx(log('a'))
  .matchFx(fx(consoleLog)('b'))
  .matchFx(log('c'))
  .shouldReturn(42)
.run()
