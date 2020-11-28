import puppeteer from 'puppeteer-core'

export default function withBrowseable (suite) {
  suite.before(async context => {
    const browser = await puppeteer.launch({
            product: 'chrome',
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          }),
          page = await browser.newPage()

    context.browser = browser
    context.page = page
  })
  
  suite.after(async ({ browser }) => {
    await browser.close()
  })

  return suite
}

function browseable (maybeInstance) {
  if (maybeInstance !== undefined) {
    return maybeInstance
  }

  const instance = {}

  instance.launch = async (...args) => {
    instance.browser = await puppeteer.launch({
      product: 'chrome',
      headless: false,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      ...args[0],
    }, ...args.slice(1))
    return browseable(instance)
  }

  instance.newPage = async (...args) => {
    instance.page = await instance.browser.newPage(...args)
    return browseable(instance)
  }

  return instance
}

