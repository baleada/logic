const fs = require('fs'),
      path = require('path')

module.exports = function(dir) {
  const dirPath = path.resolve(dir)
  fs.readdirSync(dirPath)
    .forEach(item => remove(`${dirPath}/${item}`))

  console.log(`Emptied ${dir} directory`)
}

function remove (path) {
  if (fs.lstatSync(path).isFile()) {
    fs.unlinkSync(path)
  } else {
    fs.readdirSync(path)
      .forEach(item => remove(`${path}/${item}`))

    fs.rmdirSync(`${path}`)
  }
}
