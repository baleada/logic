import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import withBrowseable from '../util/withBrowseable.js'

const suite = withBrowseable(
  createSuite('Fetchable (browser)')
)

suite.before.each(context => {
  context.stub = 'http://localhost:3000/Fetchable'
  context.resource = 'http://httpbin.org/get'
})

suite('fetch(...) sets status to fetching', async ({ page, stub, resource }) => {
  await page.goto(stub)
  await page.waitForSelector('h1')
  const value = await page.evaluate(async resource => {
          return (new window.Fetchable(resource)).fetch().status
        }, resource),
        expected = 'fetching'

  assert.is(value, expected)
})

suite.run()
