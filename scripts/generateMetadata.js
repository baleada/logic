const fs = require('fs')

module.exports = function() {
  const classes = fs.readdirSync('./src/classes'),
        factories = fs.readdirSync('./src/factories'),
        classMetadata = getClassMetadata(classes),
        subclassMetadata = getFactoriesMetadata(factories),
        metadata = {
          classes: classMetadata,
          factories: subclassMetadata,
        }

  fs.writeFileSync(
    './metadata.js',
    `module.exports = ${JSON.stringify(metadata, null, 2)}`
  )
}

function getClassMetadata (classes) {
  return classes.map(file => ({ name: getName(file), usesDOM: getUsesDOM(file), needsCleanup: getNeedsCleanup(file) }))
}

function getFactoriesMetadata (factories) {
  return factories.map(file => ({ name: getName(file) }))
}

function getName (file) {
  return file.match(/\w+\.js$/)[0].replace(/\.js$/, '')
}

function getUsesDOM (file) {
  const contents = fs.readFileSync(`./src/classes/${file}`, 'utf8')
  return /(this\._?element|window)/.test(contents)
}

function getNeedsCleanup (file) {
  const contents = fs.readFileSync(`./src/classes/${file}`, 'utf8')
  return /\n\s+stop ?\(.*?\) {/.test(contents)
}
