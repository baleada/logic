const fs = require('fs'),
      browserify = require('browserify'),
      dir = process.argv[process.argv.length - 1]

function browserifyClasses () {
  const files = fs
    .readdirSync(`./browser-lib/${dir}`)
    .map(file => ({
      name: file.split('.')[0],
      source: `./browser-lib/${dir}/${file}`,
      output: `./dist/${dir}/${file}`,
    }))

  files.forEach(file => browserifyLibrary(file))
  console.log(`Browserified ${files.length} ${dir}.`)
}

function browserifyLibrary ({ source, name, output }) {
  browserify(source, { standalone: name })
    .bundle()
    .pipe(fs.createWriteStream(output))
}

browserifyClasses()
