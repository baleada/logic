import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import analyze from 'rollup-plugin-analyzer'
import virtual from '@baleada/rollup-plugin-virtual'
import getFilesToIndex from '@baleada/source-transform-files-to-index'
import metadata from './metadata/index.esm.js'

// Virtual file transforms
const classesFilesToIndex = getFilesToIndex({ test: ({ id }) => /src\/classes\/\w+.js$/.test(id) }),
      constantsFilesToIndex = getFilesToIndex({ test: ({ id }) => /src\/constants\/[^\/]+.js$/.test(id) }),
      utilFilesToIndex = getFilesToIndex({ test: ({ id }) => /src\/util\/[^\/]+.js$/.test(id) }),
      factoriesFilesToIndex = getFilesToIndex({ test: ({ id }) => /src\/factories\/\w+.js$/.test(id) }),
      srcFilesToIndex = getFilesToIndex({
        importType: 'absolute',
        test: ({ id }) => /src\/(?:classes|factories)\/\w+.js$/.test(id)
      })

// Babel
const babelConfig = {
        presets: [
        [
          '@babel/preset-env',
          {
            targets: '> 0.5%, not dead',
            modules: false, // Modules should not be transformed so that compilers can treeshake
            exclude: [
              '@babel/plugin-transform-regenerator',
            ],
          },
        ],
      ],
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-private-methods',
        '@babel/plugin-proposal-optional-chaining',
        'module:fast-async',
      ],
    },
    withBabelPlugin = ({ plugins, format }) => [
      ...plugins,
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'runtime',
        ...babelConfig,
        plugins: [
          ...babelConfig.plugins,
          [
            '@babel/plugin-transform-runtime',
            { useESModules: format === 'esm' }
          ]
        ]
      })      
    ]

// Shared config
const external = [
        'bezier-easing',
        'mix-css-color',
        'fast-fuzzy',
        /lodash-es/,
        /@babel\/runtime/,
      ],
      plugins = [
        resolve(),
        virtual({
          transform: ({ id }) => srcFilesToIndex({ id }),
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
      ]

export default [
  {
    external,
    input: 'src/index.js',
    output: [
      { file: 'lib/index.esm.js', format: 'esm' },
    ],
    plugins: [
      ...withBabelPlugin({ plugins, format: 'esm' }),
      analyze({ summaryOnly: true }),
    ],
  },
  {
    external,
    input: 'src/index.js',
    output: [
      { file: 'lib/index.js', format: 'cjs' },
    ],
    plugins: [
      ...withBabelPlugin({ plugins, format: 'cjs' }),
    ],
  },
  {
    input: 'metadata/index.esm.js',
    output: [
      { file: 'metadata/index.js', format: 'cjs' },
    ],
    plugins,
  },
  // ...metadata.classes.map(tool => ({
  //   external: [
  //     ...tool.external,
  //     /lodash-es/, // Hardcoded because it wasn't working otherwise
  //     /@babel\/runtime/,
  //   ],
  //   input: `src/classes/${tool.name}.js`,
  //   output: { file: `classes/${tool.name}.js`, format: 'esm' },
  //   plugins,
  // })),
  // ...metadata.factories.map(tool => ({
  //   external: [
  //     ...tool.external,
  //     /lodash-es/, // Hardcoded because it wasn't working otherwise
  //     /@babel\/runtime/,
  //   ],
  //   input: `src/factories/${tool.name}.js`,
  //   output: { file: `factories/${tool.name}.js`, format: 'esm' },
  //   plugins,
  // }))
]
