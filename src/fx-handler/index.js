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

const stringify = x => JSON.stringify(x, null, 2);

const createTestRunner = (mockedFxs = []) => {
  let mockIndex = 0;
  return fx => {
    if (!mockedFxs[mockIndex]) {
      throw new Error('Mocked fxs should be exhaustive')
    }
    const [expectedFx, mockedRetValue] = mockedFxs[mockIndex];
    if (!isEqual(fx.f, expectedFx.f)) {
      throw new Error(`Invalid fx#${mockIndex} function`)
    }
    if (!isEqual(fx.args, expectedFx.args)) {
      const expectedArgs = stringify(expectedFx.args);
      const fxArgs = stringify(fx.args);
      throw new Error(`Invalid fx#${mockIndex} function arguments: expected \n${expectedArgs}\nbut got \n${fxArgs}`)
    }
    mockIndex += 1;
    return mockedRetValue;
  }
}

const TestHandler = (h, mockedFxs = [], expectedRetValue, assertRet = false) => {
  return {
    matchFx: (fx, ret) => TestHandler(
      h,
      [...mockedFxs, [fx, ret]],
      expectedRetValue,
      assertRet
    ),
    shouldReturn: (expected) => TestHandler(h, mockedFxs, expected, true),
    run: () => {
      // 1. should be a handler
      if (typeof h !== 'function') {
        throw new Error('Handler should be a function')
      }

      // 2. run handler using testRunner to get a retValue
      const retValue = h.run(createTestRunner(mockedFxs))

      // 3. expectedRetValue and retValue should be equal
      if (assertRet && !isEqual(expectedRetValue, retValue)) {
        throw new Error(`Invalid returned value : expected ${expectedRetValue} but got ${retValue}`)
      }
    }
  }
}

module.exports = {
  handler: (fxGen) => createHandler(fxGen),
  fx: (f) => createFx(f, null),
  testHandler: (h) => TestHandler(h),
}
