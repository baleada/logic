import test from 'ava'
import withPage from '../test-util/withPage'

/* Getters */
test('stores the response', withPage, 'Fetchable', async (t, page) => {
  const value = await page.evaluate(`(async () => {
    const instance = new Fetchable('http://httpbin.org/get', { method: 'get' })
    await instance.fetch()
    return instance.response
  })()`)

  console.log(value)

  t.assert(value.keys.length > 0)
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
