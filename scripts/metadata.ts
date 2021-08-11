import { toMetadata } from '../source-transforms/toMetadata'
import { writeFileSync } from 'fs'

writeFileSync('metadata/index.ts', toMetadata())
