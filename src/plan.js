var parse = require('@smallwins/arc-parser')
var fs = require('fs')
//var path = require('path')

// accepts a path/to/.arc and returns an execution plan
module.exports = function plan(pathToArcFile, callback) {
  if (!fs.existsSync(pathToArcFile)) {
    throw Error(`Not found: ${pathToArcFile}`)
  }
  var arc = parse(fs.readFileSync(pathToArcFile).toString())
  callback(null, arc)
}
// grabs the app name
// loops thru each section calling section.plan
// console.log the plans
//
// v2
// pipes plans into section.createCode
//
//
// app
// - used for name
//
// events
// - creates lambda code and deployments
//
// html/json
// only get/post are supported
// must be a tuple
// must be a valid url that starts with /
// must be unique tuples
// can declare express style url params
// html and json are session enabled by default
// which means: we create a sessions table by default (arc-sessions; can override with SESSIONS_TABLE env var)
// html is configured for text/html: 200, 302, 403, 404, 500
// json is configured for appplication/json: 200, 201, 403, 404, 500
// their routes collected and operations for api gateway queued
// two api gateway deployments are created; one points to staging lambdas and one points to production lambdas
// both api gateway deployments deploy to a stage named arc
//
// tables
// - creates scripts for creating tables
// - enqueus commands for executin those scripts
// - possibly creates lambdas for triggers
//
//
