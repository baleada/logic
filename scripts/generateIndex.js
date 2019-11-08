const fs = require('fs')

module.exports = function(filesPath, importPath, outfile) {
  const files = fs
          .readdirSync(`./${filesPath}`)
          .filter(file => file !== 'index.js')
          .map(file => ({
            path: `./${importPath}/${file}`,
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
