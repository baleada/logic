export default {
  files: [ 'tests/**/*.test.js' ],
  helpers: [ 'assets/js/**/*.js' ],
  verbose: true,
  babel: {
    testOptions: {
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-private-methods'
      ]
    }
  }
}
