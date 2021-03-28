import { configureable } from '@baleada/prepare'
import toMetadata from './source-transforms/toMetadata'
import typescript from '@rollup/plugin-typescript'

const shared = configureable('rollup')
        .input(['src/classes.js', 'src/pipes.js'])
        .multi()
        .resolve()
        .external([
          'bezier-easing',
          'mix-css-color',
          'fast-fuzzy',
          '@sindresorhus/slugify',
          'dompurify',
          /@babel\/runtime/,
        ]),
      metadataShared = configureable('rollup')
        .input('src/metadata.js')
        .virtual({
          test: ({ id }) => id.endsWith('src/metadata.js'),
          transform: toMetadata,
        })
        .resolve(),
      esm = shared
        .delete({ targets: 'lib/*', verbose: true })
        .esm({ file: 'lib/index.js', target: 'browser' })
        .plugin(typescript())
        // .analyze()
        .configure(),
      cjs = shared
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
