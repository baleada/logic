import { configureable } from '@baleada/prepare'

const external = [
        'bezier-easing',
        '@snigo.dev/color',
        'fast-fuzzy',
        '@sindresorhus/slugify',
        'dompurify',
        'perfect-freehand',
        'polygon-clipping',
        'lazy-collections',
        /@babel\/runtime/,
      ],
      shared = new configureable.Rollup()
        .input([
          'src/classes/index.ts',
          'src/pipes/index.ts',
          'src/factories/index.ts',
        ])
        .external(external)
        .resolve()
        .esbuild(),
      esm = shared
        .delete({ targets: 'lib/*', verbose: true })
        .esm({ file: 'lib/index.js', target: 'browser' })
        .analyzer({ limit: 0 })
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
        .configure()


export default [
  esm,
  cjs,
  dts,
]

export { shared }
