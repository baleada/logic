import { readdirSync, readFileSync } from 'fs'
import { parse } from 'path'

export default function toMetadata () {
  const classes = readdirSync('./src/classes').filter(file => !/index\.js$/.test(file)),
        factories = readdirSync('./src/factories').filter(file => !/index\.js$/.test(file)),
        classMetadata = toClassMetadata(classes),
        subclassMetadata = toFactoriesMetadata(factories),
        metadata = {
          classes: classMetadata,
          factories: subclassMetadata,
        },
        code = `export default ${JSON.stringify(metadata, null, 2)}`

  console.log(`toMetadata: Scraped metadata for ${metadata.classes.length} classes and ${metadata.factories.length} factories`)

  return code
}

function toClassMetadata (classes) {
  return classes.map(file => ({
    name: toName(file),
    usesDOM: toUsesDOM(file),
    needsCleanup: toNeedsCleanup(file),
  }))
}

function toFactoriesMetadata (factories) {
  return factories.map(file => ({
    name: toName(file),
  }))
}

function toName (file) {
  return parse(file).name
}

const constructorRE = /constructor ?\(.*?\) ?\{((.|\r?\n)*?)\n\s\s\}/,
      usesDomRE = /\/\/ METADATA: uses DOM/ // If the class constructor contains a 'METADATA: uses DOM' comment in its constructor, it uses the DOM
function toUsesDOM (file) {
  const contents = readFileSync(`./src/classes/${file}`, 'utf8'),
        { 1: constructor = '' } = contents.match(constructorRE) || []

  return usesDomRE.test(constructor)
}

const needsCleanupRE = /\n\s+stop ?\(.*?\) {/ // If the class has a `stop` method, it needs cleanup
function toNeedsCleanup (file) {
  const contents = readFileSync(`./src/classes/${file}`, 'utf8')

  return needsCleanupRE.test(contents)
}

