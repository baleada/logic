const presets = [
  [
    '@babel/preset-env',
    {
      targets: '> 0.5%, not dead',
      // modules: false, Transform modules so that browserify can work properly
    },
  ],
],
      plugins = [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-private-methods'
      ]

module.exports = { presets, plugins }
