import * as classes from '../../src/classes'
import * as pipes from '../../src/pipes'
import * as util from '../../src/util'
import { nextTick } from 'vue'

export type WithLogic = Window & {
  Logic: typeof classes & typeof pipes & typeof util,
  Logic_classes: typeof classes,
  Logic_pipes: typeof pipes,
  Logic_util: typeof util,
  nextTick: typeof nextTick,
}
