const puppeteer = require('puppeteer')
const fs = require('fs')

async function test() {
  const browser = await puppeteer.launch({
    headless: false
  })

  const page = await browser.newPage()

  await page.addScriptTag({
    path: './tests/fixtures/libraries/Syncable.js',
    type: 'text/javascript'
  })

  const value = await page.evaluate(() => {
    console.log(Syncable)
    const instance = new Syncable('Baleada', {
      onSync: (state, instance) => instance.setState(state)
    })

    return instance.type
  })

  console.log(value)
}

test()
