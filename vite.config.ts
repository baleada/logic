import { configureable } from '@baleada/prepare'
import { resolve } from 'path'

export default new configureable.Vite()
  .alias({
    '@src': `/src`,
  })
  .rollup(({ configureable }) => configureable
    .input({
      main: resolve(__dirname, 'tests/stubs/app/index.html'),
    })
    .configure()
  )
  .pages({ pagesDir: 'tests/stubs/app/src/pages' })
  .vue()
  .configure()
