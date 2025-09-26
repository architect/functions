let http = require('../../../../../src/http')
let { test } = require('node:test')
let assert = require('node:assert')

test('exists', () => {
  assert.ok(http.csrf.create, 'create')
  assert.ok(http.csrf.verify, 'verify')
})

test('create a value', () => {
  let val = http.csrf.create()
  assert.ok(val, 'created value')
})

test('verify a value', () => {
  let val = http.csrf.create()
  assert.ok(http.csrf.verify(val), 'value verified')
})

test('tampered token is falsy', () => {
  let tamperedToken = '3d879d515ab241429c97dfea6d1e1927.1584118407000.b0b34563d569030cbe9a4ea63312f23729813b838478420e3811c0bfeaf3add1'
  assert.ok(http.csrf.verify(tamperedToken) === false, 'value falsy')
})

test('token expired is falsy', () => {
  let expiredToken = '3d879d515ab241419c97dfea6d1e1927.1584118407000.b0b34563d569030cbe9a4ea63312f23729813b838478420e3811c0bfeaf3add1'
  assert.ok(http.csrf.verify(expiredToken) === false, 'value falsy')
})


