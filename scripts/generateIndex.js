const fs = require('fs'),
      filesPath = process.argv[2],
      importPath = process.argv[3],
      outfile = process.argv[4]

function generateIndex (filesPath, importPath, outfile) {
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

generateIndex(filesPath, importPath, outfile)
