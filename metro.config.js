const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

/**
 * Désactive la résolution `package.json#exports` (ESM avec `import.meta`).
 * Sinon Zustand / Supabase / autres peuvent casser le web — expo/expo#36384.
 * @see https://docs.expo.dev/versions/latest/config/metro/#packagejsonexports
 */
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
