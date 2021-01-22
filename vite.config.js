import { configureable } from '@baleada/prepare'

export default configureable('vite')
  .alias({
    '@src': `/src`,
  })
  .includeDeps([
    '@baleada/animateable-utils'
  ])
  .virtual.index('src/index.js', { test: ({ id }) => /src\/(?:classes|factories)\/\w+.js$/.test(id), importType: 'relativeFromRoot' })
  .virtual.index('src/classes')
  .virtual.index('src/factories')
  .virtual.index('src/util')
  .virtual.routes(
    { path: 'tests/stubs/app/src/pages/routes.js', router: 'vue' },
    {
      test: ({ id }) => id.endsWith('vue'),
      transformPath: path => path.replace(/\/index$/, '')
    }
  )
  .vue()
  .configure()
