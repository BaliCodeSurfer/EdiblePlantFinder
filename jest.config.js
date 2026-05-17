module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|react-native-reanimated|@react-native|expo|expo-modules-core|@expo|jest-expo)/)',
  ],
};