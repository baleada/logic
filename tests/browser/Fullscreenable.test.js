import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('Fullscreenable')
)

// suite(`element gets the element`, context => {
//   const value = await page.evaluate(async () => {
          
//         })
  
// })

/* INFORMAL */

// element
// error

// enter
// fullscreen
// exit

// suite(``, context => {
  
  
// })

suite.run()
