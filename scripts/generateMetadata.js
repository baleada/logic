const fs = require('fs')

module.exports = function() {
  const classes = fs.readdirSync('./src/classes').filter(file => !/index\.js$/.test(file)),
        factories = fs.readdirSync('./src/factories').filter(file => !/index\.js$/.test(file)),
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
  return classes.map(file => ({
    name: getName(file),
    usesDOM: getUsesDOM(file),
    needsCleanup: getNeedsCleanup(file),
    external: getExternal(file, 'classes'),
  }))
}

function getFactoriesMetadata (factories) {
  return factories.map(file => ({
    name: getName(file),
    external: getExternal(file, 'factories'),
  }))
}

function getName (file) {
  return file.match(/\w+\.js$/)[0].replace(/\.js$/, '')
}

const constructorRegexp = /constructor ?\(.*?\) ?\{((.|\r?\n)*?)\n\s\s\}/,
      usesDomRegexp = /\/\/ METADATA: uses DOM/ // If the class constructor contains a 'METADATA: uses DOM' comment in its constructor, it uses the DOM
function getUsesDOM (file) {
  const contents = fs.readFileSync(`./src/classes/${file}`, 'utf8'),
        { 1: constructor = '' } = contents.match(constructorRegexp) || []

  return usesDomRegexp.test(constructor)
}

const externalRegexp = /\/\/ METADATA: EXTERNAL (.+)/ // If a class or factory has external dependencies, they will be pipe-separated in a 'METADATA: EXTERNAL' comment
function getExternal (file, type) {
  const contents = fs.readFileSync(`./src/${type}/${file}`, 'utf8'),
        { 1: external = '' } = contents.match(externalRegexp) || []
        
  return external
    ? external.split('|')
    : []
}

const needsCleanupRegexp = /\n\s+stop ?\(.*?\) {/ // If the class has a `stop` method, it needs cleanup
function getNeedsCleanup (file) {
  const contents = fs.readFileSync(`./src/classes/${file}`, 'utf8')

  return needsCleanupRegexp.test(contents)
}
