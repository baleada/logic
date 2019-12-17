const fs = require('fs')

module.exports = function(filesPath, options = {}) {
  options = {
    outfile: `${filesPath}/index`,
    extensions: ['js'],
    ...options
  }

  const { outfile, importPath } = options,
        files = fs
          .readdirSync(`./${filesPath}`)
          .filter(file => file !== 'index.js' && fs.lstatSync(`./${filesPath}/${file}`).isFile())
          .map(file => ({
            path: importPath ? `./${importPath}/${file}` : `./${file}`,
            name: file.split('.')[0],
          })),
        imported = files.reduce((imported, file) => `${imported}import ${file.name} from '${file.path}'\n`, ''),
        exported = files.reduce((exported, file) => `${exported}  ${file.name},\n`, 'export {\n') + '}'

  fs.writeFileSync(
    `./${outfile}.js`,
    `\
${imported}\n${exported}\n\
`
  )

  console.log(`Indexed ${files.length} files in ${filesPath}.`)
}
