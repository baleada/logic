import { readdirSync, readFileSync } from 'fs'
import * as AnimateableExports from '../src/classes/Animateable'
import * as CompleteableExports from '../src/classes/Completeable'
import * as CopyableExports from '../src/classes/Copyable'
import * as DelayableExports from '../src/classes/Delayable'
import * as DispatchableExports from '../src/classes/Dispatchable'
import * as FetchableExports from '../src/classes/Fetchable'
import * as FullscreenableExports from '../src/classes/Fullscreenable'
import * as GrantableExports from '../src/classes/Grantable'
import * as ListenableExports from '../src/classes/Listenable'
import * as NavigateableExports from '../src/classes/Navigateable'
import * as RecognizeableExports from '../src/classes/Recognizeable'
import * as ResolveableExports from '../src/classes/Resolveable'
import * as SanitizeableExports from '../src/classes/Sanitizeable'
import * as SearchableExports from '../src/classes/Searchable'
import * as StoreableExports from '../src/classes/Storeable'
import * as extracted from '../src/extracted'
import * as pipeExports from '../src/pipes'

function checkTestCoverage () {
  const pipes = Object.keys(pipeExports)
  const allExports = Object.keys({
    ...AnimateableExports,
    ...CompleteableExports,
    ...CopyableExports,
    ...DelayableExports,
    ...DispatchableExports,
    ...FetchableExports,
    ...FullscreenableExports,
    ...GrantableExports,
    ...ListenableExports,
    ...NavigateableExports,
    ...RecognizeableExports,
    ...ResolveableExports,
    ...SanitizeableExports,
    ...SearchableExports,
    ...StoreableExports,
    ...extracted
  })

  let nodeTests = readdirSync('./tests/node'),
      browserTests = readdirSync('./tests/browser'),
      pipeTests = readFileSync('./tests/node/pipes.test.ts', 'utf8'),
      allTests = []
        .concat(nodeTests, browserTests)
        .map(test => test.replace('.test.ts', '')),
      missingTests = allExports
        .filter(exprt => !allTests.includes(exprt) && !except.has(exprt) && !exprt.startsWith('define'))
        .concat(pipes.filter(pipe => !(new RegExp(pipe)).test(pipeTests) && !except.has(pipe)))

  console.log({ desired: allExports.length, written: nodeTests.concat(browserTests).length, missing: missingTests })
}

const except = new Set<string>([
  'isArray',
  'isFunction',
  'isNull',
  'isNumber',
  'isString',
  'isUndefined',
  'default'
])

checkTestCoverage()
