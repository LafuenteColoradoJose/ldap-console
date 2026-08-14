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
        attributes: ['cn', 'dNSHostName', 'operatingSystem', 'operatingSystemVersion', 'whenCreated', 'lastLogonTimestamp', 'lastLogon', 'userAccountControl']
      });

      // Buscar en Domain Controllers
      const dcEntries = await searchLdap(client, this.DOMAIN_CONTROLLERS_BASE_DN, {
        scope: 'sub',
        filter: '(objectClass=computer)',
        attributes: ['cn', 'dNSHostName', 'operatingSystem', 'operatingSystemVersion', 'whenCreated', 'lastLogonTimestamp', 'lastLogon', 'userAccountControl']
      });

      const allEntries = [...computerEntries, ...dcEntries];

      // Mapear y hacer ping a cada máquina
      const computers = await Promise.all(allEntries.map(async (entry) => {
        const cn = this.getAttr(entry, 'cn');
        const dNSHostName = this.getAttr(entry, 'dNSHostName');
        const operatingSystem = this.getAttr(entry, 'operatingSystem');
        const operatingSystemVersion = this.getAttr(entry, 'operatingSystemVersion');
        const whenCreated = this.getAttr(entry, 'whenCreated');
        
        const lastLogonTimestamp = this.getAttr(entry, 'lastLogonTimestamp');
        const lastLogon = this.getAttr(entry, 'lastLogon');
        
        // Prefer lastLogon as it's more accurate for the current DC, fallback to lastLogonTimestamp
        const bestLogon = lastLogon || lastLogonTimestamp;
        
        let isOnline = false;

        if (bestLogon && bestLogon !== '0') {
          const fileTime = parseInt(bestLogon, 10);
          if (!isNaN(fileTime)) {
            const jsTime = (fileTime / 10000) - 11644473600000;
            // Si el equipo contactó con el DC en los últimos 30 minutos
            const THIRTY_MINUTES = 30 * 60 * 1000;
            isOnline = (Date.now() - jsTime) < THIRTY_MINUTES;
          }
        }

        return {
          dn: entry.objectName,
          cn: cn,
          dNSHostName: dNSHostName,
          operatingSystem: operatingSystem || 'Desconocido',
          operatingSystemVersion: operatingSystemVersion,
          whenCreated: whenCreated,
          lastLogonTimestamp: lastLogonTimestamp,
          isOnline: isOnline
        };
      }));

      return computers;
    } finally {
      client.unbind();
    }
  }
}
