
# Quick Fix Reference Card

## 🚨 Common Issues & Solutions

### Issue: "6000ms timeout exceeded"
**Solution:**
```bash
npm run clear
npm run dev
```

### Issue: Metro bundler stuck
**Solution:**
```bash
npm run reset
npm install
npm run dev
```

### Issue: Fonts not loading
**Solution:**
The app now handles this automatically. Fonts will fall back to system fonts if they fail to load.

### Issue: Cache problems
**Solution:**
```bash
npm run clear
```

### Issue: Port 8081 already in use
**Solution:**
```bash
# Kill the process using port 8081
lsof -ti:8081 | xargs kill -9
npm run dev
```

### Issue: Watchman errors
**Solution:**
```bash
watchman watch-del-all
npm run dev
```

## 📋 Quick Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with tunnel |
| `npm run start` | Start with cache cleared |
| `npm run clear` | Clear Metro cache only |
| `npm run reset` | Full cache reset (nuclear option) |
| `npm run web` | Start web version |
| `npm run ios` | Start iOS simulator |
| `npm run android` | Start Android emulator |

## 🔍 Debugging Steps

1. **Check logs** - Look at terminal output
2. **Clear cache** - `npm run clear`
3. **Restart server** - Stop and run `npm run dev`
4. **Full reset** - `npm run reset` then `npm install`
5. **Check network** - Ensure stable internet for tunnel mode

## ✅ Health Check

Your app is healthy if:
- ✅ Starts within 30 seconds
- ✅ No timeout errors in console
- ✅ Fonts load or gracefully fall back
- ✅ Hot reload works properly

## 🛠️ Maintenance

**Weekly:**
- Clear cache: `npm run clear`

**After dependency updates:**
- Full reset: `npm run reset && npm install`

**Before important demos:**
- Test on clean cache: `npm run start`

## 📞 Emergency Procedure

If nothing works:
```bash
# 1. Stop all processes
killall node

# 2. Full cleanup
npm run reset
rm -rf node_modules
rm package-lock.json

# 3. Fresh install
npm install

# 4. Start fresh
npm run start
```
