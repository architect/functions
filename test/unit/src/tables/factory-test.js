let test = require('tape')
let proxyquire = require('proxyquire')

let fakeDb = {};
let fakeDoc = {};

let factory = proxyquire('../../../../src/tables/factory', {
  './dynamo': { db:{}, doc: {}},
  'run-parallel': (_, cb) => cb(null, {doc:fakeDoc, db:fakeDb})
})

test('tables.factory client properties', t => {
  t.plan(3)
  let tables = {bat:'country'};
  factory(tables, (err, client) => {
    if (err) t.fail(err)
    t.ok(client._db === fakeDb, '_db property assigned')
    t.ok(client._doc === fakeDoc, '_doc property assigned')
    t.ok(client.bat, 'table name assigned')
  })
})
test('tables.factory client static methods', t => {
  t.plan(2)
  let tables = {quart:'tequila'};
  factory(tables, async (err, client) => {
    if (err) t.fail(err)
    t.equals(await client.reflect(), tables, 'reflect() returns tables object');
    t.equals(client._name('quart'), 'tequila', '_name() returns tables value');
  })
})
