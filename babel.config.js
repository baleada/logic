const presets = [
  [
    "@babel/preset-env",
    {
      targets: "> 0.5%, not dead",
      // useBuiltIns: "usage",
      // corejs: 3
    },
  ],
]

const plugins = [
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-proposal-private-methods'
]

module.exports = { presets, plugins };
