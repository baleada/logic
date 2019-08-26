const fs = require('fs')
const browserify = require('browserify')

function browserifyLibraries() {
  const libraries = fs
    .readdirSync('./lib/libraries')
    .map(library => ({
      name: library.split('.')[0],
      source: `./lib/libraries/${library}`,
      output: `./tests/fixtures/libraries/${library}`,
    }))

  libraries.forEach(library => browserifyLibrary(library))
  console.log(`Successfully browserified ${libraries.length} libraries.`)
}

function browserifyLibrary(library) {
  browserify(library.source, { standalone: library.name })
    .bundle()
    .pipe(fs.createWriteStream(library.output))
}

browserifyLibraries()
