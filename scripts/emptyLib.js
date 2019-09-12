const fs = require('fs')

function emptyLib () {
  fs.readdirSync('./lib')
    .forEach(item => remove(item))

  console.log('Emptied lib directory')
}

function remove (item) {
  if (item.includes('.')) {
    fs.unlinkSync(`./lib/${item}`)
  } else {
    fs.readdirSync(`./lib/${item}`)
      .forEach(file => remove(`${item}/${file}`))

    fs.rmdirSync(`./lib/${item}`)
  }
}

emptyLib()
