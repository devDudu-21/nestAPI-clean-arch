import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  testRegex: '.*\\.(spec|int-spec|e2e-spec)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  coverageDirectory: '../coverage',
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.d.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
};
