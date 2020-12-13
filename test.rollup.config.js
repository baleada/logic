import { shared } from './rollup.config.js'

const test = shared
  .delete({ targets: 'tests/fixtures/index.js', verbose: true })
  .virtualIndex('src/index.js')  
  .esm({ file: 'tests/fixtures/index.js', target: 'node' })
  .configure()

export default [
  test
]
