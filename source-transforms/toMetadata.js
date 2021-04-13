import { readFileSync } from 'fs'

export default function toMetadata () {
  const classes = readFileSync('./src/classes.js', 'utf8'),
        pipes = readFileSync('./src/pipes.js', 'utf8'),
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
  return [...new Set(classes.match(/[A-Z]\w+/g))]
    .map(name => ({
      name,
      needsCleanup: toNeedsCleanup(`src/classes/${name}.js`),
    }))
}

function toPipesMetadata (pipes) {
  return [...new Set(pipes.match(/create\w+/g))]
}

const needsCleanupRE = /\n\s+stop ?\(.*?\) {/ // If the class has a `stop` method, it needs cleanup
function toNeedsCleanup (file) {
  const contents = readFileSync(file, 'utf8')

  return needsCleanupRE.test(contents)
}

