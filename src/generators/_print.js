var chalk = require('chalk')

function skip(section, resource) {
  var skip = chalk.dim('skip')
  var sect = chalk.dim(section)
  var item = chalk.magenta(resource)
  var exis = chalk.dim('exists')
  console.log(`${skip} ${sect} ${item} ${exis}`)
}

function create(section, resource) {
  var skip = chalk.green('create')
  var sect = chalk.grey(section)
  var item = chalk.magenta(resource)
  console.log(`${skip} ${sect} ${item}`)
}

module.exports = {
  skip,
  create
}
