const fs = require('fs')

module.exports = function() {
  const classes = fs.readdirSync('./src/classes'),
        subclasses = fs.readdirSync('./src/subclasses'),
        classMetadata = getClassMetadata(classes),
        subclassMetadata = getSubclassMetadata(subclasses),
        metadata = {
          classes: classMetadata,
          subclasses: subclassMetadata,
        }

  fs.writeFileSync(
    './metadata.js',
    `module.exports = ${JSON.stringify(metadata, null, 2)}`
  )
}

function getClassMetadata (classes) {
  return classes.map(file => ({ name: getName(file), usesDOM: getUsesDOM(file), needsCleanup: getNeedsCleanup(file) }))
}

function getSubclassMetadata (subclasses) {
  return subclasses.map(file => ({ name: getName(file) }))
}

function getName (file) {
  return file.match(/\w+\.js$/)[0].replace(/\.js$/, '')
}

function getUsesDOM (file) {
  const contents = fs.readFileSync(`./src/classes/${file}`, 'utf8')
  return /this\._?element/.test(contents)
}

function getNeedsCleanup (file) {
  const contents = fs.readFileSync(`./src/classes/${file}`, 'utf8')
  return /\n\s+stop ?\(.*?\) {/.test(contents)
}
