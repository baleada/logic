import type * as classes from '../../src/classes'
import type * as pipes from '../../src/pipes'
import type * as factories from '../../src/factories'
import type * as extracted from '../../src/extracted'

type Globals = {
  Logic: typeof classes & typeof pipes & typeof factories & typeof extracted,
  nextTick: () => Promise<any>,
  testState: any
}

declare global {
  interface Window extends Globals {}
}
