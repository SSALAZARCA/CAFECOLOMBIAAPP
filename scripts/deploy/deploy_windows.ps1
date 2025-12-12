# Cafe Colombia - Deployment Script (Windows)
# Usage: .\deploy_windows.ps1

$ServerIP = "31.97.128.11"
$User = "root"
$RemotePath = "/var/www/cafecolombia"
$LocalZip = "deploy_package.zip"

Write-Host "☕ CAFE COLOMBIA - DEPLOYMENT UTILITY" -ForegroundColor Cyan
Write-Host "========================================"

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

# Copy artifacts
Copy-Item -Path "dist" -Destination $StageDir -Recurse
Copy-Item -Path "api" -Destination $StageDir -Recurse
Copy-Item -Path "scripts" -Destination $StageDir -Recurse
Copy-Item "package.json" -Destination $StageDir
Copy-Item "package-lock.json" -Destination $StageDir
Copy-Item ".env" -Destination $StageDir

# Remove node_modules from staging if copied
if (Test-Path "$StageDir/api/node_modules") {
    Remove-Item "$StageDir/api/node_modules" -Recurse -Force
}

Write-Host "📦 Zipping..." -ForegroundColor Yellow
Compress-Archive -Path "$StageDir/*" -DestinationPath $LocalZip -Force -CompressionLevel Fast

# Cleanup staging
Remove-Item $StageDir -Recurse -Force

# 3. Transfer Files
Write-Host "🚀 Uploading to VPS ($ServerIP)..." -ForegroundColor Yellow
Write-Host "⚠️  Enter Password now if prompted: Ssalazarca841209+" -ForegroundColor Magenta
# Disable strict host checking to avoid verification errors on fresh/rebuilt servers
scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $LocalZip ${User}@${ServerIP}:${RemotePath}/$LocalZip

if ($LASTEXITCODE -ne 0) {
    Write-Error "Upload failed. Check your password or network."
    exit 1
}

# 4. Execute Remote Deployment
Write-Host "🔧 Executing Remote Setup..." -ForegroundColor Yellow
Write-Host "⚠️  YOU WILL BE PROMPTED FOR THE PASSWORD AGAIN" -ForegroundColor Magenta

# Commands to run on server
$RemoteCommands = @"
    mkdir -p $RemotePath
    cd $RemotePath
    
    echo '📂 Unzipping...'
    if ! command -v unzip &> /dev/null; then apt-get install -y unzip; fi
    unzip -o $LocalZip
    rm $LocalZip

    echo '⚙️  Running Setup Script...'
    # Fix potential CRLF issues from Windows upload
    sed -i 's/\r$//' scripts/deploy/setup_vps.sh
    chmod +x scripts/deploy/setup_vps.sh
    ./scripts/deploy/setup_vps.sh

    echo '📦 Installing Dependencies...'
    npm ci --production --omit=dev

    echo '🚀 Starting/Restarting Application...'
    export PORT=3002
    pm2 start api/server.cjs --name 'cafecolombia' --update-env || pm2 restart 'cafecolombia' --update-env
    pm2 save
    
    echo '✅ DEPLOYMENT FINISHED!'
"@

ssh -t -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${User}@${ServerIP} $RemoteCommands

Write-Host "✨ Done! Visit http://$ServerIP" -ForegroundColor Green
Remove-Item $LocalZip -Force
