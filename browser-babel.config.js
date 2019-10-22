const presets = [
  [
    '@babel/preset-env',
    {
      targets: '> 0.5%, not dead',
      // Modules should be transformed so that browserify can work properly
      // modules: false,
      exclude: [
        '@babel/plugin-transform-regenerator',
      ],
    },
  ],
],
      plugins = [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-private-methods',
        'module:fast-async',
      ]

module.exports = { presets, plugins }
