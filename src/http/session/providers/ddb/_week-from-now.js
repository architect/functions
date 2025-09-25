// epoch + one week IN SECONDS
// - Date.now() returns ms
// - DynamoDB TTL is an integer in seconds
module.exports = function _weekFromNow() {
  return Math.floor(Date.now() / 1000) + 604800
}
