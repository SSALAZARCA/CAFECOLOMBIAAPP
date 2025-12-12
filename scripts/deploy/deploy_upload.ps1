$ServerIP = "31.97.128.11"
$User = "root"
$RemotePath = "/var/www/cafecolombia"
$LocalZip = "deploy_package.zip"

Write-Host "☕ CAFE COLOMBIA - DEPLOYMENT PART 1: UPLOAD" -ForegroundColor Cyan
Write-Host "==========================================="

# 1. Build Verification
Write-Host "🔨 Building Application..." -ForegroundColor Yellow
$build = npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed. Aborting deployment."
    exit 1
}

# 2. Package Application
Write-Host "📦 Preparing files..." -ForegroundColor Yellow
$StageDir = "deploy_stage"
if (Test-Path $StageDir) { Remove-Item $StageDir -Recurse -Force }
New-Item -ItemType Directory -Path $StageDir | Out-Null

Copy-Item -Path "dist" -Destination $StageDir -Recurse
Copy-Item -Path "api" -Destination $StageDir -Recurse
Copy-Item -Path "scripts" -Destination $StageDir -Recurse
Copy-Item "package.json" -Destination $StageDir
Copy-Item "package-lock.json" -Destination $StageDir
Copy-Item ".env" -Destination $StageDir

if (Test-Path "$StageDir/api/node_modules") {
    Remove-Item "$StageDir/api/node_modules" -Recurse -Force
}

Write-Host "📦 Zipping..." -ForegroundColor Yellow
Compress-Archive -Path "$StageDir/*" -DestinationPath $LocalZip -Force -CompressionLevel Fast
Remove-Item $StageDir -Recurse -Force

# 3. Transfer Files
Write-Host "🚀 Uploading to VPS ($ServerIP)..." -ForegroundColor Yellow
Write-Host "⚠️  Enter Password now if prompted: Ssalazarca841209+" -ForegroundColor Magenta

# Create remote directory first via SSH (needs password)
# Actually, just use scp to copy to /tmp first or rely on scp to create file if path exists?
# The target folder /var/www/cafecolombia might not exist.
# Let's assume user creates it or SCP to /root first?
# Safest: ssh mkdir, then scp. But that's 2 passwords.
# Let's SCP to /root/deploy_package.zip. It's safe.

scp -o "StrictHostKeyChecking=no" -o "UserKnownHostsFile=/dev/null" "$LocalZip" "${User}@${ServerIP}:/root/$LocalZip"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Upload failed."
    exit 1
}

Write-Host "✅ UPLOAD COMPLETE!" -ForegroundColor Green
