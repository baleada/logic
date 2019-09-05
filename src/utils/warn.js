import { hasEveryProperty, hasSomeProperties } from './hasProperties'

const dictionary = {
  hasRequiredOptions: {
    shouldWarn: ({ received, required, every }) => {
      return every
        ? !hasEveryProperty(received, required)
        : !hasSomeProperties(received, required)
    },
    getWarning: ({ subject, required, every, docs }) => {
      const main = required.length > 1
              ? `${subject} received neither ${required[0]} ${required.slice(1).map(option => 'nor ' + option)} options.`
              : `${subject} did not receive ${required[0]} option.`,
            someOrEvery = required.length > 1
              ? `${every ? 'All' : 'Some'} of those options are required.`
              : `This option is required.`,
            docsLink = `See the docs for more info: ${docs}`

      return `${main} ${someOrEvery} ${docsLink}`
    }
  }
}

export default function warn (type, args) {
  if (dictionary[type].shouldWarn(args)) {
    console.warn(dictionary[type].getWarning(args))
  }
}
