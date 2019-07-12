module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [],
  // add your custom rules here
  rules: {
    "comma-dangle": "off",
    "no-console": "off",
    "arrow-parens": "off",
  }
}
