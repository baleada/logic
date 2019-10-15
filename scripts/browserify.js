const fs = require('fs'),
      browserify = require('browserify'),
      dir = process.argv[process.argv.length - 1]

function browserifyClasses () {
  const files = fs
    .readdirSync(`./browser-lib/${dir}`)
    .map(file => ({
      name: file.split('.')[0],
      source: `./browser-lib/${dir}/${file}`,
      output: `./tests/fixtures/${dir}/${file}`,
    }))

  files.forEach(file => browserifyLibrary(file))
  console.log(`Browserified ${files.length} ${dir}.`)
}

function browserifyLibrary (file) {
  browserify(file.source, { standalone: file.name })
    .bundle()
    .pipe(fs.createWriteStream(file.output))
}

browserifyClasses()
