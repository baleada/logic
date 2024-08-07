import { readdirSync, readFileSync } from 'fs'
import * as AnimateableExports from '../src/classes/Animateable'
import * as BroadcastableExports from '../src/classes/Broadcastable'
import * as CompleteableExports from '../src/classes/Completeable'
import * as CopyableExports from '../src/classes/Copyable'
import * as DelayableExports from '../src/classes/Delayable'
import * as FetchableExports from '../src/classes/Fetchable'
import * as FullscreenableExports from '../src/classes/Fullscreenable'
import * as GrantableExports from '../src/classes/Grantable'
import * as ListenableExports from '../src/classes/Listenable'
import * as NavigateableExports from '../src/classes/Navigateable'
import * as RecognizeableExports from '../src/classes/Recognizeable'
import * as ResolveableExports from '../src/classes/Resolveable'
import * as StoreableExports from '../src/classes/Storeable'
import * as extracted from '../src/extracted'
import * as pipeExports from '../src/pipes'

function checkTestCoverage () {
  const pipes = Object.keys(pipeExports)
  const allExports = Object.keys({
    ...AnimateableExports,
    ...BroadcastableExports,
    ...CompleteableExports,
    ...CopyableExports,
    ...DelayableExports,
    ...FetchableExports,
    ...FullscreenableExports,
    ...GrantableExports,
    ...ListenableExports,
    ...NavigateableExports,
    ...RecognizeableExports,
    ...ResolveableExports,
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
        .filter(exprt => !allTests.includes(exprt) && !except.has(exprt) && !exprt.startsWith('define') && !exprt.startsWith('createDefine'))
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
