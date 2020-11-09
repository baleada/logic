const { empty } = require('@baleada/prepare'),
      generateMetadata = require('./generateMetadata')

function prepare () {
  empty('lib')
  empty('classes')
  empty('factories')

  /* Generate metadata */
  generateMetadata()

  /* Transform files */
  // babelify()
  // browserify()

}

prepare()
