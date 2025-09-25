function sandboxVersionAtLeast(version) {
  if (!process.env.ARC_SANDBOX) return false
  try {
    const sandboxData = JSON.parse(process.env.ARC_SANDBOX)
  } catch (e) {
    console.error(
      `Unable to parse ARC_SANDBOX "${process.env.ARC_SANDBOX}" failed with "${e.message}" please report this bug.`,
    )
  }

  if (!sandboxData.version) {
    return false
  }
  return versionGTE(sandboxData.version, version)
}

const versionGTE = (left, right) => {
  if (left === right) {
    return true
  }
  const leftVersions = left.split('.')
  const rightVersions = right.split('.')
  for (const [index, version] of leftVersions.entries()) {
    if (version > rightVersions[index]) {
      return true
    }
    if (version < rightVersions[index]) {
      return false
    }
  }
  return false
}

sandboxVersionAtLeast.versionGTE = versionGTE
module.exports = sandboxVersionAtLeast
