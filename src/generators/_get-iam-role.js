var parallel = require('run-parallel')
var aws = require('aws-sdk')
var iam = new aws.IAM
var policy = require('./templates/default-iam-policy.json')
var RoleName = 'arc-role'

/**
 * Lambdas require permissions to access AWS infrastructure.
 * They get those permissions via an IAM Role. (Idenitty Access Management Role)
 *
 * This function returns `arc-role`: the default IAM Role for arc Lambdas.
 ,
  *
 */
module.exports = function _getRole(callback) {
  // first look for the role
  iam.listRoles({}, function _listRoles(err, results) {
    if (err) throw err
    var found = results.Roles.find(r=> r.RoleName === RoleName)
    if (found) {
      callback(null, found)
    }
    else {
      // if we didn't find it create it
      // and return that
      iam.createRole({
        AssumeRolePolicyDocument: JSON.stringify(policy), 
        Path: "/", 
        RoleName,
      }, 
      function _createRole(err, result) {
        if (err) throw err
        var policies = [
          'arn:aws:iam::aws:policy/AmazonS3FullAccess',
          'arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess',
          'arn:aws:iam::aws:policy/AmazonSNSFullAccess',
        ].map(PolicyArn=> {
          return function _attachPolicy(callback) {
            iam.attachRolePolicy({
              RoleName,
              PolicyArn,  
            }, callback)
          }
        })
        
        policies.push(function _putPolicy(callback) {
          iam.putRolePolicy({
            PolicyDocument: JSON.stringify({
              "Version": "2012-10-17",
              "Statement": [{
                "Effect": "Allow",
                "Action": [
                  "logs:CreateLogGroup",
                  "logs:CreateLogStream",
                  "logs:PutLogEvents",
                  "logs:DescribeLogStreams"
                ],
                "Resource": "arn:aws:logs:*:*:*"
              }]
            }, null, 2), 
            PolicyName: "ArcLambdaCloudwatchPolicy", 
            RoleName
         }, callback)
        })

        parallel(policies, function _done(err, results) {
          if (err) throw err
          setTimeout(function _fakeLatency() {
            console.log('getIAM', result.Role)
            callback(null, result.Role)
          }, 10000)
        })
      })
    }
  })
}
