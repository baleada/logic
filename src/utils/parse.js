// TODO: why include these?
// import parseCSV from './parse-csv.js'
// import parseXLSX from './parse-xlsx.js'

const parse = {
  date: a => new Date(a),
  json: a => JSON.parse(a),
  number: a => Number(a),
  string: a => JSON.stringify(a),
}

export {
  parse,
  // parseCSV,
  // parseXLSX,
}
