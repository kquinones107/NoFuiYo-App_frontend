const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Single copy of react-native-svg — nested copies (spin-the-wheel, wheel-of-fortune)
// each register RNSVGCircle etc. and crash with "Tried to register two views..."
const svgEntry = require.resolve('react-native-svg', { paths: [projectRoot] });
const defaultResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-svg') {
    return { filePath: svgEntry, type: 'sourceFile' };
  }
  if (typeof defaultResolve === 'function') {
    return defaultResolve(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
