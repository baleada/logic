const generateIndex = require('./generateIndex'),
      generateMetadata = require('./generateMetadata'),
      babelify = require('./babelify'),
      browserify = require('./browserify')

function prepare () {
  /* Index all */
  generateIndex('src/classes', { importPath: 'lib/classes', outfile: 'classes' })
  generateIndex('src/subclasses', { importPath: 'lib/subclasses', outfile: 'subclasses' })
  generateIndex('src/constants')
  generateIndex('src/dictionaries')
  generateIndex('src/util/classes')
  generateIndex('src/util/functions')
  generateIndex('src/util/subclasses')
  generateIndex('src/wrappers')

  /* Generate metadata */
  generateMetadata()

  /* Transform files */
  babelify()
  // browserify()
}

prepare()
