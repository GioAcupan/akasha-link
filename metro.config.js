const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// AWS SDK v3 package.json only provides browser/react-native path replacements 
// for its ES modules ("dist-es"). We MUST tell Metro to use the "module" 
// field as an entry point instead of the "main" (CommonJS) field.
config.resolver.resolverMainFields = ['react-native', 'browser', 'module', 'main'];

module.exports = config;
