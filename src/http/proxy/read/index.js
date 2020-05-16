let readLocal = require('./local')
let readS3 = require('./s3')

function read () {
  let { ARC_LOCAL, NODE_ENV } = process.env
  let local = NODE_ENV === 'testing' || ARC_LOCAL
  return local ? readLocal : readS3
}

module.exports = read()
