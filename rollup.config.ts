import { configureable } from '@baleada/prepare'
import toMetadata from './source-transforms/toMetadata'

const shared = new configureable.Rollup()
        .input(['src/classes.ts', 'src/pipes.ts'])
        .external([
          'bezier-easing',
          'mix-css-color',
          'fast-fuzzy',
          '@sindresorhus/slugify',
          'dompurify',
          /@babel\/runtime/,
        ])
        .resolve()
        .typescript(),
      metadataShared = new configureable.Rollup()
        .input('src/metadata.js')
        .virtual({
          test: ({ id }) => id.endsWith('src/metadata.js'),
          transform: toMetadata,
        })
        .resolve(),
      esm = shared
        .delete({ targets: 'lib/*', verbose: true })
        .esm({ file: 'lib/index.js', target: 'browser' })
        // .analyze()
        .configure(),
      cjs = shared
        .cjs({ file: 'lib/index.cjs' })
        .configure(),
      dts = new configureable.Rollup()
        .input(['types/classes.d.ts', 'types/pipes.d.ts'])
        .output({ file: 'lib/index.d.ts', format: 'esm' })
        .dts()
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
  dts,
  metadataEsm,
  metadataCjs,
]

export { shared }
