let sandboxData = null

if (process.env.ARC_SANDBOX) {
  try {
    sandboxData = JSON.parse(process.env.ARC_SANDBOX)
  }
  catch (e) {
    console.error(`Unable to parse ARC_SANDBOX "${process.env.ARC_SANDBOX}" failed with "${e.message}" please report this bug.`)
  }
}

let versionGTE = (left, right) => {
  if (left === right) {
    return true
  }
  let leftVersions = left.split('.')
  let rightVersions = right.split('.')
  for (let [ index, version ] of leftVersions.entries()) {
    if (version > rightVersions[index]) {
      return true
    }
    else if (version < rightVersions[index]) {
      return false
    }
  }
  return false
}

let sandboxVersionAtLeast = (version) => {
  if (!(sandboxData && sandboxData.version)) {
    return false
  }

  return versionGTE(sandboxData.version, version)
}

module.exports = {
  sandboxData,
  sandboxVersionAtLeast,
  versionGTE,
}
