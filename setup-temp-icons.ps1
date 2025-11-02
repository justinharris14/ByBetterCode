# Quick script to create temporary icons so the app can run
# Replace these with custom icons later using generate-icon.html

Write-Host "Creating temporary app icons..." -ForegroundColor Cyan

Copy-Item "assets\images\natively-dark.png" "assets\images\icon.png" -Force
Write-Host "✓ Created icon.png" -ForegroundColor Green

Copy-Item "assets\images\natively-dark.png" "assets\images\splash.png" -Force
Write-Host "✓ Created splash.png" -ForegroundColor Green

Copy-Item "assets\images\natively-dark.png" "assets\images\adaptive-icon.png" -Force
Write-Host "✓ Created adaptive-icon.png" -ForegroundColor Green

Write-Host "`nTemporary icons created! Your app can now run." -ForegroundColor Green
Write-Host "To create branded icons, open 'generate-icon.html' in your browser." -ForegroundColor Yellow
