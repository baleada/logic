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
        exported = files.reduce((exported, file) => `${exported}export { default as ${file.name} } from '${file.path}'\n`, '')

  fs.writeFileSync(
    `./${outfile}.js`,
    exported
  )

  console.log(`Indexed ${files.length} files in ${filesPath}.`)
}
