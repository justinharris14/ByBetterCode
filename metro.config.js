
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Optimize cache
config.cacheStores = [
  new FileStore({ 
    root: path.join(__dirname, 'node_modules', '.cache', 'metro') 
  }),
];

// Increase timeouts significantly
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Set longer timeout (20 minutes)
      req.setTimeout(1200000);
      res.setTimeout(1200000);
      return middleware(req, res, next);
    };
  },
};

// Optimize resolver
config.resolver = {
  ...config.resolver,
  sourceExts: [...(config.resolver.sourceExts || []), 'cjs'],
  // Blacklist/blocklist certain files to speed up resolution
  blockList: [
    /node_modules\/.*\/node_modules\/react-native\/.*/,
  ],
  // Disable symlinks to avoid circular dependencies
  unstable_enableSymlinks: false,
};

// Optimize transformer for faster builds
config.transformer = {
  ...config.transformer,
  // Reduce minification for faster dev builds
  minifierPath: require.resolve('metro-minify-terser'),
  minifierConfig: {
    ecma: 8,
    keep_classnames: true,
    keep_fnames: true,
    module: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
    compress: {
      drop_console: false,
      reduce_funcs: false,
    },
  },
  // Enable inline requires for better performance
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
  // Increase worker count for parallel processing
  maxWorkers: 4,
};

// Optimize watcher
config.watchFolders = [__dirname];

// Reset cache settings for worklets
config.resetCache = false;

module.exports = config;
