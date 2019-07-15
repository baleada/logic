module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
  },
  parserOptions: {
    sourceType: 'module',
    parser: 'babel-eslint'
  },
  extends: [
    'plugin:nuxt/recommended',
    'plugin:ava/recommended',
  ],
  rules: {
    'comma-dangle': 'off',
    'no-console': 'off',
    'arrow-parens': 'off',
  }
}
