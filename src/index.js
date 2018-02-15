#!/usr/bin/env node

// const R = require('ramda')
const { fx, handler } = require ('./fx-handler')

// eslint-disable-next-line no-console
const log = fx(console.log)

const test = handler(function* (...args) {
  for (const arg of args) {
    yield log(arg)
  }
})

test('a', 'b', 'c').run()
