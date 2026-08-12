import { BASE_DN, getAdminClient, searchLdap } from './ldap.client';
import ldap from 'ldapjs';

export class UserService {
  static get USERS_BASE_DN() {
    return `CN=Users,${BASE_DN}`;
  }

  /**
   * Crea un usuario básico en el Directorio Activo
   * @param username sAMAccountName (ej: jdoe)
   * @param firstName Nombre (givenName)
   * @param lastName Apellido (sn)
   * @param email Correo electrónico (mail)
   */
  static async createUser(username: string, firstName: string, lastName: string, email?: string): Promise<void> {
    const client = await getAdminClient();
    return new Promise((resolve, reject) => {
      const cn = `${firstName} ${lastName}`;
      const userDN = `CN=${cn},${this.USERS_BASE_DN}`;

      const entry = {
        objectClass: ['top', 'person', 'organizationalPerson', 'user'],
        sAMAccountName: username,
        givenName: firstName,
        sn: lastName,
        displayName: cn,
        ...(email && { mail: email }),
        userAccountControl: '512' // Cuenta Normal Activada (Requiere que las políticas de pass de Samba lo permitan, a veces falla sin password, por simplicidad para test usamos 546 que es deshabilitada si no pasamos password)
      };

      // Si no proporcionamos contraseña, AD suele requerir que se cree deshabilitada
      entry.userAccountControl = '546'; // 512 (Normal) + 2 (Deshabilitada) + 32 (Pass not required)

      client.add(userDN, entry, (err) => {
        client.unbind();
        if (err) return reject(err);
        resolve();
      });
    });
  }

  /**
   * Busca un usuario por su sAMAccountName
   */
  static async findUser(username: string): Promise<any | null> {
    const client = await getAdminClient();
    try {
      const entries = await searchLdap(client, this.USERS_BASE_DN, {
        scope: 'sub',
        filter: `(&(objectClass=user)(sAMAccountName=${username}))`,
        attributes: ['sAMAccountName', 'givenName', 'sn', 'mail']
      });
      return entries.length > 0 ? entries[0] : null;
    } finally {
      client.unbind();
    }
  }

  /**
   * Elimina un usuario por su CN completo
   */
  static async deleteUserByCN(cn: string): Promise<void> {
    const client = await getAdminClient();
    return new Promise((resolve, reject) => {
      const userDN = `CN=${cn},${this.USERS_BASE_DN}`;
      client.del(userDN, (err) => {
        client.unbind();
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
