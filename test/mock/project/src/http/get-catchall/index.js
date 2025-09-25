let arc = require('../../../../../../src')
let asap = require('@architect/asap')

exports.handler = arc.http(asap())
