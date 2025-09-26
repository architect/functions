let { test } = require('node:test')
let assert = require('node:assert')
let { join } = require('path')
let sut = join(process.cwd(), 'src', 'http', 'session', 'providers', '_get-idx')
let getIdx = require(sut)

test('Set up env', () => {
  assert.ok(getIdx, 'Got getIdx module')
})

test('Test some cookies', () => {
  let result
  let cookie
  let random = Math.random() + ''
  let idx = `_idx=${random}`

  result = getIdx()
  assert.strictEqual(result, '', 'Passing nothing returns empty string')

  result = getIdx('')
  assert.strictEqual(result, '', 'Passing empty string returns empty string')

  cookie = 'some random text'
  result = getIdx(cookie)
  assert.strictEqual(result, '', 'Passing arbitrary non-cookie string returns empty string')

  cookie = 'key=value'
  result = getIdx(cookie)
  assert.strictEqual(result, '', 'Passing non-matching cookie string returns empty string')

  cookie = idx
  result = getIdx(cookie)
  assert.strictEqual(result, idx, `Passing single cookie string with _idx returns correct value: ${cookie}`)

  cookie = `key=value; ${idx}; anotherkey=anothervalue;`
  result = getIdx(cookie)
  assert.strictEqual(result, idx, `Passing multiple cookies with one _idx returns correct value: ${idx}`)

  cookie = `key=value; _idx=foo; ${idx}; anotherkey=anothervalue;`
  result = getIdx(cookie)
  assert.strictEqual(result, idx, `Passing multiple _idx cookies returns last cookie: ${idx}`)
})
