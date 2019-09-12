import Papa from 'papaparse'

export default function parseCsv (file, options) {
  Papa.parse(file, options)
}
