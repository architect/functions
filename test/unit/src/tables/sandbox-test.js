let test = require('tape')
let sandbox = require('../../../../src/tables/sandbox')

let fakeDoc = {}
let fakeTables = { TableNames: [] }
let fakeDb = { listTables: (_, cb) => cb(null, fakeTables) }
const fakeDynamo = { db: cb => cb(null, fakeDb), doc: cb => cb(null, fakeDoc) }
const appname = 'testapp'
function buildTables (arr) {
  arr.push('arc-sessions')
  let tables = []
  arr.forEach(t => {
    tables.push(`${appname}-staging-${t}`)
    tables.push(`${appname}-production-${t}`)
  })
  return tables
}

test('tables.sandbox should return a client/object with properties for each user-defined table', t => {
  t.plan(4)
  fakeTables.TableNames = buildTables([ 'accounts', 'posts' ])
  sandbox(fakeDynamo, (err, client) => {
    if (err) t.fail(err)
    t.ok(client._db === fakeDb, '_db property assigned')
    t.ok(client._doc === fakeDoc, '_doc property assigned')
    t.ok(client.accounts, 'first user-defined table created')
    t.ok(client.posts, 'second user-defined table created')
  })
})

test('tables.sandbox should return a client/object with properties for user-defined tables using arc reserved-ish names like staging and production', t => {
  t.plan(2)
  fakeTables.TableNames = buildTables([ 'stagings', 'productions' ])
  sandbox(fakeDynamo, (err, client) => {
    if (err) t.fail(err)
    t.ok(client.stagings, '"stagings" user-defined table created')
    t.ok(client.productions, '"productions" user-defined table created')
  })
})
