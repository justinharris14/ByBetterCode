# Creche Connect Logo Replacement - Instructions

## Overview
All Natively-branded images and references have been updated to Creche Connect branding.

## What Was Changed

### 1. Code Updates (Completed ✅)
- **app/setup.tsx**: Updated email redirect URL from `natively.dev` to `crecheconnect.app`
- **app/forgot-password.tsx**: Updated password reset redirect URL
- **app.json**: Changed favicon reference to `creche-connect-favicon.png`
- **MIGRATION_FROM_DEMO.md**: Updated documentation with new URLs

### 2. Image Files to Replace

#### Files That Need New Logos:
- `assets/images/icon.png` - App icon (1024x1024) ❌ Natively logo
- `assets/images/adaptive-icon.png` - Android adaptive icon (1024x1024) ❌ Natively logo
- `assets/images/splash.png` - Splash screen (2048x2048) ❌ Natively logo
- `assets/images/creche-connect-favicon.png` - Web favicon (240x240) **NEW FILE NEEDED**
- `public/logo192x192.png` - PWA icon (192x192) ❌ Template logo
- `public/logo512x512.png` - PWA icon (512x512) ❌ Template logo
- `public/favicon.ico` - Browser favicon ❌ Needs update

#### Files to Delete:
- `assets/images/natively-dark.png` - Natively branding
- `assets/images/final_quest_240x240.png` - Template image
- `assets/images/final_quest_240x240__.png` - Template image

## How to Generate and Replace Logos

### Step 1: Generate Logo Images
1. Open `generate-creche-logo.html` in your web browser
2. The logos will be automatically generated with a child-friendly design:
   - 🏠 House/creche building icon with warm colors
   - ❤️ Heart symbol representing care and love
   - Colorful and professional appearance
3. Download each logo variant by clicking the download buttons:
   - icon.png (1024x1024)
   - adaptive-icon.png (1024x1024)
   - splash.png (2048x2048)
   - favicon.png (240x240)
   - logo192x192.png (192x192)
   - logo512x512.png (512x512)

### Step 2: Run the Replacement Script
```powershell
.\replace-logos.ps1
```

This script will:
- Back up all existing logo files to `backup-old-logos/`
- Copy your downloaded logos to the correct locations
- Delete old Natively-branded files
- Provide next steps for completion

**OR** manually copy files to these locations:
- `icon.png` → `assets/images/icon.png`
- `adaptive-icon.png` → `assets/images/adaptive-icon.png`
- `splash.png` → `assets/images/splash.png`
- `favicon.png` → `assets/images/creche-connect-favicon.png`
- `logo192x192.png` → `public/logo192x192.png`
- `logo512x512.png` → `public/logo512x512.png`

### Step 3: Generate favicon.ico
1. Go to https://www.favicon-generator.org/ or https://favicon.io/
2. Upload your `favicon.png` (240x240)
3. Download the generated `favicon.ico`
4. Replace `public/favicon.ico` with the new file

### Step 4: Android Splash Screen Icons (Optional)
The Android splash screen logos need to be generated in multiple densities:
- `android/app/src/main/res/drawable-mdpi/splashscreen_logo.png` (48x48)
- `android/app/src/main/res/drawable-hdpi/splashscreen_logo.png` (72x72)
- `android/app/src/main/res/drawable-xhdpi/splashscreen_logo.png` (96x96)
- `android/app/src/main/res/drawable-xxhdpi/splashscreen_logo.png` (144x144)
- `android/app/src/main/res/drawable-xxxhdpi/splashscreen_logo.png` (192x192)

**Tools to generate these:**
- https://appicon.co/
- https://makeappicon.com/
- https://apetools.webprofusion.com/app/#/tools/imagegorilla

Upload your `icon.png` and download the Android assets package.

### Step 5: Test Your Changes
1. Clear the app cache: `npm run start -- --clear`
2. Rebuild the app to see new logos
3. Check that all logos appear correctly:
   - App icon on home screen
   - Splash screen on app launch
   - Favicon in browser tab (web version)
   - PWA icons when installed

## Logo Design Details

The new Creche Connect logo features:
- **House/Building**: Represents a creche/childcare facility
- **Warm Colors**: Pink, orange, and teal - friendly and welcoming
- **Heart Symbol**: Represents care, love, and nurturing
- **Professional Yet Playful**: Appeals to both parents and represents childcare

## Files Created
- `generate-creche-logo.html` - Interactive logo generator
- `replace-logos.ps1` - Automated replacement script
- `LOGO-REPLACEMENT-INSTRUCTIONS.md` - This file

## Need Help?

If you encounter any issues:
1. Check that all file paths are correct
2. Ensure downloaded files have the exact names specified
3. Clear your app cache and rebuild
4. Verify image dimensions match requirements

## Backup Location
All original files are backed up to: `backup-old-logos/`

You can restore them if needed by copying files back to their original locations.
