import { BASE_DN, getAdminClient, searchLdap } from './ldap.client';
import ldap from 'ldapjs';

export class OuService {
  /**
   * Obtiene todas las Unidades Organizativas
   */
  static async getAllOUs(): Promise<any[]> {
    const client = await getAdminClient();
    try {
      const entries = await searchLdap(client, BASE_DN, {
        scope: 'sub',
        filter: '(|(objectClass=organizationalUnit)(objectClass=user)(objectClass=group))',
        attributes: ['ou', 'cn', 'description', 'distinguishedName', 'objectClass', 'sAMAccountName', 'userAccountControl', 'mail']
      });
      return entries;
    } finally {
      client.unbind();
    }
  }

  /**
   * Crea una nueva OU
   * @param name Nombre de la OU
   * @param description Descripción (opcional)
   * @param parentDN DN del padre (opcional, por defecto es BASE_DN)
   */
  static async createOU(name: string, description?: string, parentDN?: string): Promise<void> {
    const client = await getAdminClient();
    return new Promise((resolve, reject) => {
      const entry = {
        objectClass: ['top', 'organizationalUnit'],
        ou: name,
        ...(description && { description })
      };

      const parent = parentDN || BASE_DN;
      const ouDN = `OU=${name},${parent}`;
      
      client.add(ouDN, entry, (err) => {
        client.unbind();
        if (err) return reject(err);
        resolve();
      });
    });
  }

  /**
   * Elimina una OU por su DN completo
   * @param dn Distinguished Name de la OU
   */
  static async deleteOU(dn: string): Promise<void> {
    const client = await getAdminClient();
    return new Promise((resolve, reject) => {
      client.del(dn, (err) => {
        client.unbind();
        if (err) return reject(err);
        resolve();
      });
    });
  }

  /**
   * Actualiza la descripción de una OU
   */
  static async updateOU(dn: string, description: string): Promise<void> {
    const client = await getAdminClient();
    return new Promise((resolve, reject) => {
      const change = new ldap.Change({
        operation: description ? 'replace' : 'delete',
        modification: new ldap.Attribute({ type: 'description', vals: description ? [description] : [] })
      });

      client.modify(dn, change, (err) => {
        client.unbind();
        if (err) return reject(err);
        resolve();
      });
    });
  }

  /**
   * Mueve un objeto (Usuario o Grupo) a una nueva OU cambiando su DN.
   * @param oldDN DN actual del objeto
   * @param newDN Nuevo DN completo del objeto
   */
  static async moveObject(oldDN: string, newDN: string): Promise<void> {
    const client = await getAdminClient();
    return new Promise((resolve, reject) => {
      client.modifyDN(oldDN, newDN, (err) => {
        client.unbind();
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
