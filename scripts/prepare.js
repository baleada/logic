const { empty } = require('@baleada/prepare'),
      generateMetadata = require('./generateMetadata')

function prepare () {
  empty('lib')
  generateMetadata()
}

prepare()
