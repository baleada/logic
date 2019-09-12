const fs = require('fs')

function buildIndices () {
  buildLibraryIndex()
  buildHelperIndex()
}

function buildLibraryIndex () {
  const libraries = fs
          .readdirSync('./src/libraries')
          .map(library => ({
            path: `./lib/libraries/${library}`,
            name: library.split('.')[0],
          })),
        imported = libraries.reduce((imported, library) => `${imported}import ${library.name} from '${library.path}'\n`, ''),
        exported = libraries.reduce((exported, library) => `${exported}  ${library.name},\n`, 'export {\n') + '}'

  fs.writeFileSync(
    './index.js',
    `${imported}\n${exported}`
  )

  console.log(`Indexed ${libraries.length} libraries.`)
}

function buildHelperIndex () {
  const helpers = fs
          .readdirSync('./src/helpers')
          .map(helper => ({
            path: `./lib/helpers/${helper}`,
            name: helper.split('.')[0],
          })),
        imported = helpers.reduce((imported, helper) => `${imported}import ${helper.name} from '${helper.path}'\n`, ''),
        exported = helpers.reduce((exported, helper) => `${exported}  ${helper.name},\n`, 'export {\n') + '}'

  fs.writeFileSync(
    './helpers.js',
    `${imported}\n${exported}`
  )

  console.log(`Indexed ${helpers.length} helpers.`)
}

buildIndices()
