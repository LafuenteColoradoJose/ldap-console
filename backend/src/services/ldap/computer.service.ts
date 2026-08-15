import { BASE_DN, getAdminClient, searchLdap } from './ldap.client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ComputerService {
  private static COMPUTERS_BASE_DN = process.env.COMPUTERS_BASE_DN || 'CN=Computers,DC=corp,DC=local';
  private static DOMAIN_CONTROLLERS_BASE_DN = process.env.DOMAIN_CONTROLLERS_BASE_DN || 'OU=Domain Controllers,DC=corp,DC=local';
  private static ALL_BASE_DN = BASE_DN;

  private static getAttr(entry: any, type: string): string {
    const attr = entry.attributes?.find((a: any) => a.type === type);
    return attr && attr.values ? attr.values[0] : '';
  }

  static async getAllComputers(): Promise<any[]> {
    const client = await getAdminClient();
    try {
      // Buscar en todo el dominio
      const allEntries = await searchLdap(client, this.ALL_BASE_DN, {
        scope: 'sub',
        filter: '(objectClass=computer)',
        attributes: ['cn', 'dNSHostName', 'operatingSystem', 'operatingSystemVersion', 'whenCreated', 'lastLogonTimestamp', 'lastLogon', 'userAccountControl']
      });

      // Mapear y hacer ping a cada máquina
      const computers = await Promise.all(allEntries.map(async (entry) => {
        const cn = this.getAttr(entry, 'cn');
        const dNSHostName = this.getAttr(entry, 'dNSHostName');
        const operatingSystem = this.getAttr(entry, 'operatingSystem');
        const operatingSystemVersion = this.getAttr(entry, 'operatingSystemVersion');
        const whenCreated = this.getAttr(entry, 'whenCreated');
        
        const lastLogonTimestamp = this.getAttr(entry, 'lastLogonTimestamp');
        const lastLogon = this.getAttr(entry, 'lastLogon');
        
        // Si no hay DNS HostName, intentamos usar el CN como hostname
        let targetHost = dNSHostName || cn;
        let isOnline = false;

        if (targetHost && !targetHost.includes('.')) {
          targetHost = `${targetHost}.corp.local`;
        }

        if (targetHost) {
          try {
            // Resolver la IP utilizando el servidor DNS del AD (192.168.1.142)
            const { Resolver } = require('dns/promises');
            const resolver = new Resolver();
            resolver.setServers(['192.168.1.142']);
            const addresses = await resolver.resolve4(targetHost);
            const ip = addresses[0];

            // Hacemos ping a la IP resuelta. '-c 1' = 1 paquete, '-W 1' = timeout de 1 segundo
            await execAsync(`ping -c 1 -W 1 ${ip}`);
            isOnline = true; // Si no lanza excepción, el ping funcionó
          } catch (e) {
            isOnline = false; // El ping falló (timeout o error DNS)
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
