const fs = require('fs')
const { readFileSync, readdirSync } = fs
const path = require('path')
const { parse } = path

function toMetadata () {
  const classes = readdirSync('src/classes').filter(file => parse(file).ext === '.ts').map(file => parse(file).name),
        pipes = [...new Set(readFileSync('src/pipes.ts', 'utf8').match(/create\w+/g))],
        classMetadata = toClassMetadata(classes),
        metadata = {
          classes: classMetadata,
          pipes,
        },
        code = `
export type Metadatum = {
  name: string,
  needsCleanup: boolean,
  generic: string,
  state: string,
  stateType: string,
}

export const metadata: { classes: Metadatum[], pipes: string[] } = ${JSON.stringify(metadata, null, 2)}`

  console.log(`toMetadata: Scraped metadata for ${metadata.classes.length} classes and ${metadata.pipes.length} pipes`)

  return code
}

// type Metadatum = {
//   name: string,
//   needsCleanup: boolean,
//   generic: string,
//   state: string,
//   stateType: string,
// }

function toClassMetadata (classes) {
  return classes
    .map(name => {
      const contents = readFileSync(`src/classes/${name}.ts`, 'utf8')

      return {
        name,
        needsCleanup: toNeedsCleanup(contents),
        generic: toGeneric(contents),
        state: toState(contents),
        stateType: toStateType(contents),
      }
    })
}

const needsCleanupRE = /\n\s+stop ?\(.*?\) {/ // If the class has a `stop` method, it needs cleanup
function toNeedsCleanup (contents) {
  return needsCleanupRE.test(contents)
}

const genericRE = /export class \w+<(.*?)>/
function toGeneric (contents) {
  return contents.match(genericRE)?.[1] || ''
}

const stateAndStateTypeRE = /constructor \((.*?),/
function toState (contents) {
  return contents.match(stateAndStateTypeRE)?.[1]?.split(': ')?.[0]
}

function toStateType (contents) {
  return contents.match(stateAndStateTypeRE)?.[1]?.split(': ')?.[1]
}

module.exports = {
  toMetadata
}
