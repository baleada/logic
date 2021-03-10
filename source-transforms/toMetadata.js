import { readFileSync } from 'fs'
import { parse } from 'path'
import { Pipeable, createUnique } from '../src/pipes.js'

export default function toMetadata () {
  const classes = readFileSync('./src/classes.js'),
        pipes = readFileSync('./src/pipes.js'),
        classMetadata = toClassMetadata(classes),
        subclassMetadata = toPipesMetadata(pipes),
        metadata = {
          classes: classMetadata,
          pipes: subclassMetadata,
        },
        code = `export default ${JSON.stringify(metadata, null, 2)}`

  console.log(`toMetadata: Scraped metadata for ${metadata.classes.length} classes and ${metadata.pipes.length} pipes`)

  return code
}

function toClassMetadata (classes) {
  return new Pipeable(classes.match(/[A-Z]\w+/g))
    .pipe(createUnique())
    .map(name => ({
      name,
      needsCleanup: toNeedsCleanup(`src/classes/${name}.js`),
    }))
}

function toPipesMetadata (pipes) {
  return new Pipeable(pipes.match(/create\w+/))
    .pipe(createUnique())
    .concat(['Pipeable'])
}

function toName (file) {
  return parse(file).name
}

const needsCleanupRE = /\n\s+stop ?\(.*?\) {/ // If the class has a `stop` method, it needs cleanup
function toNeedsCleanup (file) {
  const contents = readFileSync(`./src/classes/${file}`, 'utf8')

  return needsCleanupRE.test(contents)
}

