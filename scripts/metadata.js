const sourceTransform = require('../source-transforms/toMetadata.js')
const fs = require('fs')

fs.writeFileSync('metadata/index.ts', sourceTransform.toMetadata())
