import { configureable } from '@baleada/prepare'
import toMetadata from './source-transforms/toMetadata'

const shared = configureable('rollup')
        .input('src/index.js')
        .virtual.index('src/classes')
        .virtual.index('src/factories')
        .virtual.index('src/util')
        .resolve()
        .external([
          'bezier-easing',
          'mix-css-color',
          'fast-fuzzy',
          '@sindresorhus/slugify',
          /@babel\/runtime/,
        ]),
      productionShared = shared
        .virtual.index('src/index.js', { test: ({ id }) => /src\/(?:classes|factories)\/\w+.js$/.test(id) }),
      metadataShared = configureable('rollup')
        .input('src/metadata.js')
        .virtual({
          test: ({ id }) => id.endsWith('src/metadata.js'),
          transform: toMetadata,
        })
        .resolve(),
      esm = productionShared
        .delete({ targets: 'lib/*', verbose: true })
        .esm({ file: 'lib/index.js', target: 'browser' })
        .analyze()
        .configure(),
      cjs = productionShared
        .cjs({ file: 'lib/index.cjs' })
        .configure(),
      metadataEsm = metadataShared    
        .delete({ targets: 'metadata/*', verbose: true })
        .esm({ file: 'metadata/index.js', target: 'node' })
        .configure(),
      metadataCjs = metadataShared    
        .cjs({ file: 'metadata/index.cjs' })
        .configure()

export default [
  esm,
  cjs,
  metadataEsm,
  metadataCjs,
]

export { shared }
