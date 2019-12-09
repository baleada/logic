const dictionary = {}

export default function warn (type, args) {
  if (dictionary[type].shouldError(args)) {
    throw new Error(dictionary[type].getError(args))
  }
}
