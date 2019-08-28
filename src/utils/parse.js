import parseCsv from './parseCsv.js'
import parseXlsx from './parseXlsx.js'

const parse = {
  date: a => new Date(a),
  json: a => JSON.parse(a),
  number: a => Number(a),
  string: a => JSON.stringify(a),
}

export {
  parse,
  parseCsv,
  parseXlsx,
}
