const fs = require('fs')

function buildIndices () {
  buildClassIndex()
  // buildHelperIndex()
}

function buildClassIndex () {
  const classes = fs
          .readdirSync('./src/classes')
          .map(clss => ({
            path: `./classes/${clss}`,
            name: clss.split('.')[0],
          })),
        imported = classes.reduce((imported, clss) => `${imported}import ${clss.name} from '${clss.path}'\n`, ''),
        exported = classes.reduce((exported, clss) => `${exported}  ${clss.name},\n`, 'export {\n') + '}'

  fs.writeFileSync(
    './src/index.js',
    `${imported}\n${exported}`
  )

  console.log(`Indexed ${classes.length} classes.`)
}

// function buildHelperIndex () {
//   const helpers = fs
//           .readdirSync('./src/helpers')
//           .map(helper => ({
//             path: `./src/helpers/${helper}`,
//             name: helper.split('.')[0],
//           })),
//         imported = helpers.reduce((imported, helper) => `${imported}import ${helper.name} from '${helper.path}'\n`, ''),
//         exported = helpers.reduce((exported, helper) => `${exported}  ${helper.name},\n`, 'export {\n') + '}'
//
//   fs.writeFileSync(
//     './helpers.js',
//     `${imported}\n${exported}`
//   )
//
//   console.log(`Indexed ${helpers.length} helpers.`)
// }

buildIndices()
