/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const blacklist = require('metro-config/src/defaults/blacklist');

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },

  resolver: {
    platforms: ['android', 'ios', 'web'],
    blacklistRE: blacklist([
      /\/android\/.*/,
      /\/desktop\/.*/,
      /\/benchmark\/.*/,
      /\/e2e\/.*/,
      /\/ios\/.*/,
      /\/nodejs-assets\/.*/,
      /\/patches\/.*/,
      /\/tools\/.*/,
      // Not used in runtime (is either dev dependency or surely not used)
      /\/node_modules\/appium\/.*/,
      // Used only by Electron for desktop
      /\/node_modules\/@cycle\/react-dom\/.*/,
      /\/node_modules\/electron\/.*/,
      /\/node_modules\/electron\.*\/.*/,
      /\/node_modules\/react-dom\/.*/,
      /\/node_modules\/webpack\/.*/,
      /\/node_modules\/webpack-cli\/.*/,
    ]),
  },
};
