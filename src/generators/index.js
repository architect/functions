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

  // build up a plan for html
  arc.html.forEach(route=> {
    plans.push({action:'create-html-lambda-code', route, app})
    plans.push({action:'create-html-lambda-deployments', route, app})
  })

  // build up a plan for json
  arc.json.forEach(route=> {
    plans.push({action:'create-json-lambda-code', route, app})
    plans.push({action:'create-json-lambda-deployments', route, app})
  })

  // html and json are session enabled by default
  // which means: we create a sessions table by default
  // (arc-sessions; can override with SESSIONS_TABLE env var)
  var sessions = arc.json.length > 0 || arc.html.length > 0
  if (sessions) {
    var table = {
      'arc-sessions': {
        _idx: '*String',
        _ttl: 'TTL'
      }
    }
    plans.push({action:'create-tables', table, app})
  }

  arc.tables.forEach(table=> {
    plans.push({action:'create-tables', table, app})
    var name = Object.keys(table)[0]
    var triggers = table[name].hasOwnProperty('insert') || table[name].hasOwnProperty('update') || table[name].hasOwnProperty('destroy')
    if (triggers) {
      plans.push({action:'create-table-lambda-code', table, app})
      plans.push({action:'create-table-lambda-deployments', table, app})
    }
  })

  /* build up a plan for indexes
  arc.indexes.forEach(index=> {
    plans.push({action:'create-table-index', index, app})
  })
  */

  /* build up a plan for scheduled
  arc.scheduled.forEach(scheduled=> {
    plans.push({action:'create-scheduled-lambda-code', scheduled, app})
    plans.push({action:'create-scheduled-lambda-deployments', scheduled, app})
  })
  */

  /*
   // build up a plan for api gateway
  plans.push({
    action: 'create-api-gateways', app
  })
  // add routes to api gateway
  arc.html.forEach(route=> {
    plans.push({action:'create-api-html-route', route, app})
  })
  arc.json.forEach(route=> {
    plans.push({action:'create-api-json-route', route, app})
  })
  // html is configured for text/html: 200, 302, 403, 404, 500
  // json is configured for appplication/json: 200, 201, 403, 404, 500
  //
  @slack
  action
  options
  event
  slash

  //
  */

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
