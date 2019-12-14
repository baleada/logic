import hasProperties from './hasProperties'

const dictionary = {
  hasRequiredOptions: {
    shouldWarn: ({ received, required, every }) => hasProperties({ object: received, properties: required }, { every }),
    getWarning: ({ subject, required, every, docs }) => {
      const main = required.length > 1
        ? `${subject} received neither ${required[0]} ${required.slice(1).map(option => 'nor ' + option).join(' ')} options.`
        : `${subject} did not receive ${required[0]} option.`,
            someOrEvery = required.length > 1
              ? `${every ? 'All' : 'Some'} of those options are required.`
              : `This option is required.`,
            docsLink = `See the docs for more info: ${docs}`

      return `${main} ${someOrEvery} ${docsLink}`
    }
  },
  noFallbackAvailable: {
    shouldWarn: () => true,
    getWarning: ({ subject }) => `There is no fallback available for ${subject}.`
  }
}

export default function warn (type, args) {
  if (dictionary[type].shouldWarn(args)) {
    console.warn(dictionary[type].getWarning(args))
  }
}
