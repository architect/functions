var waterfall = require('run-waterfall')
var aws = require('aws-sdk')
var lambda = new aws.Lambda
var getIAM = require('../../_get-iam-role')

module.exports = function _createDeployment(params, callback) {
  waterfall([
    function _getRole(callback) {
      getIAM(callback)    
    },
    function _createLambda(role, callback) {
      lambda.createFunction({
        Code: {}, 
        Description: "", 
        FunctionName: params.name, 
        Handler: "index.handler", // is of tile and then name of your function handler
        MemorySize: 1152, 
        Publish: true, 
        Role: role.Arn, 
        Runtime: "nodejs6.1", 
        Timeout: 5, 
      }, callback)
    },
    function _addPermission(fn, callback) {
      lambda.addPermission({
        Action: "lambda:InvokeFunction", 
        FunctionName: "MyFunction", 
        Principal: "s3.amazonaws.com", 
        SourceAccount: "123456789012", 
        SourceArn: "arn:aws:s3:::examplebucket/*", 
        StatementId: "ID-1"
      }, callback) 
    }
  ], callback)
}
