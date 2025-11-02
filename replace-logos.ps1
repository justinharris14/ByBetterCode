# Creche Connect Logo Replacement Script
# This script helps you organize the new Creche Connect logos

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Creche Connect Logo Replacement" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Define paths
$assetsPath = ".\assets\images"
$publicPath = ".\public"
$androidResPath = ".\android\app\src\main\res"

Write-Host "Step 1: Open generate-creche-logo.html in your browser" -ForegroundColor Yellow
Write-Host "  - Download all 6 logo variants" -ForegroundColor Gray
Write-Host "  - Save them to your Downloads folder" -ForegroundColor Gray
Write-Host ""

$continue = Read-Host "Have you downloaded all the logos? (y/n)"
if ($continue -ne "y") {
    Write-Host "Please download the logos first, then run this script again." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Step 2: Enter the path to your Downloads folder" -ForegroundColor Yellow
$downloadsPath = Read-Host "Downloads folder path (e.g., C:\Users\YourName\Downloads)"

if (-not (Test-Path $downloadsPath)) {
    Write-Host "Downloads path not found!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Step 3: Backing up and replacing logo files..." -ForegroundColor Yellow

# Create backup directory
$backupPath = ".\backup-old-logos"
if (-not (Test-Path $backupPath)) {
    New-Item -ItemType Directory -Path $backupPath | Out-Null
}

# Backup old files
Write-Host "  Creating backups..." -ForegroundColor Gray
$filesToBackup = @(
    "$assetsPath\icon.png",
    "$assetsPath\adaptive-icon.png",
    "$assetsPath\splash.png",
    "$assetsPath\natively-dark.png",
    "$assetsPath\final_quest_240x240.png",
    "$assetsPath\final_quest_240x240__.png",
    "$publicPath\logo192x192.png",
    "$publicPath\logo512x512.png"
)

foreach ($file in $filesToBackup) {
    if (Test-Path $file) {
        $filename = Split-Path $file -Leaf
        Copy-Item $file "$backupPath\$filename" -Force
        Write-Host "    Backed up: $filename" -ForegroundColor Green
    }
}

# Copy new files
Write-Host ""
Write-Host "  Copying new logo files..." -ForegroundColor Gray

$fileMappings = @{
    "icon.png" = "$assetsPath\icon.png"
    "adaptive-icon.png" = "$assetsPath\adaptive-icon.png"
    "splash.png" = "$assetsPath\splash.png"
    "favicon.png" = "$assetsPath\creche-connect-favicon.png"
    "logo192x192.png" = "$publicPath\logo192x192.png"
    "logo512x512.png" = "$publicPath\logo512x512.png"
}

foreach ($downloadFile in $fileMappings.Keys) {
    $sourcePath = Join-Path $downloadsPath $downloadFile
    $destPath = $fileMappings[$downloadFile]
    
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $destPath -Force
        Write-Host "    Copied: $downloadFile -> $destPath" -ForegroundColor Green
    } else {
        Write-Host "    Warning: $downloadFile not found in Downloads" -ForegroundColor Yellow
    }
}

# Delete old Natively-branded files
Write-Host ""
Write-Host "Step 4: Removing old Natively-branded files..." -ForegroundColor Yellow
$filesToDelete = @(
    "$assetsPath\natively-dark.png",
    "$assetsPath\final_quest_240x240.png",
    "$assetsPath\final_quest_240x240__.png"
)

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "    Deleted: $(Split-Path $file -Leaf)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Logo Replacement Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Generate Android splash screen logos (see instructions below)" -ForegroundColor Gray
Write-Host "2. Update favicon.ico in public/ folder" -ForegroundColor Gray
Write-Host "3. Test your app to ensure all logos appear correctly" -ForegroundColor Gray
Write-Host ""
Write-Host "Android Splash Screens:" -ForegroundColor Yellow
Write-Host "  Use an online tool like 'appicon.co' or 'makeappicon.com'" -ForegroundColor Gray
Write-Host "  Upload your icon.png and download Android assets" -ForegroundColor Gray
Write-Host "  Replace files in: $androidResPath" -ForegroundColor Gray
Write-Host ""
Write-Host "Old files backed up to: $backupPath" -ForegroundColor Cyan
