const { empty, generateIndex } = require('@baleada/prepare'),
      generateMetadata = require('./generateMetadata'),
      compile = require('./compile')

function prepare () {
  empty('lib')

  /* Index all */
  generateIndex('src/classes')
  generateIndex('src/factories')
  generateIndex('src/constants')
  generateIndex('src/util')

  /* Top level index */
  generateIndex(
    ['src/classes', 'src/factories'],
    { outfile: 'src/index' }
  )

  /* Generate metadata */
  generateMetadata()

  /* Transform files */
  // babelify()
  // browserify()

  compile()
}

prepare()
