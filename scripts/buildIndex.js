const fs = require('fs')

function buildIndex() {
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

buildIndex()
