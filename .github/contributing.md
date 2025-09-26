# Contributing

## First: go read the [Architect Code of Conduct](/.github/code_of_conduct.md)

### Agreement to the Architect Code of Conduct
By participating in and contributing to the Architect community — including, but not limited to its open source projects, any related online venues such as GitHub, Slack, and in-person events, etc. — you agree to the [Architect Code of Conduct](/.github/code_of_conduct.md).

Lack of familiarity with this Code of Conduct is not an excuse for not adhering to it.

## Development Setup

### Prerequisites
- Node.js 20+ (required for native test runner)
- npm

### Testing

This project uses Node.js native test runner for all testing. The test suite is organized into unit and integration tests.

**Running Tests:**
```bash
# Run the full test suite (includes linting, tests, and type checking)
npm test

# Run tests without linting
npm run test:nolint

# Run specific test types
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only  
npm run test:types       # TypeScript type tests

# Generate coverage reports
npm run coverage         # Unit test coverage with lcov output
npm run coverage:text    # Text-only coverage report
npm run coverage:all     # Coverage for all tests
```

**Test Structure:**
- `test/unit/` - Unit tests for individual modules
- `test/integration/` - Integration tests that may require external services
- Tests use Node.js built-in `node:test` module and `node:assert` for assertions
- Coverage is generated using Node.js native coverage collection

**Writing Tests:**
When contributing new features or fixing bugs, please include appropriate tests:
- Unit tests for new functions or modules
- Integration tests for features that interact with external services
- Use Node.js native test patterns (see existing tests for examples)

**Test Migration:**
This project was recently migrated from Tape to Node.js native test runner. See `test/MIGRATION_GUIDE.md` for details about the migration utilities and patterns used.
