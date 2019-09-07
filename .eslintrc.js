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
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'plugin:ava/recommended',
  ],
  rules: {
    'comma-dangle': 'off',
    'no-console': 'off',
    'arrow-parens': 'off',
    'one-var': ['error', 'consecutive'],
    'space-before-function-paren': ['error', {
        'anonymous': 'never',
        'named': 'always',
        'asyncArrow': 'always'
    }],
    'indent': ['error', 2, {
      'VariableDeclarator': 'first',
      'MemberExpression': 'off',
    }],
    'no-trailing-spaces': ['error', {
      'skipBlankLines': true,
    }],
  }
}
