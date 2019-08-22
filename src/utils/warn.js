const dictionary = {
  hasOptions: {
    shouldWarn: ({ object, options, every }) => {
      return every
        ? !options.every(option => object.hasOwnProperty(option))
        : !options.some(option => object.hasOwnProperty(option))
    },
    getWarning: ({ subject, options }) => {
      return options.length > 1
        ? `${subject} received neither ${options[0]} ${options.slice(1).map(option => 'nor ' + option)} options.`
        : `${subject} did not receive ${options[0]} option.`
    }
  }
}

export default function warn(type, args) {
  if (dictionary[type].shouldWarn(args)) console.warn(dictionary[type].getWarning(args))
}
