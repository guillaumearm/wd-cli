const isEqual = require('lodash.isequal');

const fxRunner = ({ f, args }) => f(...args)

const createFx = (f, args) => {
  const fxObject = (...args) => createFx(f, args)
  fxObject.f = f;
  fxObject.args = args;
  fxObject.run = (runner = fxRunner) => {
    if (!args) {
      throw new Error('FX must be applied')
    }
    return runner(fxObject)
  }
  return fxObject
}

const createHandler = (fxGen, args) => {
  const handlerObject = (...args) => createHandler(fxGen, args)
  handlerObject.run = (runner = fxRunner) => {
    if (!args) {
      throw new Error('Handler must be applied')
    }
    const gen = fxGen(...args)
    let genResult = gen.next()
    while (!genResult.done) {
      const { value: fx } = genResult
      genResult = gen.next(fx.run(runner))
    }
    return genResult.value
  }
  return handlerObject
}

const fxEquals = (lfx, rfx) => {
  return isEqual(lfx.f, rfx.f) && isEqual(lfx.args, rfx.args)
}

module.exports = {
  handler: (fxGen) => createHandler(fxGen),
  fx: (f) => createFx(f, null),
  fxEquals,
}
