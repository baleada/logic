const { execSync } = require('child_process'),
      empty = require('./emptyDir')

module.exports = function() {
  empty('browser-lib')
  const command = 'npx babel src --config-file ./browser-babel.config.js --out-dir browser-lib'
  execSync(command, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return
    }

    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`)
    console.log(`stderr: ${stderr}`)
  })
}
