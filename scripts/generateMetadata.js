const fs = require('fs'),
      { parse } = require('path')

function generateMetadata () {
  const classes = fs.readdirSync('./src/classes').filter(file => !/index\.js$/.test(file)),
        factories = fs.readdirSync('./src/factories').filter(file => !/index\.js$/.test(file)),
        classMetadata = toClassMetadata(classes),
        subclassMetadata = toFactoriesMetadata(factories),
        metadata = {
          classes: classMetadata,
          factories: subclassMetadata,
        }

  fs.writeFileSync(
    './metadata/index.esm.js',
    `export default ${JSON.stringify(metadata, null, 2)}`
  )

  console.log('Scraped metadata')
}

function toClassMetadata (classes) {
  return classes.map(file => ({
    name: toName(file),
    usesDOM: toUsesDOM(file),
    needsCleanup: toNeedsCleanup(file),
    external: toExternal(file, 'classes'),
  }))
}

function toFactoriesMetadata (factories) {
  return factories.map(file => ({
    name: toName(file),
    external: toExternal(file, 'factories'),
  }))
}

function toName (file) {
  return parse(file).name
}

const constructorRE = /constructor ?\(.*?\) ?\{((.|\r?\n)*?)\n\s\s\}/,
      usesDomRE = /\/\/ METADATA: uses DOM/ // If the class constructor contains a 'METADATA: uses DOM' comment in its constructor, it uses the DOM
function toUsesDOM (file) {
  const contents = fs.readFileSync(`./src/classes/${file}`, 'utf8'),
        { 1: constructor = '' } = contents.match(constructorRE) || []

  return usesDomRE.test(constructor)
}

const externalRE = /\/\/ METADATA: EXTERNAL (.+)/ // If a class or factory has external dependencies, they will be pipe-separated in a 'METADATA: EXTERNAL' comment
function toExternal (file, type) {
  const contents = fs.readFileSync(`./src/${type}/${file}`, 'utf8'),
        { 1: metadata = '' } = contents.match(externalRE) || []
        
  return metadata
    ? toDependencies(metadata, file)
    : []
}

function toDependencies (metadata, file) { // External dependencies can be written as plain string or regular expressions
  return metadata
    .split('|')
    .map(metadatum => {
      // Handle simple strings
      if (!/^\/.+\/$/.test(metadatum)) {
        return metadatum
      }

      // Handle REs
      return new RegExp(metadatum.replace(/(^\/|\/$)/g, ''))
    })
}

const needsCleanupRE = /\n\s+stop ?\(.*?\) {/ // If the class has a `stop` method, it needs cleanup
function toNeedsCleanup (file) {
  const contents = fs.readFileSync(`./src/classes/${file}`, 'utf8')

  return needsCleanupRE.test(contents)
}

module.exports = generateMetadata
