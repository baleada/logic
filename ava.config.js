export default {
  files: [ 'tests/**/*.test.js' ],
  helpers: [ 'src/**/*.js', 'tests/test-util/*.js' ],
  verbose: true,
  require: [
    './tests/test-util/setup.js'
  ]
}
