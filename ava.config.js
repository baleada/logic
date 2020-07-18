export default {
  files: [ 'tests/**/*.test.js' ],
  verbose: true,
  require: [
    './tests/test-util/setup.js'
  ],
  babel: {
    compileAsTests: [
      'src/**/*.js',
      'tests/test-util/*.js',
      'node_modules/lodash-es/**/*.js'
    ],
    testOptions: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              chrome: '77',
            },
          },
        ],
      ],
      plugins: [
        // '@babel/plugin-proposal-class-properties',
        // '@babel/plugin-proposal-private-methods'
      ]
    }
  }
}
