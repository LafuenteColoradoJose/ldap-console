# Guía de Instalación del Agente de Telemetría (Heartbeat)

Esta guía contiene los scripts necesarios para configurar el agente de telemetría en los equipos cliente (Windows y Linux) que forman parte del dominio. 
El agente enviará un *heartbeat* cada 10 minutos a nuestro backend indicando que la máquina está encendida y qué usuario la está utilizando.

> [!IMPORTANT]
> Debes verificar que la IP `192.168.1.142` en los scripts se corresponde con la IP real donde está alojado el backend de Ldap Console.

---

## 1. Agente para Windows 10 (PowerShell)

Este script utiliza PowerShell para obtener el nombre de la máquina y el usuario activo, y envía los datos mediante una petición HTTP POST.

### El Script (`heartbeat.ps1`)

Guarda el siguiente código en un archivo llamado `heartbeat.ps1` (por ejemplo, en `C:\Scripts\heartbeat.ps1`):

```powershell
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

# Si no se encuentra un usuario por query user, usamos el usuario del entorno (solo funciona bien si el script corre como el usuario)
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
```

### Despliegue mediante Tarea Programada (Task Scheduler)
Para que el script se ejecute automáticamente cada 10 minutos:
1. Abre el **Programador de tareas** (Task Scheduler) en Windows.
2. Crea una **Nueva Tarea Básica**.
3. **Desencadenador**: Iniciar al iniciar sesión. En las propiedades avanzadas, configura **Repetir la tarea cada 10 minutos** por duración **Indefinida**.
4. **Acción**: Iniciar un programa.
   - Programa: `powershell.exe`
   - Argumentos: `-ExecutionPolicy Bypass -WindowStyle Hidden -File "\\corp.local\netlogon\heartbeat.ps1"`
7. *(Opcional pero Recomendado)*: Puedes desplegar esta tarea mediante una **GPO (Group Policy Object)** de Windows en la ruta: *Computer Configuration > Preferences > Control Panel Settings > Scheduled Tasks*. Configurar la tarea para que se ejecute bajo la cuenta **`NT AUTHORITY\SYSTEM`** garantiza que funcione siempre, incluso si los usuarios estándar tienen bloqueado el acceso a PowerShell por políticas de seguridad. De esta forma, **cualquier equipo nuevo que unas al dominio recibirá automáticamente el script y comenzará a enviar telemetría**.

---

## 2. Agente para Linux (Bash)

Este script utiliza herramientas estándar de GNU/Linux (`hostname`, `who`, `curl`) para enviar la telemetría.

### El Script (`heartbeat.sh`)

Guarda el siguiente código en `/usr/local/bin/heartbeat.sh`:

```bash
#!/bin/bash

# Configuración: IP y Puerto del servidor backend de Ldap Console
SERVER_URL="http://192.168.1.142:3000/api/telemetry/heartbeat"

# Obtener nombre de la máquina
MACHINE_NAME=$(hostname -s)

# Obtener el usuario actualmente logueado (sesión gráfica o tty1)
# Filtramos el primer usuario que aparece en 'who' (excluyendo root si hay otro)
ACTIVE_USER=$(who | awk '{print $1}' | grep -v 'root' | head -n 1)

# Si no hay usuario, mandamos vacío o 'none'
if [ -z "$ACTIVE_USER" ]; then
    ACTIVE_USER=""
fi

# Obtener la IP principal (ej: eth0, ens33, etc.)
IP_ADDRESS=$(hostname -I | awk '{print $1}')

# Construir el JSON
JSON_PAYLOAD=$(cat <<EOF
{
  "machineName": "${MACHINE_NAME}",
  "activeUser": "${ACTIVE_USER}",
  "ipAddress": "${IP_ADDRESS}"
}
EOF
)

# Enviar al servidor backend
curl -X POST -H "Content-Type: application/json" -d "$JSON_PAYLOAD" $SERVER_URL >/dev/null 2>&1
```

### Despliegue mediante Cronjob
Para automatizarlo en Linux:
1. Dale permisos de ejecución al script:
   ```bash
   sudo chmod +x /usr/local/bin/heartbeat.sh
   ```
2. Añádelo al crontab del sistema. Ejecuta `sudo crontab -e` y añade la siguiente línea:
   ```bash
   */10 * * * * /usr/local/bin/heartbeat.sh
   ```
Esto hará que el sistema ejecute el archivo en segundo plano cada 10 minutos.
