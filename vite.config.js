import { configureable } from '@baleada/prepare'

export default {
  ...configureable('vite')
    .alias({
      '/@src/': `/src`,
    })
    .koa(configureable => 
      configureable
        .virtualIndex('src/index.js', { test: ({ id }) => /src\/(?:classes|factories)\/\w+.js$/.test(id), importType: 'relativeFromRoot' })
        .virtualIndex('src/classes')
        .virtualIndex('src/factories')
        .virtualIndex('src/util')
        .configure()
    )
    .configure(),
}