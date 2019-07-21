export default {
  files: [ 'tests/**/*.test.js' ],
  helpers: [ 'src/**/*.js', 'tests/test-utils/*.js' ],
  verbose: true,
  require: [
    './tests/test-utils/setup.js'
  ]
}
