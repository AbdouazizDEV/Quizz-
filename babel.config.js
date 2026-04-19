module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          /** Transforme `import.meta` pour le bundle web (Metro) — expo/expo#36384 */
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      /** Doit rester en dernier */
      'react-native-reanimated/plugin',
    ],
  };
};
