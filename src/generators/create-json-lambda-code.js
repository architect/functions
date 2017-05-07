var assert = require('@smallwins/validate/assert')
var path = require('path')
var mkdir = require('mkdirp').sync
var exec = require('child_process').exec
var fs = require('fs')
var cp = require('cp').sync
var print = require('./_print')

module.exports = function _createLambdaCode(params, callback) {

  assert(params, {
    route: Array,
    app: String,
  })

  var mthd = params.route[0].toLowerCase()
  var pth = params.route[1] === '/'? '-index' : params.route[1].replace(/\//g, '-').replace(':', '000')
  var name = `${mthd}${pth}`

  // non destructive setup dir
  mkdir('src')
  mkdir('src/json')

  var p = path.join(process.cwd(), 'src', 'json', name)
  if (fs.existsSync(p)) {
    // skip if that dir exists
    print.skip('@json', `src/json/${name}`)
    callback()
  }
  else {
    console.log(`create: ${p}`)
    mkdir(`src/json/${name}`)

    // write package.json
    var pathToPkg = path.join('src', 'json', name, 'package.json')
    var pkg = {
      name: `${params.app}-${name}`
    }
    fs.writeFileSync(pathToPkg, JSON.stringify(pkg, null, 2))

    // copy in index.js
    var index = path.join(__dirname, 'templates', 'json-lambda', `${mthd}.js`)
    cp(index, path.join('src', 'json', name, 'index.js'))

    // npm i latest deps in the hello world template
    var pathToTmpl = path.join('src', 'json', name)

    exec(`
      cd ${pathToTmpl} && \
      npm rm @smallwins/arc-prototype --save && \
      npm i @smallwins/arc-prototype --save
    `,
    function _exec(err) {
      if (err) {
        console.log(err)
      }
      callback()
    })
  }
}
