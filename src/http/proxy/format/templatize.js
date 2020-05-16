module.exports = function templatizeResponse ({isBinary, assets, response, isSandbox=false}) {
  // Bail early
  if (isBinary || !assets) {
    return response
  }
  else {
    // Find: ${STATIC('path/filename.ext')}
    //   or: ${arc.static('path/filename.ext')}
    let static = /\${(STATIC|arc\.static)\(.*\)}/g
    // Maybe stringify jic previous steps passed a buffer; perhaps we can remove this step if/when proxy plugins is retired
    let body = response.body instanceof Buffer ? Buffer.from(response.body).toString() : response.body
    response.body = body.replace(static, function fingerprint(match) {
      let start = match.startsWith(`\${STATIC(`) ? 10 : 14
      let Key = match.slice(start, match.length-3)
      if (assets[Key] && !isSandbox)
        Key = assets[Key]
      return Key
    })
    response.body = Buffer.from(response.body) // Re-enbufferize
    return response
  }
}
