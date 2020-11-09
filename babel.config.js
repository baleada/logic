const presets = [
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
      plugins = [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-private-methods',
        '@babel/plugin-proposal-optional-chaining',
        'module:fast-async',
        [
          '@babel/plugin-transform-runtime',
          {
            useESModules: true,
          },
        ],
      ]

module.exports = { presets, plugins }
