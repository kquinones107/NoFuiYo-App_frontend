// Adopts the UIScene life cycle on iOS, which the iOS 27 SDK requires (apps without it crash at launch).
// Expo SDK 57 ships `ExpoAppSceneDelegate` but its prebuild template doesn't use it yet (SDK 58 does).
// Remove this plugin after upgrading to SDK 58+.
const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

const SCENE_DELEGATE_CLASS = 'EXExpoAppSceneDelegate';

const START_REACT_NATIVE_BLOCK =
  /#if os\(iOS\) \|\| os\(tvOS\)\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\s*factory\.startReactNative\([\s\S]*?\)\s*#endif\s*/;

function withSceneManifest(config) {
  return withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: SCENE_DELEGATE_CLASS,
          },
        ],
      },
    };
    return config;
  });
}

function withSceneAppDelegate(config) {
  return withAppDelegate(config, (config) => {
    if (config.modResults.language !== 'swift') {
      throw new Error('withIOSSceneLifecycle only supports a Swift AppDelegate');
    }
    let contents = config.modResults.contents;

    if (!contents.includes('ExpoReactNativeFactoryProvider')) {
      contents = contents.replace(
        'class AppDelegate: ExpoAppDelegate {',
        'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {'
      );
    }
    // The scene delegate creates the window and starts React Native.
    contents = contents.replace(START_REACT_NATIVE_BLOCK, '');

    if (!contents.includes('ExpoReactNativeFactoryProvider') || START_REACT_NATIVE_BLOCK.test(contents)) {
      throw new Error('withIOSSceneLifecycle could not patch AppDelegate.swift; the template may have changed');
    }
    config.modResults.contents = contents;
    return config;
  });
}

module.exports = function withIOSSceneLifecycle(config) {
  return withSceneAppDelegate(withSceneManifest(config));
};
