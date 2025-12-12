$ServerIP = "31.97.128.11"
$User = "root"
$RemotePath = "/var/www/cafecolombia"
$LocalZip = "deploy_package.zip"

Write-Host "☕ CAFE COLOMBIA - DEPLOYMENT PART 2: EXECUTE" -ForegroundColor Cyan
Write-Host "============================================"

Write-Host "🔧 Connecting to VPS..." -ForegroundColor Yellow
Write-Host "⚠️  Enter Password now if prompted: Ssalazarca841209+" -ForegroundColor Magenta

$RemoteCommands = @"
    echo '📂 Preparing Directory...'
    mkdir -p $RemotePath
    
    echo '🚚 Moving Package...'
    mv /root/$LocalZip $RemotePath/$LocalZip
    cd $RemotePath
    
    echo '📂 Unzipping...'
    if ! command -v unzip &> /dev/null; then apt-get install -y unzip; fi
    unzip -o $LocalZip
    rm $LocalZip

    echo '⚙️  Running Setup Script...'
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
