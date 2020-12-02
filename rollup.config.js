import { configureable } from '@baleada/prepare'
import toMetadata from './source-transforms/toMetadata'

const shared = configureable('rollup')
        .input('src/index.js')
        .virtualIndex('src/index.js', { test: ({ id }) => /src\/(?:classes|factories)\/\w+.js$/.test(id) })
        .virtualIndex('src/classes')
        .virtualIndex('src/constants')
        .virtualIndex('src/factories')
        .virtualIndex('src/util')
        .resolve()
        .external([
          'bezier-easing',
          'mix-css-color',
          'fast-fuzzy',
          /lodash-es/,
          /@babel\/runtime/,
        ]),
      metadataShared = configureable('rollup')
        .input('src/metadata.js')
        .virtual({
          test: ({ id }) => id.endsWith('src/metadata.js'),
          transform: toMetadata,
        })
        .resolve()

export default [
  shared
    .delete({ targets: 'lib/*', verbose: true })
    .esm({ file: 'lib/index.js', target: 'browser' })
    .analyze()
    .configure(),
  shared
    .cjs({ file: 'lib/index.cjs' })
    .configure(),
  metadataShared    
    .delete({ targets: 'metadata/*', verbose: true })
    .esm({ file: 'metadata/index.js', target: 'node' })
    .configure(),
  metadataShared    
    .cjs({ file: 'metadata/index.cjs' })
    .configure()
]
