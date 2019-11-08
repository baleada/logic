const fs = require('fs'),
      browserify = require('browserify'),
      browserBabelify = require('./browserBabelify'),
      empty = require('./emptyDir')

module.exports = function() {
  browserBabelify()
  empty('dist')
  browserifyDir('classes')
  browserifyDir('subclasses')
}

function browserifyDir (dir) {
  const files = fs
    .readdirSync(`./src/${dir}`)
    .map(file => ({
      name: file.split('.')[0],
      source: `./browser-lib/${dir}/${file}`,
      output: `./dist/${dir}/${file}`,
    }))

  fs.mkdirSync(`./dist/${dir}`)
  files.forEach(file => browserifyFile(file))
  
  console.log(`Browserified ${files.length} ${dir}.`)
}

function browserifyFile ({ source, name, output }) {
  browserify(source, { standalone: name })
    .bundle()
    .pipe(fs.createWriteStream(output))
}
