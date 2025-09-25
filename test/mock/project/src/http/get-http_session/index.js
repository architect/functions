let arc = require('../../../../../../src')

function handler (req, res) {
  let { query, session } = req
  if (query.session === 'create') {
    session.unique = new Date().toISOString()
  }
  if (query.session === 'update') {
    session.another = new Date().toISOString()
  }
  if (query.session === 'destroy') {
    session = {}
  }
  res({
    session,
    json: JSON.stringify(session),
  })
}

exports.handler = arc.http(handler)
