import puppeteer from 'puppeteer'

export default async function withPage(t, libraryName, run) {
	const browser = await puppeteer.launch({
    // headless: false
  })

	const page = await browser.newPage()
  await page.on('console', msg => console.log(msg.text()))
	await page.addScriptTag({
    path: `./tests/fixtures/libraries/${libraryName}.js`,
    type: 'text/javascript'
  })
	await page.evaluate(`${libraryName} = ${libraryName}.default`)
	await page.evaluate(`console.log('here')`)

	try {
		await run(t, page)
	} finally {
		await page.close()
		await browser.close()
	}
}
