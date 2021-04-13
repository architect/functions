let test = require('tape')
let aws = require('aws-sdk-mock')
let discovery = require('../../../../src/discovery')

test('discovery should callback with error if SSM errors', t => {
  t.plan(1)
  aws.mock('SSM', 'getParametersByPath', (params, cb) => cb(true))
  discovery(err => {
    t.ok(err, 'error passed into discovery callback')
    aws.restore()
  })
})

test('discovery should parse hierarchical SSM parameters into a service map object', t => {
  t.plan(3)
  aws.mock('SSM', 'getParametersByPath', (params, cb) => cb(null, {
    Parameters: [
      { Name: '/app/tables/cats', Value: 'tableofcats' },
      { Name: '/app/events/walkthedog', Value: 'timetowalkthedog' }
    ]
  }))
  discovery((err, services) => {
    t.notOk(err, 'no error passed to callback')
    t.equals(services.tables.cats, 'tableofcats', 'cat table value set up in correct place of service map')
    t.equals(services.events.walkthedog, 'timetowalkthedog', 'dogwalking event value set up in correct place of service map')
    aws.restore()
  })
})

test('discovery should parse several pages of hierarchical SSM parameters into a service map object', t => {
  t.plan(5)
  let ssmCounter = 0
  aws.mock('SSM', 'getParametersByPath', (params, cb) => {
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
    aws.restore()
  })
})
