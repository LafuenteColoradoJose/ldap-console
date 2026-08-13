import { getAdminClient, searchLdap } from './ldap.client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ComputerService {
  private static COMPUTERS_BASE_DN = process.env.COMPUTERS_BASE_DN || 'CN=Computers,DC=corp,DC=local';
  private static DOMAIN_CONTROLLERS_BASE_DN = process.env.DOMAIN_CONTROLLERS_BASE_DN || 'OU=Domain Controllers,DC=corp,DC=local';

  private static getAttr(entry: any, type: string): string {
    const attr = entry.attributes?.find((a: any) => a.type === type);
    return attr && attr.values ? attr.values[0] : '';
  }

  static async getAllComputers(): Promise<any[]> {
    const client = await getAdminClient();
    try {
      // Buscar en Computers
      const computerEntries = await searchLdap(client, this.COMPUTERS_BASE_DN, {
        scope: 'sub',
        filter: '(objectClass=computer)',
        attributes: ['cn', 'dNSHostName', 'operatingSystem', 'operatingSystemVersion', 'whenCreated', 'lastLogonTimestamp', 'userAccountControl']
      });

      // Buscar en Domain Controllers
      const dcEntries = await searchLdap(client, this.DOMAIN_CONTROLLERS_BASE_DN, {
        scope: 'sub',
        filter: '(objectClass=computer)',
        attributes: ['cn', 'dNSHostName', 'operatingSystem', 'operatingSystemVersion', 'whenCreated', 'lastLogonTimestamp', 'userAccountControl']
      });

      const allEntries = [...computerEntries, ...dcEntries];

      // Mapear y hacer ping a cada máquina
      const computers = await Promise.all(allEntries.map(async (entry) => {
        const cn = this.getAttr(entry, 'cn');
        const dNSHostName = this.getAttr(entry, 'dNSHostName');
        const operatingSystem = this.getAttr(entry, 'operatingSystem');
        const operatingSystemVersion = this.getAttr(entry, 'operatingSystemVersion');
        const whenCreated = this.getAttr(entry, 'whenCreated');
        
        const hostname = dNSHostName || cn;
        let isOnline = false;
        
        if (hostname) {
          try {
            // Intentamos hacer un ping de 1 paquete con timeout de 1 segundo
            await execAsync(`ping -c 1 -W 1 ${hostname}`);
            isOnline = true;
          } catch (error) {
            isOnline = false;
          }
        }

        return {
          dn: entry.objectName,
          cn: cn,
          dNSHostName: dNSHostName,
          operatingSystem: operatingSystem || 'Desconocido',
          operatingSystemVersion: operatingSystemVersion,
          whenCreated: whenCreated,
          isOnline: isOnline
        };
      }));

      return computers;
    } finally {
      client.unbind();
    }
  }
}
