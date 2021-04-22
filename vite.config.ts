import { configureable } from '@baleada/prepare'

export default new configureable.Vite()
  .alias({
    '@src': `/src`,
  })
  .includeDeps([
    '@baleada/animateable-utils'
  ])
  .pages({ pagesDir: 'tests/stubs/app/src/pages' })
  .vue()
  .configure()
