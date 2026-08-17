# heartbeat.ps1

# Configuración: IP y Puerto del servidor backend de Ldap Console
$ServerUrl = "http://192.168.1.142:3000/api/telemetry/heartbeat"

# Obtener nombre de la máquina (sin dominio)
$MachineName = $env:COMPUTERNAME

# Obtener el usuario activo actualmente
# Se utiliza el comando 'query user' y se busca la sesión activa.
$QueryUser = query user 2>&1
$ActiveUser = ""

if ($LASTEXITCODE -eq 0) {
    foreach ($line in $QueryUser) {
        if ($line -match "^\s*>([^\s]+)") {
            $ActiveUser = $matches[1]
            break
        } elseif ($line -match "^\s*([^\s]+)\s+.*\s+Active") {
            $ActiveUser = $matches[1]
            break
        }
    }
}

# Si no se encuentra un usuario por query user, usamos el usuario del entorno
if ([string]::IsNullOrWhiteSpace($ActiveUser)) {
    $ActiveUser = $env:USERNAME
}

# Obtener la dirección IP local de la interfaz principal (IPv4)
$IpAddress = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi","Ethernet" -ErrorAction SilentlyContinue | Sort-Object InterfaceMetric | Select-Object -First 1).IPAddress

# Crear el payload (JSON)
$Body = @{
    machineName = $MachineName
    activeUser = $ActiveUser
    ipAddress = $IpAddress
} | ConvertTo-Json

# Enviar la petición POST al backend
try {
    Invoke-RestMethod -Uri $ServerUrl -Method Post -Body $Body -ContentType "application/json" -UseBasicParsing
    Write-Host "Heartbeat enviado correctamente."
} catch {
    Write-Error "Error enviando heartbeat: $_"
}
