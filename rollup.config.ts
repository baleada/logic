import { configureable } from '@baleada/prepare'

const external = [
        'bezier-easing',
        '@snigo.dev/color',
        'fast-fuzzy',
        '@sindresorhus/slugify',
        'dompurify',
        /@babel\/runtime/,
      ],
      shared = new configureable.Rollup()
        .input(['src/classes.ts', 'src/pipes.ts'])
        .external(external)
        .resolve()
        .typescript(),
      esm = shared
        .delete({ targets: 'lib/*', verbose: true })
        .esm({ file: 'lib/index.js', target: 'browser' })
        .analyzer()
        .configure(),
      cjs = shared
        .cjs({ file: 'lib/index.cjs' })
        .configure(),
      dts = new configureable.Rollup()
        .input(['types/classes.d.ts', 'types/pipes.d.ts'])
        .external([
          ...external,
          '@types/resize-observer-browser',
          '@types/requestidlecallback',
        ])
        .output({ file: 'lib/index.d.ts', format: 'esm' })
        .dts()
        .configure(),
      metadataShared = new configureable.Rollup()
        .input('metadata/index.ts')
        .typescript({ tsconfig: 'tsconfig.metadata.json' }),
      metadataEsm = metadataShared
        .esm({ file: 'metadata/index.js', target: 'node' })
        .configure(),
      metadataCjs = metadataShared    
        .delete({ hook: 'buildEnd', targets: 'metadata/index.ts', verbose: true })
        .cjs({ file: 'metadata/index.cjs' })
        .configure()
      // metadataDts = metadataShared
      //   .output({ file: 'metadata/index.ts' })
      //   .configure()


export default [
  esm,
  cjs,
  dts,
  metadataEsm,
  metadataCjs,
  // metadataDts,
]

export { shared }
