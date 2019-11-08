const generateIndex = require('./generateIndex'),
      generateMetadata = require('./generateMetadata'),
      babelify = require('./babelify'),
      browserify = require('./browserify')

function prepare () {
  /* Index all */
  generateIndex('src/classes', 'lib/classes', 'classes')
  generateIndex('src/subclasses', 'lib/subclasses', 'subclasses')

  /* Generate metadata */
  generateMetadata()

  /* Transform files */
  babelify()
  browserify()
}

prepare()
