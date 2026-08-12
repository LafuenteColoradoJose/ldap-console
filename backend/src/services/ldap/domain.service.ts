import { BASE_DN, getAdminClient, searchLdap } from './ldap.client';

/**
 * Servicio para explorar el dominio y las Unidades Organizativas (OUs).
 */
export class DomainService {
  
  /**
   * Obtiene la estructura base (Unidades Organizativas y Contenedores principales)
   * del dominio.
   */
  static async getBaseStructure(): Promise<any[]> {
    const client = await getAdminClient();
    try {
      const entries = await searchLdap(client, BASE_DN, {
        scope: 'one', // Solo el primer nivel debajo de la raíz
        filter: '(|(objectClass=organizationalUnit)(objectClass=container))',
        attributes: ['name', 'objectClass', 'description']
      });
      return entries;
    } finally {
      client.unbind();
    }
  }

  /**
   * Obtiene la información básica del dominio raíz.
   */
  static async getDomainInfo(): Promise<any> {
    const client = await getAdminClient();
    try {
      const entries = await searchLdap(client, BASE_DN, {
        scope: 'base', // Solo el propio BASE_DN
        filter: '(objectClass=domain)',
        attributes: ['dc', 'description', 'objectClass']
      });
      return entries[0] || null;
    } finally {
      client.unbind();
    }
  }
}
