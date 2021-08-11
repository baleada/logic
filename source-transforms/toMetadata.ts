import { readFileSync, readdirSync } from 'fs'
import { parse } from 'path'

export function toMetadata () {
  const classes = readdirSync('src/classes').filter(file => parse(file).ext === '.ts').map(file => parse(file).name),
        pipes = [...new Set(readFileSync('src/pipes.ts', 'utf8').match(/create\w+/g))],
        classMetadata = toClassMetadata(classes),
        metadata = {
          classes: classMetadata,
          pipes,
        },
        code = `\
export type Metadatum = {
  name: string,
  needsCleanup: boolean,
  generics: string[],
  optionsGenerics: string[],
  state: string,
  stateType: string,
  typeExports: string[],
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
        generics: toGenerics(contents),
        optionsGenerics: toOptionsGenerics(contents),
        state: toState(contents),
        stateType: toStateType(contents),
        typeExports: toTypeExports(name)
      }
    })
}

const needsCleanupRE = /\n\s+stop ?\(.*?\) {/ // If the class has a `stop` method, it needs cleanup
function toNeedsCleanup (contents) {
  return needsCleanupRE.test(contents)
}


const genericRE = /export class \w+<(.*?)> {/,
      recordCommaRE = /<(.*?), (.*?)>/g,
      recordCommaReplacement = '2PtwMFnK', // nanoid
      recordCommaReplacementRE = new RegExp(recordCommaReplacement, 'g'),
      recordCommaReplacer = (match, key, value) => `<${key}${recordCommaReplacement}${value}>`
function toGenerics (contents) {
  return (contents.match(genericRE)?.[1] || '')
    .replace(recordCommaRE, recordCommaReplacer)
    .split(', ')
    .filter(generic => generic)
    .map(generic => generic.replace(recordCommaReplacementRE, ', '))
}

const optionsGenericRE = /constructor.*?options\??: \w+Options<(.*?)>/
function toOptionsGenerics (contents) {
  return (contents.match(optionsGenericRE)?.[1] || '')
    .replace(recordCommaRE, recordCommaReplacement)
    .split(', ')
    .filter(generic => generic)
    .map(generic => generic.replace(recordCommaReplacementRE, ', '))
}

const stateAndStateTypeRE = /constructor \((.*?),/
function toState (contents) {
  return contents.match(stateAndStateTypeRE)?.[1]?.split(': ')?.[0]
}

function toStateType (contents) {
  return contents.match(stateAndStateTypeRE)?.[1]?.split(': ')?.[1]
}


function toTypeExports (name: string): string[] {
  const classesIndex = readFileSync('src/classes.ts', 'utf8'),
        typeExportsRE = new RegExp(`export type \{ (.*?) \} from '\.\/classes\/${name}'`)

  return classesIndex.match(typeExportsRE)[1].split(', ')
}
