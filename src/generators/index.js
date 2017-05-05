var fs = require('fs')
var parse = require('@smallwins/arc-parser')
var assert = require('@smallwins/validate/assert')
var execute = require('./_exec')

// {arcFile:'path/to/.arc', execute:false} returns .arc execution plan
// {arcFile:'path/to/.arc', execute:true} runs .arc execution plan
module.exports = function generate(params, callback) {
  
  // validate programmer input
  assert(params, {
    arcFile: String,
    execute: Boolean
  })

  // ensure the .arc file exists
  if (!fs.existsSync(params.arcFile)) {
    throw Error(`Not found: ${params.arcFile}`)
  }

  // parse the .arc file (slow! should be async)
  var text = fs.readFileSync(params.arcFile).toString()
  var arc = parse(text)

  // TODO validate arc
  // collect all errors and display gracefully

  // plans are sequence of commands to execute
  var plans = []
  var app = arc.app[0]
  
  // build up a plan for events
  arc.events.forEach(event=> {
    plans.push({action:'create-sns-lambda-code', event, app})
    plans.push({action:'create-sns-topics', event, app})
    plans.push({action:'create-sns-lambda-deployments', event, app})
  })

  /*
  // build up a plan for html
  arc.html.forEach(route=> {
    plans.push({action:'create-html-lambda-code', route, app})
    plans.push({action:'create-html-lambda-deployments', route, app})
  }) 

// html and json are session enabled by default
// if json by itself there will be no session enabled
// which means: we create a sessions table by default (arc-sessions; can override with SESSIONS_TABLE env var)
// html is configured for text/html: 200, 302, 403, 404, 500
// json is configured for appplication/json: 200, 201, 403, 404, 500

  // build up a plan for json
  arc.json.forEach(route=> {
    plans.push({action:'create-json-lambda-code', route, app})
    plans.push({action:'create-json-lambda-deployments', route, app})
  })

  // build up a plan for api gateway
  plans.push({
    action: 'create-api-gateway-restapi', app
  })
  // add routes to api gateway
  arc.html.forEach(route=> {
    plans.push({action:'create-api-gateway-html-route', route, app})
  }) 
  arc.json.forEach(route=> {
    plans.push({action:'create-api-gateway-json-route', route, app})
  }) 
  */
  // build up a plan for tables
  // - creates tables
  // - creates any trigger lambdas
  // - 
  // build up a plan for indexes
 
  // if we're executing plans
  // do that
  if (params.execute) {
    execute(plans, callback)
  }
  else {
    // otherwise return the plan
    callback(null, plans) 
  }
}
