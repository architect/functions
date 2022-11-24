let isNode18 = require('../../../../src/_node-version')
let test = require('tape')
let proxyquire = require('proxyquire')

let err, page1, page2, ssmCounter = 0
let ssm = class {
  constructor () {
    this.getParametersByPath = (params, callback) => {
      let result = ssmCounter === 0 ? page1 : page2
      ssmCounter++
      callback(err, result)
    }
  }
}
let discovery = proxyquire('../../../../src/discovery', {
  'aws-sdk/clients/ssm': ssm
})
let reset = () => {
  err = page1 = page2 = undefined
  ssmCounter = 0
}

if (!isNode18) {
  test('Set up env', t => {
    t.plan(1)
    process.env.ARC_APP_NAME = 'test'
    t.pass('Set up ARC_APP_NAME env var')
  })

  test('discovery should callback with error if SSM errors', t => {
    t.plan(1)
    err = true
    discovery(err => {
      t.ok(err, 'error passed into discovery callback')
      reset()
    })
  })

  test('discovery should parse hierarchical SSM parameters into a service map object', t => {
    t.plan(3)
    page1 = {
      Parameters: [
        { Name: '/app/tables/cats', Value: 'tableofcats' },
        { Name: '/app/events/walkthedog', Value: 'timetowalkthedog' }
      ]
    }
    discovery((err, services) => {
      t.notOk(err, 'no error passed to callback')
      t.equals(services.tables.cats, 'tableofcats', 'cat table value set up in correct place of service map')
      t.equals(services.events.walkthedog, 'timetowalkthedog', 'dogwalking event value set up in correct place of service map')
      reset()
    })
  })

  test('discovery should parse hierarchical SSM parameters, even ones of different depths, into a service map object', t => {
    t.plan(6)
    page1 = {
      Parameters: [
        { Name: '/app/tables/cats', Value: 'tableofcats' },
        { Name: '/app/cloudwatch/metrics/catbarf', Value: 'somuchbarf' },
        { Name: '/app/cloudwatch/metrics/chill', Value: 'quite' }
      ]
    }
    discovery((err, services) => {
      t.notOk(err, 'no error passed to callback')
      t.equals(services.tables.cats, 'tableofcats', 'cat table value set up in correct place of service map')
      t.ok(services.cloudwatch, 'cloudwatch object exists')
      t.ok(services.cloudwatch.metrics, 'cloudwatch.metrics object exists')
      t.equals(services.cloudwatch.metrics.catbarf, 'somuchbarf', 'cloudwatch.metrics.catbarf variable has correct value')
      t.ok(services.cloudwatch.metrics.chill, 'quite', 'cloudwatch.metrics.child variable has correct value')
      reset()
    })
  })

  test('discovery should parse several pages of hierarchical SSM parameters into a service map object', t => {
    t.plan(5)
    page1 = { NextToken: 'yes', Parameters: [
      { Name: '/app/tables/cats', Value: 'tableofcats' },
      { Name: '/app/events/walkthedog', Value: 'timetowalkthedog' }
    ] }
    page2 = { NextToken: null, Parameters: [
      { Name: '/app/queues/breadline', Value: 'favouritebakery' },
      { Name: '/app/tables/ofcontents', Value: 'chapters' }
    ] }
    discovery((err, services) => {
      t.notOk(err, 'no error passed to callback')
      t.equals(services.tables.cats, 'tableofcats', 'cat table value set up in correct place of service map')
      t.equals(services.events.walkthedog, 'timetowalkthedog', 'dogwalking event value set up in correct place of service map')
      t.equals(services.tables.ofcontents, 'chapters', 'ofcontents table value set up in correct place of service map')
      t.equals(services.queues.breadline, 'favouritebakery', 'breadline queue value set up in correct place of service map')
      reset()
    })
  })

  test('Teardown', t => {
    t.plan(1)
    delete process.env.ARC_APP_NAME
    t.pass('Done!')
  })
}
