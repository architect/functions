let fs = require('fs')
let path = require('path')
let parse = require('@architect/parser')

function read(filepath, type) {
  let arc = fs.readFileSync(filepath).toString()
  try {
    if (type === 'arc')
      return parse(arc)
    if (type === 'json')
      return parse.json(arc)
    if (type === 'yaml')
      return parse.yaml(arc)
  }
  catch(err) {
    throw Error(err)
  }
}

/**
 * reads the .arc file
 */
module.exports = function readLocalArc() {
  // Arc <6 paths where we used to copy project manifest to shared
  let arcOldDefault   = path.join(process.cwd(), 'node_modules', '@architect', 'shared', '.arc')
  let arcInCurrentDir = path.join(process.cwd(), '.arc')
  let arcInSharedDir  = path.join(__dirname, '..', 'shared', '.arc')
  // Arc 6+ paths where project manifest needs to be read from root
  let arcInRoot       = path.join(process.cwd(), '..', '..', '..', '.arc')
  let appArcInRoot    = path.join(process.cwd(), '..', '..', '..', 'app.arc')
  let jsonInRoot      = path.join(process.cwd(), '..', '..', '..', 'arc.json')
  let yamlInRoot      = path.join(process.cwd(), '..', '..', '..', 'arc.yaml')

  if (fs.existsSync(arcOldDefault)) {
    // Arc default path (used in Arc 4 as well as ARC_LOCAL)
    return read(arcOldDefault, 'arc')
  }
  else if (fs.existsSync(arcInCurrentDir)) {
    // If .arc is in the cwd, use that (used in Arc 3)
    return read(arcInCurrentDir, 'arc')
  }
  else if (fs.existsSync(arcInSharedDir)) {
    // Otherwise we are: testing, staging, or in production and loading from within node_modules
    // Eg, ./node_modules/@architect/shared/.arc
    return read(arcInSharedDir, 'arc')
  }
  else if (fs.existsSync(arcInRoot)) {
    // arc is in the root of the project (Arc 6.x local)
    return read(arcInRoot, 'arc')
  }
  else if (fs.existsSync(appArcInRoot)) {
    // app.arc is in the root of the project (Arc 6.x local)
    return read(arcInRoot, 'arc')
  }
  else if (fs.existsSync(jsonInRoot)) {
    return read(jsonInRoot, 'json')
  }
  else if (fs.existsSync(yamlInRoot)) {
    return read(yamlInRoot, 'yaml')
  }
  else {
    throw ReferenceError('.arc file not found')
  }
}
