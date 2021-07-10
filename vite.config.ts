import { configureable } from '@baleada/prepare'

export default new configureable.Vite()
  .alias({
    '@src': `/src`,
  })
  .includeDeps([
    '@baleada/animateable-utils'
  ])
  .rollup(({ configureable }) => configureable
    .input(({ toResolved }) => toResolved({
      main: './tests/stubs/app/index.html',
    }))
  )
  .pages({ pagesDir: 'tests/stubs/app/src/pages' })
  .vue()
  .configure()
