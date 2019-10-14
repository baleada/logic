import puppeteer from 'puppeteer'

export default async function withPage(t, className, run) {
	const browser = await puppeteer.launch({
    // headless: false
  })

	const page = await browser.newPage()
  await page.on('console', msg => console.log(msg.text()))
	await page.addScriptTag({
    path: `./tests/fixtures/classes/${className}.js`,
    type: 'text/javascript'
  })

	await page.evaluate(`${className} = ${className}.default`)


	try {
		await run(t, page)
	} finally {
		await page.close()
		await browser.close()
	}
}
