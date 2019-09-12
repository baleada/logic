import XLSX from 'xlsx'

export default function parseXlsx(file) {
  const readAsBinaryString = true,
        reader = new FileReader()

  let parsed
  reader.onload = (evt) => {
    let data = evt.target.result
    if(!readAsBinaryString) data = new Uint8Array(data)

    parsed = XLSX.read(data, { type: readAsBinaryString ? 'binary' : 'array' })
  }

  switch(true) {
    case readAsBinaryString:
      reader.readAsBinaryString(file)
      break;

    default:
      reader.readAsArrayBuffer(file)
      break;
  }

  return parsed
}
