module.exports = {
  deploy: {
    services: async () => {
      return {
        tables: {
          stuff: 'so-very-much-stuff',
        },
        'cloudwatch/metrics': {
          foo: 'bar',
          fiz: 'buz',
        },
      }
    },
  },
}
