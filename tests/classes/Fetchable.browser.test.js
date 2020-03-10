// import test from 'ava'
// import withPage from '../test-util/withPage'

// test('stores the response', withPage, 'Fetchable', true, async (t, page) => {
//   await page.evaluate(async () => {
//     const instance = new Fetchable('https://httpbin.org/get', { method: 'get' })

//     await instance.fetch()

//     await window.assert(instance.response.ok)
//   })
// })

// test('stores the error', withPage, 'Fetchable', true, async (t, page) => {
//   await page.evaluate(async () => {
//     const instance = new Fetchable('https://httpbin.org/get', { method: 'post' })
//
//     await instance.fetch()
//
//     console.log(typeof instance.response.ok)
//
//     await window.assert(typeof instance.response.ok === 'string')
//   })
// })

// test('gets the JSON', withPage, 'Fetchable', true, async (t, page) => {
//   await page.evaluate(async () => {
//     const instance = new Fetchable('https://httpbin.org/get', { method: 'get' })
//
//     await instance.fetch()
//
//     const json = await instance.responseJson
//
//     await window.assert(json)
//   })
// })
