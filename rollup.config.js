import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import virtual from '@baleada/rollup-plugin-virtual'
import getFilesToIndex from '@baleada/source-transform-files-to-index'
import metadata from './metadata/index.esm.js'

const classesFilesToIndex = getFilesToIndex({ test: ({ id }) => /src\/classes\/\w+.js$/.test(id) }),
      constantsFilesToIndex = getFilesToIndex({ test: ({ id }) => /src\/constants\/[^\/]+.js$/.test(id) }),
      utilFilesToIndex = getFilesToIndex({ test: ({ id }) => /src\/util\/[^\/]+.js$/.test(id) }),
      factoriesFilesToIndex = getFilesToIndex({ test: ({ id }) => /src\/factories\/\w+.js$/.test(id) }),
      srcFilesToIndex = getFilesToIndex({
        importType: 'absolute',
        test: ({ id }) => /src\/(?:classes|factories)\/\w+.js$/.test(id)
      })

const external = [
        'bezier-easing',
        'mix-css-color',
        'fast-fuzzy',
        'lodash-es',
        /@babel\/runtime/,
      ],
      plugins = [
        // {
        //   name: 'log',
        //   resolveId: (source, importer) => {
        //     console.log({ source, importer })
        //     return null
        //   }
        // },
        virtual({
          transform: ({ id }) => {
            console.log(srcFilesToIndex({ id }))
            return srcFilesToIndex({ id })
          },
          test: ({ id }) => id.endsWith('src/index.js'),
        }),
        virtual({
          transform: classesFilesToIndex,
          test: ({ id }) => id.endsWith('src/classes'),
        }),
        virtual({
          transform: constantsFilesToIndex,
          test: ({ id }) => id.endsWith('src/constants'),
        }),
        virtual({
          transform: utilFilesToIndex,
          test: ({ id }) => id.endsWith('src/util'),
        }),
        virtual({
          transform: ({ id }) => factoriesFilesToIndex({ id }),
          test: ({ id }) => id.endsWith('src/factories'),
        }),
        resolve(),
        babel({
          exclude: 'node_modules/**',
          babelHelpers: 'runtime',
        }),
      ]

export default [
  {
    external,
    input: 'src/index.js',
    output: [
      { file: 'lib/index.js', format: 'cjs' },
      { file: 'lib/index.esm.js', format: 'esm' }
    ],
    plugins,
  },
  {
    input: 'metadata/index.esm.js',
    output: [
      { file: 'metadata/index.js', format: 'cjs' },
    ],
    plugins,
  },
  ...metadata.classes.map(tool => ({
    external: [
      ...tool.external,
      /@babel\/runtime/,
    ],
    input: `src/classes/${tool.name}.js`,
    output: { file: `classes/${tool.name}.js`, format: 'esm' },
    plugins,
  })),
  ...metadata.factories.map(tool => ({
    external: [
      ...tool.external,
      /@babel\/runtime/,
    ],
    input: `src/factories/${tool.name}.js`,
    output: { file: `factories/${tool.name}.js`, format: 'esm' },
    plugins,
  }))
]
