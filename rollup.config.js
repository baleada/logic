import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
const metadata = require('./metadata.js')

const external = [
        'bezier-easing',
        'mix-css-color',
        'fast-fuzzy',
        'object-path',
      ],
      plugins = [
        babel({
          exclude: 'node_modules',
        }),
        resolve(),
      ]

export default [
  {
    external,
    input: 'src/index.js',
    output: [
      { file: 'index.js', format: 'cjs' },
      { file: 'index.esm.js', format: 'esm' }
    ],
    plugins,
  },
  ...metadata.classes.map(tool => ({
    external: tool.external,
    input: `src/classes/${tool.name}.js`,
    output: { file: `classes/${tool.name}.js`, format: 'esm' },
    plugins,
  })),
  ...metadata.factories.map(tool => ({
    external: tool.external,
    input: `src/factories/${tool.name}.js`,
    output: { file: `factories/${tool.name}.js`, format: 'esm' },
    plugins,
  }))
]
