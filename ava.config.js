export default {
  files: [ 'tests/**/*.test.js' ],
  verbose: true,
  require: [
    './tests/test-util/setup.js'
  ],
  babel: {
    compileAsTests: [
      'lib/**/*',
      'src/**/*',
      'tests/test-util/*',
      'node_modules/lodash-es/**/*',
      'node_modules/@babel/runtime/**/*',
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
