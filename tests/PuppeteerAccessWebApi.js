const puppeteer = require('puppeteer')

class Typeable {
  constructor(state) {
    this.state = state
  }
  get isHtmlElement() {
    return this.state instanceof HTMLElement
  }
  get isString() {
    return typeof this.state === 'string'
  }
}

(async function test() {
  const browser = await puppeteer.launch({
    headless: false
  })

  const page = await browser.newPage()

  await page.exposeFunction('isHtmlElement', () => {
    const instance = new Typeable('test')
    console.log(`inside page: ${instance.isHtmlElement}`)
    return instance.isHtmlElement
  })

  await page.exposeFunction('isString', () => {
    const instance = new Typeable('test')
    console.log(`inside page: ${instance.isString}`)
    return instance.isString
  })

  function doStuff() {
    const instance = new Typeable('test')
    return instance.isHtmlElement
  }

  const value = await page.evaluate(doStuff)

  console.log(`outside page: ${value}`)
})()
