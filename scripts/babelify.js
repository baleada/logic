const { execSync } = require('child_process'),
      empty = require('./emptyDir')

module.exports = function() {
  empty('lib')
  const command = 'npx babel src --out-dir lib'
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
