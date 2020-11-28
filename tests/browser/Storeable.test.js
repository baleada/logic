import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import withBrowseable from '../util/withBrowseable.js'

const suite = withBrowseable(
  createSuite('Storeable (browser)')
)




suite.run()
