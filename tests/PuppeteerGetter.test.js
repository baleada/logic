import test from 'ava'
import puppeteer from 'puppeteer'

class MyClass {
  constructor() {
    this.prop = true
  }

  get getter() {
    return this.prop
  }

  method() {
    console.log('Method was called')
  }
}

test('normalProp is true', t => {
  const instance = new MyClass()
  t.assert(instance.normalProp)
})

test('getterProp is true', t => {
  const instance = new MyClass()
  t.assert(instance.getterProp)
})

test('MyClass is a function', t => {
  t.assert(typeof MyClass === 'function')
})

test('can create instance in browser', async t => {
  const browser = await puppeteer.launch({
    headless: false
  })

  const page = await browser.newPage()

  await page.on('console', msg => console.log(msg.text()))

  await page.exposeFunction('MyClass', MyClass)

  const result = await page.evaluate(() => {
    return window.MyClass()
      .then(instance => instance)
      .catch(error => error)
  })


})
