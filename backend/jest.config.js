module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  roots: [
    '<rootDir>',
    '<rootDir>/../test',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@common/(.*)$': '<rootDir>/common/$1',
    '^@identity/(.*)$': '<rootDir>/identity/$1',
    '^@patient/(.*)$': '<rootDir>/patient/$1',
    '^@appointment/(.*)$': '<rootDir>/appointment/$1',
    '^@treatment/(.*)$': '<rootDir>/treatment/$1',
    '^@billing/(.*)$': '<rootDir>/billing/$1',
    '^@clinic/(.*)$': '<rootDir>/clinic/$1',
    '^@reporting/(.*)$': '<rootDir>/reporting/$1',
  },
};
