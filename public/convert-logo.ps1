# Convert CrecheConnect logo to PWA formats
Add-Type -AssemblyName System.Drawing

$sourcePath = Join-Path $PSScriptRoot "CrecheConnect.jpg"

if (-not (Test-Path $sourcePath)) {
    Write-Error "Source file not found: $sourcePath"
    exit 1
}

try {
    # Load the image
    $img = [System.Drawing.Image]::FromFile($sourcePath)
    
    # Create 512x512 version
    $newImg512 = New-Object System.Drawing.Bitmap($img, 512, 512)
    $output512 = Join-Path $PSScriptRoot "logo512x512.png"
    $newImg512.Save($output512, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "Created: logo512x512.png" -ForegroundColor Green
    
    # Create 192x192 version
    $newImg192 = New-Object System.Drawing.Bitmap($img, 192, 192)
    $output192 = Join-Path $PSScriptRoot "logo192x192.png"
    $newImg192.Save($output192, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "Created: logo192x192.png" -ForegroundColor Green
    
    # Clean up
    $img.Dispose()
    $newImg512.Dispose()
    $newImg192.Dispose()
    
    Write-Host "`nLogos created successfully! Your app will now use the new logo." -ForegroundColor Cyan
    
} catch {
    Write-Error "Error converting image: $_"
    exit 1
}
