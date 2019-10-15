const fs = require('fs'),
      dir = process.argv[process.argv.length - 1]

function empty (dir) {
  fs.readdirSync(`./${dir}`)
    .forEach(item => remove(item))

  console.log(`Emptied ${dir} directory`)
}

function remove (item) {
  if (item.includes('.')) {
    fs.unlinkSync(`./${dir}/${item}`)
  } else {
    fs.readdirSync(`./${dir}/${item}`)
      .forEach(file => remove(`${item}/${file}`))

    fs.rmdirSync(`./${dir}/${item}`)
  }
}

empty(dir)
