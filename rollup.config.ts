import { configureable } from '@baleada/prepare'

const external = [
        /@babel\/runtime/,
        '@sindresorhus/slugify',
        'array-shuffle',
        'bezier-easing',
        'clsx',
        'dequal',
        /dompurify/,
        /dset/,
        'fast-fuzzy',
        'klona',
        'ky',
        'lazy-collections',
        'perfect-freehand',
        'polygon-clipping',
      ],
      shared = new configureable.Rollup()
        .input([
          'src/classes/index.ts',
          'src/pipes/index.ts',
          'src/links/index.ts',
          'src/factories/index.ts',
          'src/extracted/public.ts',
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
        .input([
          'types/classes/index.d.ts',
          'types/pipes/index.d.ts',
          'types/links/index.d.ts',
          'types/factories/index.d.ts',
          'src/extracted/public.d.ts',
        ])
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
