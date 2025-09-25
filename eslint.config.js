const arc = require('@architect/eslint-config')

module.exports = [
  ...arc,
  {
    ignores: ['.nyc_output/', 'arc-proxy-*', 'coverage/', 'dist.js', 'scratch/', 'src/http/get-index', 'types/'],
  },
]
