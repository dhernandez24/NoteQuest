module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest-setup.js'],
  testMatch: ['**/__tests__/**/*.test.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|react-native|@react-navigation|@react-native-async-storage|zustand|expo|@expo|react-native-safe-area-context|@react-native-community|@unimodules)',
  ],
  moduleNameMapper: {
    '@react-native-async-storage/async-storage': '<rootDir>/node_modules/@react-native-async-storage/async-storage/jest/async-storage-mock.js',
    '^react-native-safe-area-context$': '<rootDir>/node_modules/react-native-safe-area-context/jest/mock.ts',
  },
};
