const presets = [
  [
    "@babel/env",
    {
      targets: "> 0.5%, not dead",
      useBuiltIns: "usage",
    },
  ],
];

module.exports = { presets };
