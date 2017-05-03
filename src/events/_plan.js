module.exports = function _plan(arc, callback) {

  // plans are sequence of commands to execute
  var plans = []
  var appName = arc.app
  
  arc.events.forEach(e=> {
    
    // create lambda code locally
    plans.push({
      action: 'create-sns-lambda-code', 
      name: `${appName}-${e}`
    })

    // create the sns topic
    plans.push({
      action: 'create-sns-topic',
      topic: `${appName}-staging-${e}`
    })
    plans.push({
      action: 'create-sns-topic',
      topic: `${appName}-production-${e}`
    })

    // create lambda deployments
    plans.push({
      action: 'create-sns-lambda-deployment',
      name: `${appName}-events-staging-${e}`,
      topic: `${appName}-staging-${e}`
    })
    plans.push({
      action: 'create-sns-lambda-deployment',
      name: `${appName}-events-production-${e}`,
      topic: `${appName}-production-${e}`
    })
  })

  // return the plan
  callback(null, plans) 
}
