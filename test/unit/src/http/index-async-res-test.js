let { join } = require('path')
let sut = join(process.cwd(), 'src')
let { test } = require('node:test')
let assert = require('node:assert')
let http

let { http: httpFixtures } = require('@architect/req-res-fixtures')
let requests = httpFixtures.req
let responses = httpFixtures.res

let str = i => JSON.stringify(i)
let match = (copy, item) => `${copy} matches: ${item}`

let responsesTested = []

let copy = obj => JSON.parse(JSON.stringify(obj))

let run = async (response, request) => {
  responsesTested.push(response)
  let handler = http.async(async () => response)
  return await handler(request)
}

test('Set up env', () => {
  // Init env var to keep from stalling on db reads in CI
  process.env.ARC_SESSION_TABLE_NAME = 'jwe'

  let arc = require(sut)
  http = arc.http
  assert.ok(http, 'Loaded HTTP')
})

test('Architect v7 (HTTP)', async () => {
  let request = requests.arc7.getIndex

  let res = await run(responses.arc7.noReturn, copy(request))
  assert.strictEqual(res.body, '', 'Empty body passed')
  assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  assert.strictEqual(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc7.emptyReturn, copy(request))
  assert.strictEqual(res.body, '', 'Empty body passed')
  assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  assert.strictEqual(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc7.string, copy(request))
  assert.strictEqual(str(responses.arc7.string), res.body, match('res.body', res.body))
  assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  assert.strictEqual(res.statusCode, 200, 'Responded with 200')
})

test('Teardown', () => {
  delete process.env.ARC_SESSION_TABLE_NAME
})
