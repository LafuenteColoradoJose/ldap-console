import { BASE_DN, getAdminClient, searchLdap } from './ldap.client';
import ldap from 'ldapjs';

export class GroupService {
  /**
   * Ruta base para los grupos. Por defecto, AD los mete en CN=Users
   * aunque lo ideal en producción es usar una OU específica.
   */
  static get GROUPS_BASE_DN() {
    return `CN=Users,${BASE_DN}`;
  }

  /**
   * Crea un nuevo grupo en el Active Directory.
   * @param groupName Nombre del grupo (sAMAccountName y CN)
   * @param description Descripción opcional del grupo
   */
  static async createGroup(groupName: string, description?: string): Promise<void> {
    const client = await getAdminClient();
    return new Promise((resolve, reject) => {
      const entry = {
        objectClass: ['top', 'group'],
        sAMAccountName: groupName, // Fundamental en Active Directory
        ...(description && { description })
      };

      const groupDN = `CN=${groupName},${this.GROUPS_BASE_DN}`;
      
      client.add(groupDN, entry, (err) => {
        client.unbind();
        if (err) return reject(err);
        resolve();
      });
    });
  }

  /**
   * Elimina un grupo por su nombre exacto.
   * @param groupName Nombre del grupo
   */
  static async deleteGroup(groupName: string): Promise<void> {
    const client = await getAdminClient();
    return new Promise((resolve, reject) => {
      const groupDN = `CN=${groupName},${this.GROUPS_BASE_DN}`;
      client.del(groupDN, (err) => {
        client.unbind();
        if (err) return reject(err);
        resolve();
      });
    });
  }

  /**
   * Busca un grupo por su sAMAccountName (nombre de grupo).
   * @param groupName Nombre del grupo
   */
  static async findGroup(groupName: string): Promise<any | null> {
    const client = await getAdminClient();
    try {
      const entries = await searchLdap(client, this.GROUPS_BASE_DN, {
        scope: 'sub',
        filter: `(&(objectClass=group)(sAMAccountName=${groupName}))`,
        attributes: ['sAMAccountName', 'description', 'member']
      });
      return entries.length > 0 ? entries[0] : null;
    } finally {
      client.unbind();
    }
  }

  /**
   * Obtiene todos los grupos del sistema.
   */
  static async getAllGroups(): Promise<any[]> {
    const client = await getAdminClient();
    try {
      const entries = await searchLdap(client, this.GROUPS_BASE_DN, {
        scope: 'sub',
        filter: '(objectClass=group)',
        attributes: ['sAMAccountName', 'description', 'member']
      });
      return entries;
    } finally {
      client.unbind();
    }
  }

  /**
   * Actualiza la descripción de un grupo
   */
  static async updateGroup(name: string, description: string): Promise<void> {
    const client = await getAdminClient();
    return new Promise((resolve, reject) => {
      const groupDN = `CN=${name},${this.GROUPS_BASE_DN}`;
      const change = new ldap.Change({
        operation: description ? 'replace' : 'delete',
        modification: new ldap.Attribute({ type: 'description', vals: description ? [description] : [] })
      });

      client.modify(groupDN, change, (err) => {
        client.unbind();
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
