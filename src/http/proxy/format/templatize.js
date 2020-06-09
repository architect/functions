module.exports = function templatizeResponse (params) {
  let { isBinary, assets, response, isLocal=false } = params

  // Bail early
  if (isBinary) {
    return response
  }
  else {
    // Find: ${STATIC('path/filename.ext')}
    //   or: ${arc.static('path/filename.ext')}
    let staticRegex = /\${(STATIC|arc\.static)\(.*\)}/g
    // Maybe stringify jic previous steps passed a buffer; perhaps we can remove this step if/when proxy plugins is retired
    let body = response.body instanceof Buffer ? Buffer.from(response.body).toString() : response.body
    response.body = body.replace(staticRegex, function fingerprint(match) {
      let start = match.startsWith(`\${STATIC(`) ? 10 : 14
      let Key = match.slice(start, match.length-3)
      if (assets && assets[Key] && !isLocal) {
        Key = assets[Key]
      }
      return Key
    })
    response.body = Buffer.from(response.body) // Re-enbufferize
    return response
  }
}
