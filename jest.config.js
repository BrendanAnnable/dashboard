module.exports = {
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/tests/**',
  ],
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.test.json',
    },
  },
  moduleDirectories: [
    'node_modules',
    '<rootDir>/src',
  ],
  moduleFileExtensions: [
    'js',
    'ts',
    'tsx',
  ],
  moduleNameMapper: {
    '\\.(css)$': 'identity-obj-proxy',
  },
  roots: [
    '<rootDir>/src',
  ],
  modulePaths: [
    '<rootDir>/src',
  ],
  testMatch: [
    '**/tests/**/*.tests.{ts,tsx}',
  ],
  preset: 'ts-jest',
}
