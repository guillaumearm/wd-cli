const isEqual = require('lodash.isequal');

const createFx = (f, args) => {
  const fxObject = (...args) => createFx(f, args)
  fxObject.f = f;
  fxObject.args = args;
  fxObject.run = (runner = (f, args) => f(...args)) => {
    if (!args) {
      throw new Error('FX is not applied')
    }
    return runner(f, args)
  }
  return fxObject
}

const fxEquals = (lfx, rfx) => {
  return isEqual(lfx.f, rfx.f) && isEqual(lfx.args, rfx.args)
}

module.exports = {
  fx: (f) => createFx(f, null),
  fxEquals,
}
