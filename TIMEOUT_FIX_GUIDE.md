
# Metro Bundler Timeout Fix Guide

## Problem
The app was experiencing a "6000ms timeout exceeded" error during font loading, preventing the app from starting properly.

## Solutions Implemented

### 1. **Improved Font Loading in `app/_layout.tsx`**
- Added robust error handling for font loading
- Implemented fallback mechanism if fonts fail to load
- Added proper async preparation flow
- Fonts now load with graceful degradation to system fonts if needed

### 2. **Optimized Metro Configuration (`metro.config.js`)**
- Increased server timeout from default to 10 minutes (600000ms)
- Added request and response timeout handling
- Optimized cache configuration
- Added blocklist to prevent duplicate React Native resolution
- Enabled inline requires for better performance
- Configured terser minifier with optimized settings

### 3. **Simplified Babel Configuration (`babel.config.js`)**
- Reordered plugins to prevent conflicts
- Moved worklets plugin to the end (required position)
- Maintained all necessary transformations

### 4. **Added Watchman Configuration (`.watchmanconfig`)**
- Created empty watchman config for better file watching
- Helps prevent file system watching issues

### 5. **Updated Package Scripts**
- Added `start` script with `--clear` flag for cache clearing
- Added `reset` script to clear all caches manually
- Added `clear` script as shorthand

## How to Use

### If You Experience Timeout Issues:

1. **Clear Metro Cache:**
   ```bash
   npm run clear
   ```
   or
   ```bash
   npm run start
   ```

2. **Full Reset (if cache clear doesn't work):**
   ```bash
   npm run reset
   ```

3. **Restart Development Server:**
   ```bash
   npm run dev
   ```

### Prevention Tips:

- **Regular Cache Clearing:** Clear cache weekly or after major dependency updates
- **Monitor Bundle Size:** Keep an eye on bundle size and split large files
- **Update Dependencies:** Keep Expo and React Native dependencies up to date
- **Check Network:** Ensure stable internet connection for tunnel mode

## Technical Details

### Font Loading Strategy
The app now uses a three-stage font loading approach:

1. **Attempt to load fonts** using `useFonts` hook
2. **Handle errors gracefully** - if fonts fail, continue with system fonts
3. **Set app ready state** only after fonts are loaded or error is handled

### Metro Timeout Configuration
```javascript
config.server = {
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      req.setTimeout(600000);  // 10 minutes
      res.setTimeout(600000);
      return middleware(req, res, next);
    };
  },
};
```

### Cache Management
Metro cache is stored in `node_modules/.cache/metro` and can be safely deleted.

## Troubleshooting

### If the app still won't start:

1. **Check Console Logs:**
   Look for specific error messages in the terminal

2. **Verify Dependencies:**
   ```bash
   npm install
   ```

3. **Check Expo Version:**
   Ensure you're using Expo SDK 54

4. **Try Different Start Mode:**
   ```bash
   npm run web    # Try web first
   npm run ios    # Or iOS
   npm run android # Or Android
   ```

5. **Check File Permissions:**
   Ensure all files are readable and writable

6. **Restart Computer:**
   Sometimes a full system restart helps clear locked files

## What Changed

### Files Modified:
- ✅ `app/_layout.tsx` - Improved font loading with error handling
- ✅ `metro.config.js` - Optimized bundler configuration
- ✅ `babel.config.js` - Reordered plugins
- ✅ `package.json` - Added cache clearing scripts
- ✅ `.watchmanconfig` - Added watchman configuration

### Dependencies Added:
- ✅ `metro-minify-terser` - For optimized minification

## Expected Behavior

After these fixes:
- ✅ App should start within 30 seconds
- ✅ Font loading errors are handled gracefully
- ✅ Metro bundler doesn't timeout
- ✅ Cache is properly managed
- ✅ Development experience is smooth

## Additional Notes

- The app will work even if custom fonts fail to load (falls back to system fonts)
- Console logs have been added for better debugging
- All timeouts are now significantly increased
- Cache clearing is now easier with npm scripts

## Support

If you continue to experience issues:
1. Check the console logs for specific errors
2. Try the full reset procedure
3. Ensure your development environment meets Expo requirements
4. Check that no other processes are using port 8081
