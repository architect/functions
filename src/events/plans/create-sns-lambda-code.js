var mkdir = require('mkdirp').sync

module.exports = function _createLambda(params, callback) {
  mkdir('src')
  mkdir('src/events')
  mkdir(`src/events/${params.name}`)
      // write src/events/lambda-name/package.json
      // write src/events/lambda-name/index.json
      // install node_modules
  callback()
}
