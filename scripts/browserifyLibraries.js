const fs = require('fs'),
      browserify = require('browserify')

function browserifyLibraries () {
  const libraries = fs
    .readdirSync('./lib/libraries')
    .map(library => ({
      name: library.split('.')[0],
      source: `./lib/libraries/${library}`,
      output: `./tests/fixtures/libraries/${library}`,
    }))

  empty()
  libraries.forEach(library => browserifyLibrary(library))
  console.log(`Browserified ${libraries.length} libraries.`)
}

function empty () {
  fs.readdirSync('./tests/fixtures/libraries')
    .forEach(item => fs.unlinkSync(`./tests/fixtures/libraries/${item}`))

  console.log('Emptied library fixtures')
}

function browserifyLibrary (library) {
  browserify(library.source, { standalone: library.name })
    .bundle()
    .pipe(fs.createWriteStream(library.output))
}

browserifyLibraries()
