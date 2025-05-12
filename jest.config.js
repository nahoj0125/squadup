export default {
  // Set the test environment
  testEnvironment: 'node',

  // Shows detailed output
  verbose: true,

  // Files to collect coverage information from
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!**/node_modules/**'
  ],

  // Directory where Jest should output coverage files
  coverageDirectory: 'coverage',

  // Transform ES modules for Jest
  transform: {},

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js'
  ]
}
