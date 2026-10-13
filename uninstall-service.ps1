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

Write-Host "Uninstalling service..."
cd $InstallPath
node uninstall.js

Write-Host "Removing files from $InstallPath..."
Remove-Item $InstallPath -Recurse -Force

Write-Host "✓ Service uninstalled and removed." -ForegroundColor Green
