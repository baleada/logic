import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { readFileSync } from 'fs'
import { configureable } from '@baleada/prepare'
import toMetadata from './source-transforms/toMetadata'

const shared = configureable()
        .input('src/index.js')
        .virtualIndex('src/index.js', { test: ({ id }) => /src\/(?:classes|factories)\/\w+.js$/.test(id) })
        .virtualIndex('src/classes')
        .virtualIndex('src/constants')
        .virtualIndex('src/factories')
        .virtualIndex('src/util')
        .resolve()
        .external([
          'bezier-easing',
          'mix-css-color',
          'fast-fuzzy',
          /lodash-es/,
          /@babel\/runtime/,
        ]),
      metadataShared = configureable()
        .input('src/metadata.js')
        .virtual({
          test: ({ id }) => id.endsWith('src/metadata.js'),
          transform: toMetadata,
        })
        .resolve()

export default [
  // shared
  //   .delete({ targets: 'lib/*', verbose: true })
  //   .esm({ file: 'lib/index.esm.js', target: 'browser' })
  //   .analyze()
  //   .configure(),
  // shared
  //   .cjs({ file: 'lib/index.js' })
  //   .configure(),
  // metadataShared    
  //   .delete({ targets: 'metadata/*', verbose: true })
  //   .esm({ file: 'metadata/index.esm.js', target: 'node' })
  //   .configure(),
  // metadataShared    
  //   .cjs({ file: 'metadata/index.js' })
  //   .configure(),
  configureable()
    .input('src/index.js')
    .resolve()
    .sourceTransform({
      test: ({ source }) => source === '',
      transform: ({ id, source }) => {
        console.log(id)
        return readFileSync(id, 'utf8')
      }
    })
    .plugin(json())
    .plugin(commonjs()) //{ requireReturnsDefault: 'auto' }
    .esm({ file: 'tests/fixtures/index.js', target: 'browser' })
    .virtualIndex('src/index.js', { test: ({ id }) => /src\/(?:classes|factories)\/\w+.js$/.test(id) })
    .virtualIndex('src/classes')
    .virtualIndex('src/constants')
    .virtualIndex('src/factories')
    .virtualIndex('src/util')
    .configure(),
]
