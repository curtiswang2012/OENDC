# Evernight Oath: Dawn Chronicles - High Performance LAN & Multiplayer HTTP Relay Server
$port = 8080

# 1. Get LAN IP Addresses
$ips = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | 
       Where-Object { $_.AddressFamily -eq 'InterNetwork' -and $_.IPAddressToString -notmatch '^127\.' } | 
       ForEach-Object { $_.IPAddressToString }

$primaryIp = if ($ips) { $ips[0] } else { '127.0.0.1' }

# 2. Setup HttpListener with prefixes
$listener = New-Object System.Net.HttpListener

$boundAll = $false
try {
    $listener.Prefixes.Add("http://*:$port/")
    $listener.Start()
    $boundAll = $true
} catch {
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Prefixes.Add("http://127.0.0.1:$port/")
    if ($primaryIp -ne '127.0.0.1') {
        try { $listener.Prefixes.Add("http://$($primaryIp):$port/") } catch {}
    }
    $listener.Start()
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  ⚔️ 永夜之誓：破曉紀錄 (Evernight Oath) 伺服器已啟動 ⚔️" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  [本機電腦遊玩]   http://localhost:$port/" -ForegroundColor Green
if ($primaryIp -ne '127.0.0.1') {
    Write-Host "  [手機/其他電腦] http://$($primaryIp):$port/" -ForegroundColor Green
}
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  保持此視窗開啟即可享受 1~4 人多人連線。按 Ctrl+C 可停止。" -ForegroundColor Gray
Write-Host ""

# In-Memory Message & Room Relay Bus
$global:mpRooms = @{}
$global:mpPackets = [System.Collections.Generic.List[PSObject]]::new()
$global:packetLock = [System.Threading.Monitor]
$global:maxPackets = 1000

# Open browser
Start-Process "http://localhost:$port/index.html"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        # Add CORS Headers
        $res.Headers.Add("Access-Control-Allow-Origin", "*")
        $res.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $res.Headers.Add("Access-Control-Allow-Headers", "Content-Type")

        if ($req.HttpMethod -eq "OPTIONS") {
            $res.StatusCode = 204
            $res.Close()
            continue
        }

        $rawPath = $req.Url.LocalPath.TrimStart('/')

        # API Routes for Real-time Multiplayer Relay
        if ($rawPath.StartsWith("api/mp/")) {
            $apiAction = $rawPath.Substring(7)

            if ($apiAction -eq "send" -and $req.HttpMethod -eq "POST") {
                $reader = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
                $body = $reader.ReadToEnd()
                $reader.Close()

                if ($body) {
                    $packet = $body | ConvertFrom-Json
                    [System.Threading.Monitor]::Enter($global:mpPackets)
                    try {
                        $global:mpPackets.Add($packet)
                        if ($global:mpPackets.Count -gt $global:maxPackets) {
                            $global:mpPackets.RemoveAt(0)
                        }
                    } finally {
                        [System.Threading.Monitor]::Exit($global:mpPackets)
                    }

                    # Track room state
                    if ($packet.type -eq "room_announce" -and $packet.payload) {
                        $global:mpRooms[$packet.payload.id] = $packet.payload
                    }
                }

                $resBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":true}')
                $res.ContentType = "application/json"
                $res.ContentLength64 = $resBytes.Length
                $res.OutputStream.Write($resBytes, 0, $resBytes.Length)
                $res.Close()
                continue
            }
            elseif ($apiAction -eq "poll") {
                $since = 0
                if ($req.QueryString["since"]) {
                    $since = [int64]$req.QueryString["since"]
                }
                $peerId = $req.QueryString["peerId"]

                $resultPackets = @()
                [System.Threading.Monitor]::Enter($global:mpPackets)
                try {
                    $resultPackets = $global:mpPackets | Where-Object { 
                        $_.timestamp -gt $since -and ($peerId -eq $null -or $_.senderId -ne $peerId) 
                    }
                } finally {
                    [System.Threading.Monitor]::Exit($global:mpPackets)
                }

                $json = ConvertTo-Json -InputObject @{
                    timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
                    packets = @($resultPackets)
                } -Depth 10 -Compress

                $resBytes = [System.Text.Encoding]::UTF8.GetBytes($json)
                $res.ContentType = "application/json"
                $res.ContentLength64 = $resBytes.Length
                $res.OutputStream.Write($resBytes, 0, $resBytes.Length)
                $res.Close()
                continue
            }
            elseif ($apiAction -eq "rooms") {
                $json = ConvertTo-Json -InputObject ($global:mpRooms.Values) -Depth 10 -Compress
                if (-not $json) { $json = "[]" }
                $resBytes = [System.Text.Encoding]::UTF8.GetBytes($json)
                $res.ContentType = "application/json"
                $res.ContentLength64 = $resBytes.Length
                $res.OutputStream.Write($resBytes, 0, $resBytes.Length)
                $res.Close()
                continue
            }
        }

        # Static File Serving
        if ($rawPath -eq '') { $rawPath = 'index.html' }
        $localPath = Join-Path (Get-Location) $rawPath

        if (Test-Path $localPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            switch ($ext) {
                '.html' { $res.ContentType = 'text/html; charset=utf-8' }
                '.js'   { $res.ContentType = 'application/javascript; charset=utf-8' }
                '.css'  { $res.ContentType = 'text/css; charset=utf-8' }
                '.json' { $res.ContentType = 'application/json; charset=utf-8' }
                '.png'  { $res.ContentType = 'image/png' }
                default { $res.ContentType = 'application/octet-stream' }
            }
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $res.StatusCode = 404
        }
        $res.Close()
    } catch {
        # continue loop
    }
}
