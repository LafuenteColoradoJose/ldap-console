import { NodeSSH } from 'node-ssh';

export class DeployService {
  async deployTelemetryLinux(host: string, username: string, password?: string, privateKey?: string) {
    const ssh = new NodeSSH();
    
    const config: any = {
      host,
      username,
    };
    
    if (password) {
      config.password = password;
    } else if (privateKey) {
      config.privateKey = privateKey;
    } else {
      throw new Error('Se requiere contraseña o clave privada para SSH');
    }

    try {
      await ssh.connect(config);
      
      const serverIp = '192.168.1.142';
      
      const scriptContent = `#!/bin/bash
curl -X POST http://${serverIp}:3000/api/telemetry/heartbeat \\
     -H "Content-Type: application/json" \\
     -d "{\\"machineName\\": \\"$(hostname)\\", \\"activeUser\\": \\"$USER\\"}"
`;

      // 1. Install to user's local bin so we don't need sudo password for sudo
      await ssh.execCommand(`mkdir -p ~/.local/bin`);
      await ssh.execCommand(`echo '${scriptContent}' > ~/.local/bin/heartbeat.sh`);
      await ssh.execCommand(`chmod +x ~/.local/bin/heartbeat.sh`);
      
      // 2. Add to user's crontab
      const userCronJob = '*/10 * * * * ~/.local/bin/heartbeat.sh';
      await ssh.execCommand(`(crontab -l 2>/dev/null | grep -v "heartbeat.sh"; echo "${userCronJob}") | crontab -`);

      // 3. Run it once manually to trigger immediate telemetry
      await ssh.execCommand(`~/.local/bin/heartbeat.sh &`);

      ssh.dispose();
      return { success: true, message: 'Script de telemetría desplegado correctamente.' };
    } catch (error: any) {
      ssh.dispose();
      console.error('SSH Error:', error);
      throw new Error(`Error al conectar por SSH: ${error.message}`);
    }
  }
}

export const deployService = new DeployService();
