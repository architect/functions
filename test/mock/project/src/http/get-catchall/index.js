const arc = require('../../../../../../src')
const asap = require('@architect/asap')

exports.handler = arc.http(asap())
