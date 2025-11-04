# Generate favicon.ico from CrecheConnect logo
Add-Type -AssemblyName System.Drawing

$sourcePath = Join-Path $PSScriptRoot "logo512x512.png"
$outputPath = Join-Path $PSScriptRoot "favicon.ico"

if (-not (Test-Path $sourcePath)) {
    Write-Error "Source file not found: $sourcePath"
    exit 1
}

try {
    # Load the image
    $img = [System.Drawing.Image]::FromFile($sourcePath)
    
    # Create 16x16, 32x32, and 48x48 versions (standard favicon sizes)
    $icon16 = New-Object System.Drawing.Bitmap($img, 16, 16)
    $icon32 = New-Object System.Drawing.Bitmap($img, 32, 32)
    $icon48 = New-Object System.Drawing.Bitmap($img, 48, 48)
    
    # Save as ICO (Note: PowerShell's System.Drawing doesn't have great .ico support)
    # We'll save the 32x32 version as a simple favicon
    $icon32.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Icon)
    
    Write-Host "✓ Created: favicon.ico" -ForegroundColor Green
    Write-Host "`nNote: For better multi-resolution favicon.ico, use:" -ForegroundColor Yellow
    Write-Host "https://favicon.io/ or https://www.favicon-generator.org/" -ForegroundColor Gray
    Write-Host "Upload: logo512x512.png" -ForegroundColor Gray
    
    # Cleanup
    $img.Dispose()
    $icon16.Dispose()
    $icon32.Dispose()
    $icon48.Dispose()
    
} catch {
    Write-Error "Error generating favicon: $_"
    Write-Host "`nPlease use an online tool:" -ForegroundColor Yellow
    Write-Host "1. Go to https://favicon.io/" -ForegroundColor White
    Write-Host "2. Upload logo512x512.png" -ForegroundColor White
    Write-Host "3. Download and replace favicon.ico" -ForegroundColor White
    exit 1
}
