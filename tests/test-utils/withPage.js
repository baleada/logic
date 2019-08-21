import puppeteer from 'puppeteer'

export default async function withPage(t, run) {
	const browser = await puppeteer.launch({
    // headless: false
  })
	const page = await browser.newPage()
  await page.on('console', msg => console.log(msg.text()))
	try {
		await run(t, page)
	} finally {
		await page.close()
		await browser.close()
	}
}
