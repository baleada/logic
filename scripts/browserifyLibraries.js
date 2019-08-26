const fs = require('fs')
const browserify = require('browserify')

function browserifyLibraries() {
  const libraries = fs.readdirSync('./lib/libraries')
  libraries.forEach(library => browserifyLibrary(library))
  console.log(`Successfully browserified ${libraries.length} files.`)
}

function browserifyLibrary(library) {
  const name = library.split('.')[0]
  const source = `./lib/libraries/${library}`
  const output = `./tests/fixtures/${library}`

  browserify()
    .add(source, { standalone: name })
    .bundle()
    .pipe(fs.createWriteStream(output))
}

browserifyLibraries()
