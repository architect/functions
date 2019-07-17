const GetIndexDefaultHandler = require('./public')

exports.handler = GetIndexDefaultHandler({
  spa: true,
  wth: true,
  ffs: false,
})
