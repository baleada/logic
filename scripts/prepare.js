const generateIndex = require('./generateIndex'),
      generateMetadata = require('./generateMetadata'),
      babelify = require('./babelify')

function prepare () {
  /* Index all */
  generateIndex('src/classes', { importPath: 'lib/classes', outfile: 'classes' })
  generateIndex('src/factories', { importPath: 'lib/factories', outfile: 'factories' })
  generateIndex('src/constants')
  generateIndex('src/util')
  // generateIndex('src/wrappers')

  /* Generate metadata */
  generateMetadata()

  /* Transform files */
  babelify()
  // browserify()
}

prepare()
