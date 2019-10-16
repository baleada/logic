import test from 'ava'
import withPage from '../test-util/withPage'

test('stores the response', withPage, 'Fetchable', true, async (t, page) => {
  await page.evaluate(async () => {
    const instance = new Fetchable('https://httpbin.org/get', { method: 'get' })

    console.log(instance)
    await instance.fetch()

    await window.assert(instance.response)
  })
})

/* Methods */
// test('fetch() stores response when request is resolved', withPage, 'Fetchable', async (t, page) => {
//   const value = await page.evaluate(() => {
//     let value
//     const instance = new Fetchable({ method: 'get', url: 'http://httpbin.org/get' })
//
//     instance.fetch()
//
//     return instance.response
//   })
//
//   t.is(value, false)
// })
