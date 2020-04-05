import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'

const external = [
        'bezier-easing',
        'chroma-js/chroma-light',
        'clone-deep',
        'fast-fuzzy',
        'markdown-it',
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
    output: { file: 'lib/index.js', format: 'esm' },
    plugins,
  },
]