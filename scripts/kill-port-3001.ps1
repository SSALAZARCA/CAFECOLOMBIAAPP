$port = 3001
$tcp = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($tcp) {
    $pidToKill = $tcp.OwningProcess
    Write-Host "Found process $pidToKill listening on port $port. Killing..."
    Stop-Process -Id $pidToKill -Force
    Write-Host "Process killed."
} else {
    Write-Host "No process found on port $port."
}
