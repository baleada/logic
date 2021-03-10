import { configureable } from '@baleada/prepare'

export default configureable('vite')
  .alias({
    '@src': `/src`,
  })
  .includeDeps([
    '@baleada/animateable-utils'
  ])
  .virtual.routes(
    { path: 'tests/stubs/app/src/pages/routes.js', router: 'vue' },
    {
      test: ({ id }) => id.endsWith('vue'),
      transformPath: path => path.replace(/\/index$/, '')
    }
  )
  .vue()
  .configure()
