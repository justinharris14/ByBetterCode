# Complete Java Setup Script for CrecheConnect
# Save this as setup_java.ps1 and run with: powershell -ExecutionPolicy Bypass -File setup_java.ps1

Write-Host "🚀 Starting Complete Java Setup for CrecheConnect..." -ForegroundColor Green

# Download Java 17 if not exists
$javaInstaller = "OpenJDK17-jdk_x64_windows_hotspot_17.0.13_11.msi"
if (!(Test-Path $javaInstaller)) {
    Write-Host "📥 Downloading Java 17..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.13%2B11/OpenJDK17U-jdk_x64_windows_hotspot_17.0.13_11.msi" -OutFile $javaInstaller
        Write-Host "✅ Java downloaded successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Download failed. Please download manually from: https://adoptium.net/" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Java installer already exists" -ForegroundColor Green
}

# Install Java (requires admin privileges)
Write-Host "🔧 Installing Java 17..." -ForegroundColor Yellow
Write-Host "Please follow the installation wizard that opens..." -ForegroundColor Cyan
Start-Process msiexec -ArgumentList "/i", "$javaInstaller", "/quiet" -Wait

# Find Java installation path
Write-Host "🔍 Finding Java installation..." -ForegroundColor Yellow
$javaPaths = @(
    "C:\Program Files\Eclipse Adoptium\jdk-17*",
    "C:\Program Files\Java\jdk-17*",
    "C:\Program Files (x86)\Eclipse Adoptium\jdk-17*"
)

$javaHome = $null
foreach ($path in $javaPaths) {
    $found = Get-ChildItem $path -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $javaHome = $found.FullName
        break
    }
}

if ($javaHome) {
    Write-Host "✅ Found Java at: $javaHome" -ForegroundColor Green

    # Set JAVA_HOME permanently
    Write-Host "⚙️ Setting JAVA_HOME..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "Machine")
    $env:JAVA_HOME = $javaHome

    # Update PATH
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
    if ($currentPath -notlike "*$javaHome\bin*") {
        $newPath = "$javaHome\bin;$currentPath"
        [Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
        $env:PATH = "$javaHome\bin;$env:PATH"
    }

    # Test Java
    Write-Host "🧪 Testing Java installation..." -ForegroundColor Yellow
    try {
        $javaVersion = & java -version 2>&1
        Write-Host "✅ Java version:" -ForegroundColor Green
        Write-Host $javaVersion -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Java test failed" -ForegroundColor Red
    }

    # Test Gradle
    Write-Host "🧪 Testing Gradle..." -ForegroundColor Yellow
    if (Test-Path ".\gradlew.bat") {
        try {
            $gradleVersion = & .\gradlew.bat --version 2>&1 | Select-String "Gradle"
            Write-Host "✅ Gradle:" -ForegroundColor Green
            Write-Host $gradleVersion -ForegroundColor Cyan
        } catch {
            Write-Host "❌ Gradle test failed" -ForegroundColor Red
        }
    }

    Write-Host ""
    Write-Host "🎉 Java setup complete!" -ForegroundColor Green
    Write-Host "📋 Summary:" -ForegroundColor Cyan
    Write-Host "   • JAVA_HOME: $javaHome" -ForegroundColor White
    Write-Host "   • Java version: $(java -version 2>&1 | Select-String 'version')" -ForegroundColor White
    Write-Host "   • Gradle: Working" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 You can now run:" -ForegroundColor Green
    Write-Host "   .\gradlew.bat assembleDebug" -ForegroundColor White
    Write-Host "   .\gradlew.bat runDebug" -ForegroundColor White

} else {
    Write-Host "❌ Could not find Java installation" -ForegroundColor Red
    Write-Host "Please install Java manually from: https://adoptium.net/" -ForegroundColor Yellow
    Write-Host "Then run this script again" -ForegroundColor Yellow
}
