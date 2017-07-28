module.exports = function validate(type, cmds) {
  var validators = {
    'text/html': html,
    'text/css': css,
    'text/javascript': js,
    'application/json': json,
  }
  validators[type](cmds)
}

function css() {
  throw Error('not impl')
}
function js() {
  throw Error('not impl')
}

function html(cmds) {
  var allowed = ['location', 'session', 'html', 'status']

  // ensure only valid command keys
  Object.keys(cmds).forEach(k=> {
    if (!allowed.includes(k)) {
      throw Error(`${k} unknown key. Only ${allowed.join(', ')} allowed`)
    }
  })

  // ensure not both location and html
  var hasLocationAndHtml = cmds.hasOwnProperty('location') && cmds.hasOwnProperty('html')
  if (hasLocationAndHtml) {
    throw Error('Found location and html keys; only one is allowed')
  }

  // ensure one of location or html
  var hasOneOfLocationOrHtml = cmds.hasOwnProperty('location') || cmds.hasOwnProperty('html')
  if (!hasOneOfLocationOrHtml) {
    throw Error('response must have location or html')
  }

  //TODO ensure location is a url
  //TODO ensure commands is a plain js object
  //TODO ensure session s a plain object
  //TODO ensure status is one of 403, 404, 500
}


function json(cmds) {
  // ensure only valid command keys
  var allowed = ['location', 'session', 'json', 'status']
  Object.keys(cmds).forEach(k=> {
    if (!allowed.includes(k)) {
      throw Error(k + ' unknown key. Only location, session and json allowed')
    }
  })

  // ensure not both location and json
  var hasLocationAndJson = cmds.hasOwnProperty('location') && cmds.hasOwnProperty('json')
  if (hasLocationAndJson) {
    throw Error('Found location and json keys; only one is allowed')
  }
  // ensure one of location or json
  var hasOneOfLocationOrJson = cmds.hasOwnProperty('location') || cmds.hasOwnProperty('json')
  if (!hasOneOfLocationOrJson) {
    throw Error('response must have location or json')
  }
  //TODO ensure location is a url
  //TODO ensure commands is a plain js object
  //TODO ensure session s a plain object
  //TODO ensure status is one of 403, 404, 500
}
