module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|react-native-config|@react-native|react-redux|@reduxjs/toolkit|immer|@react-navigation|victory-native|@supabase|date-fns|react-native-vector-icons)/)',
  ],
  moduleNameMapper: {
    '@react-native-community/datetimepicker': '<rootDir>/__mocks__/empty.js',
  },
};
