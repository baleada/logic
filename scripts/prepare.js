const generateIndex = require('./generateIndex'),
      generateMetadata = require('./generateMetadata'),
      babelify = require('./babelify')

function prepare () {
  /* Index all */
  generateIndex('src/classes', { importPath: 'lib/classes', outfile: 'classes' })
  generateIndex('src/subclasses', { importPath: 'lib/subclasses', outfile: 'subclasses' })
  generateIndex('src/constants')
  generateIndex('src/util')
  generateIndex('src/wrappers')

  /* Generate metadata */
  generateMetadata()

  /* Transform files */
  babelify()
  // browserify()
}

prepare()
