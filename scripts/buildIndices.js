const fs = require('fs')

function buildIndices() {
  buildLibraryIndex()
  buildHelperIndex()
}

function buildLibraryIndex() {
  const libraries = fs
    .readdirSync('./src/libraries')
    .map(library => ({
      path: `./libraries/${library}`,
      name: library.split('.')[0],
    }))

  const imported = libraries.reduce((imported, library) => `${imported}import ${library.name} from '${library.path}'\n`, '')
  const exported = libraries.reduce((exported, library) => `${exported}  ${library.name},\n`, 'export default {\n') + '}'

  fs.writeFileSync(
    './src/index.js',
    `${imported}\n${exported}`
  )

  console.log(`Successfully index ${libraries.length} libraries.`)
}

function buildHelperIndex() {
  const helpers = fs
    .readdirSync('./src/helpers')
    .map(helper => ({
      path: `./${helper}`,
      name: helper.split('.')[0],
    }))

  const imported = helpers.reduce((imported, helper) => `${imported}import ${helper.name} from '${helper.path}'\n`, '')
  const exported = helpers.reduce((exported, helper) => `${exported}  ${helper.name},\n`, 'export default {\n') + '}'

  fs.writeFileSync(
    './src/helpers/index.js',
    `${imported}\n${exported}`
  )

  console.log(`Successfully index ${helpers.length} helpers.`)
}

buildIndices()
