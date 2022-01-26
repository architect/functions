let test = require('tape')
let aws = require('aws-sdk')
let awsMock = require('aws-sdk-mock')
awsMock.setSDKInstance(aws)
let discovery = require('../../../../src/discovery')

test('Set up env', t => {
  t.plan(1)
  process.env.ARC_APP_NAME = 'test'
  process.env.ARC_SANDBOX = JSON.stringify({ ports: {} })
  t.pass('Set up ARC_APP_NAME env var')
})

test('discovery should callback with error if SSM errors', t => {
  t.plan(1)
  awsMock.mock('SSM', 'getParametersByPath', (params, cb) => cb(true))
  discovery(err => {
    t.ok(err, 'error passed into discovery callback')
    awsMock.restore()
  })
})

test('discovery should parse hierarchical SSM parameters into a service map object', t => {
  t.plan(3)
  awsMock.mock('SSM', 'getParametersByPath', (params, cb) => cb(null, {
    Parameters: [
      { Name: '/app/tables/cats', Value: 'tableofcats' },
      { Name: '/app/events/walkthedog', Value: 'timetowalkthedog' }
    ]
  }))
  discovery((err, services) => {
    t.notOk(err, 'no error passed to callback')
    t.equals(services.tables.cats, 'tableofcats', 'cat table value set up in correct place of service map')
    t.equals(services.events.walkthedog, 'timetowalkthedog', 'dogwalking event value set up in correct place of service map')
    awsMock.restore()
  })
})

test('discovery should parse hierarchical SSM parameters, even ones of different depths, into a service map object', t => {
  t.plan(6)
  awsMock.mock('SSM', 'getParametersByPath', (params, cb) => cb(null, {
    Parameters: [
      { Name: '/app/tables/cats', Value: 'tableofcats' },
      { Name: '/app/cloudwatch/metrics/catbarf', Value: 'somuchbarf' },
      { Name: '/app/cloudwatch/metrics/chill', Value: 'quite' }
    ]
  }))
  discovery((err, services) => {
    t.notOk(err, 'no error passed to callback')
    t.equals(services.tables.cats, 'tableofcats', 'cat table value set up in correct place of service map')
    t.ok(services.cloudwatch, 'cloudwatch object exists')
    t.ok(services.cloudwatch.metrics, 'cloudwatch.metrics object exists')
    t.equals(services.cloudwatch.metrics.catbarf, 'somuchbarf', 'cloudwatch.metrics.catbarf variable has correct value')
    t.ok(services.cloudwatch.metrics.chill, 'quite', 'cloudwatch.metrics.child variable has correct value')
    awsMock.restore()
  })
})

test('discovery should parse several pages of hierarchical SSM parameters into a service map object', t => {
  t.plan(5)
  let ssmCounter = 0
  awsMock.mock('SSM', 'getParametersByPath', (params, cb) => {
    let NextToken = null
    let Parameters = [
      { Name: '/app/tables/cats', Value: 'tableofcats' },
      { Name: '/app/events/walkthedog', Value: 'timetowalkthedog' }
    ]
    if (ssmCounter === 1) {
      Parameters[0].Name = '/app/queues/breadline'
      Parameters[0].Value = 'favouritebakery'
      Parameters[1].Name = '/app/tables/ofcontents'
      Parameters[1].Value = 'chapters'
    }
    else {
      NextToken = 'yes'
    }
    ssmCounter++
    cb(null, { NextToken, Parameters })
  })
  discovery((err, services) => {
    t.notOk(err, 'no error passed to callback')
    t.equals(services.tables.cats, 'tableofcats', 'cat table value set up in correct place of service map')
    t.equals(services.events.walkthedog, 'timetowalkthedog', 'dogwalking event value set up in correct place of service map')
    t.equals(services.tables.ofcontents, 'chapters', 'ofcontents table value set up in correct place of service map')
    t.equals(services.queues.breadline, 'favouritebakery', 'breadline queue value set up in correct place of service map')
    awsMock.restore()
  })
})

test('Teardown', t => {
  t.plan(1)
  delete process.env.ARC_APP_NAME
  delete process.env.ARC_SANDBOX
  t.pass('Done!')
})
