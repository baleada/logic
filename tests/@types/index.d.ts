import * as classes from '../../src/classes'
import * as pipes from '../../src/pipes'
import * as extracted from '../../src/extracted'

export type Globals = {
  Logic: typeof classes & typeof pipes & typeof extracted,
  Logic_classes: typeof classes,
  Logic_pipes: typeof pipes,
  Logic_extracted: typeof extracted,
  nextTick: () => Promise<any>,
  testState: any
}

declare global {
  interface Window extends Globals {}
}
