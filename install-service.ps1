param(
    [Parameter(Mandatory=$false)]
    [string]$InstallPath = "C:\nfc-service"
)

# Check admin
$IsAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $IsAdmin) {
    Write-Host "✗ Run as Administrator" -ForegroundColor Red
    exit 1
}

# Copy files
Write-Host "Copying files to $InstallPath..."
if (-not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath | Out-Null
}

Copy-Item "nfc-agent.js" "$InstallPath\" -Force
Copy-Item "config.json" "$InstallPath\" -Force
Copy-Item "package.json" "$InstallPath\" -Force
Copy-Item "install.js" "$InstallPath\" -Force
Copy-Item "uninstall.js" "$InstallPath\" -Force
Copy-Item "node_modules" "$InstallPath\" -Recurse -Force

# Install service
Write-Host "Installing service..."
cd $InstallPath
node install.js

Write-Host "Done. Service: NFC-Service" -ForegroundColor Green
Write-Host "Start: net start NFC-Service"
Write-Host "Stop: net stop NFC-Service"
