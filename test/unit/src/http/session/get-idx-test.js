let test = require('tape')
let { join } = require('path')
let sut = join(process.cwd(), 'src', 'http', 'session', 'providers', '_get-idx')
let getIdx = require(sut)

test('Set up env', t => {
  t.plan(1)
  t.ok(getIdx, 'Got getIdx module')
})

test('Test some cookies', t => {
  t.plan(7)
  let result
  let cookie
  let random = Math.random() + ''
  let idx = `_idx=${random}`

  result = getIdx()
  t.equal(result, '', 'Passing nothing returns empty string')

  result = getIdx('')
  t.equal(result, '', 'Passing empty string returns empty string')

  cookie = 'some random text'
  result = getIdx(cookie)
  t.equal(result, '', 'Passing arbitrary non-cookie string returns empty string')

  cookie = 'key=value'
  result = getIdx(cookie)
  t.equal(result, '', 'Passing non-matching cookie string returns empty string')

  cookie = idx
  result = getIdx(cookie)
  t.equal(result, idx, `Passing single cookie string with _idx returns correct value: ${cookie}`)

  cookie = `key=value; ${idx}; anotherkey=anothervalue;`
  result = getIdx(cookie)
  t.equal(result, idx, `Passing multiple cookies with one _idx returns correct value: ${idx}`)

  cookie = `key=value; _idx=foo; ${idx}; anotherkey=anothervalue;`
  result = getIdx(cookie)
  t.equal(result, idx, `Passing multiple _idx cookies returns last cookie: ${idx}`)
})
