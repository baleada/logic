import { configureable } from '@baleada/prepare'

export default configureable('vite')
  .alias({
    '/@src/': `/src`,
  })
  .koa(configureable => 
    configureable
      .virtual.index('src/index.js', { test: ({ id }) => /src\/(?:classes|factories)\/\w+.js$/.test(id), importType: 'relativeFromRoot' })
      .virtual.index('src/classes')
      .virtual.index('src/factories')
      .virtual.index('src/util')
      .configure()
  )
  .configure()
