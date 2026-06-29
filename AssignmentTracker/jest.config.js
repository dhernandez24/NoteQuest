module.exports = {
  preset: 'react-native',

  setupFilesAfterEnv: ['./jest-setup.js'],

  testMatch: ['**/__tests__/**/*.test.tsx'],

  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo|@expo|@react-navigation|zustand|@react-native-async-storage|react-native-safe-area-context)',
  ],
};