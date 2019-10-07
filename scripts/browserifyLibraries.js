const fs = require('fs'),
      browserify = require('browserify')

function browserifyClasses () {
  const classes = fs
    .readdirSync('./lib/classes')
    .map(clss => ({
      name: clss.split('.')[0],
      source: `./lib/classes/${clss}`,
      output: `./tests/fixtures/classes/${clss}`,
    }))

  empty()
  classes.forEach(clss => browserifyLibrary(clss))
  console.log(`Browserified ${classes.length} classes.`)
}

function empty () {
  fs.readdirSync('./tests/fixtures/classes')
    .forEach(item => fs.unlinkSync(`./tests/fixtures/classes/${item}`))

  console.log('Emptied clss fixtures')
}

function browserifyLibrary (clss) {
  browserify(clss.source, { standalone: clss.name })
    .bundle()
    .pipe(fs.createWriteStream(clss.output))
}

browserifyClasses()
