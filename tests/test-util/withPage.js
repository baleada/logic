import puppeteer from 'puppeteer'

export default async function withPage (t, fileName, isClass, run) {
  const browser = await puppeteer.launch({
    // headless: false
  }),
        page = await browser.newPage()

  await page.on('console', msg => console.log(msg.text()))
  await page.on('pageerror', pageerror => console.log(pageerror))

  await page.exposeFunction('assert', condition => t.assert(condition))
  await page.exposeFunction('is', (value, expected) => t.is(value, expected))
  await page.exposeFunction('deepEqual', (value, expected) => t.deepEqual(value, expected))

  await page.addScriptTag({
    path: `./tests/fixtures/${isClass ? 'classes' : 'subclasses'}/${fileName}.js`,
    type: 'text/javascript'
  })

  await page.evaluate(`${fileName} = ${fileName}.default`)

  try {
    await run(t, page)
  } finally {
    await page.close()
    await browser.close()
  }
}
