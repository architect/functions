// Takes a client cookie string and finds the last _idx key/value
module.exports = function getIdx(cookie = '') {
  const cookies = cookie
    .split(';')
    .map((c) => c.trim())
    .filter(Boolean)
  const session = cookies.reverse().find((c) => c.startsWith('_idx='))
  return session || ''
}
