const { exec } = require('@baleada/prepare')

module.exports = function() {
  exec('rollup --config rollup.config.js')
}
