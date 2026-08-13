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
   * @param password Contraseña opcional (en texto plano)
   * @param forcePasswordChange Obligar a cambiar en el siguiente inicio de sesión
   */
  static async createUser(
    username: string, 
    firstName: string, 
    lastName: string, 
    email?: string,
    password?: string,
    forcePasswordChange: boolean = true
  ): Promise<void> {
    const client = await getAdminClient();
    return new Promise((resolve, reject) => {
      const cn = `${firstName} ${lastName}`;
      const userDN = `CN=${cn},${this.USERS_BASE_DN}`;

      const entry: any = {
        objectClass: ['top', 'person', 'organizationalPerson', 'user'],
        sAMAccountName: username,
        givenName: firstName,
        sn: lastName,
        displayName: cn,
        ...(email && { mail: email })
      };

      if (password) {
        // La contraseña debe estar entre comillas y codificada en UTF-16LE para AD
        entry.unicodePwd = Buffer.from(`"${password}"`, 'utf16le');
        entry.userAccountControl = '512'; // Cuenta Normal Activada

        if (forcePasswordChange) {
          entry.pwdLastSet = '0';
        }
      } else {
        // Si no proporcionamos contraseña, AD suele requerir que se cree deshabilitada
        entry.userAccountControl = '546'; // 512 (Normal) + 2 (Deshabilitada) + 32 (Pass not required)
      }

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

  /**
   * Obtiene todos los usuarios.
   */
  static async getAllUsers(): Promise<any[]> {
    const client = await getAdminClient();
    try {
      const entries = await searchLdap(client, this.USERS_BASE_DN, {
        scope: 'sub',
        filter: '(objectClass=user)',
        attributes: ['sAMAccountName', 'givenName', 'sn', 'mail', 'userAccountControl', 'cn', 'memberOf', 'lastLogon']
      });
      return entries;
    } finally {
      client.unbind();
    }
  }

  /**
   * Habilita o deshabilita un usuario cambiando su userAccountControl
   */
  static async toggleUserStatus(cn: string, enable: boolean): Promise<void> {
    const client = await getAdminClient();
    return new Promise((resolve, reject) => {
      const userDN = `CN=${cn},${this.USERS_BASE_DN}`;
      // 544: Normal (512) + PassNotReq (32). 
      // 546: Normal (512) + Disabled (2) + PassNotReq (32).
      const uacValue = enable ? '544' : '546';
      
      const change = new ldap.Change({
        operation: 'replace',
        modification: new ldap.Attribute({
          type: 'userAccountControl',
          vals: [uacValue]
        })
      });

      client.modify(userDN, change, (err) => {
        client.unbind();
        if (err) return reject(err);
        resolve();
      });
    });
  }

  /**
   * Actualiza los datos de un usuario
   */
  static async updateUser(cn: string, data: { firstName?: string, lastName?: string, email?: string }): Promise<void> {
    const client = await getAdminClient();
    return new Promise((resolve, reject) => {
      const userDN = `CN=${cn},${this.USERS_BASE_DN}`;
      
      const modifications = [];
      if (data.firstName !== undefined) {
        modifications.push(new ldap.Change({ operation: 'replace', modification: new ldap.Attribute({ type: 'givenName', vals: [data.firstName] }) }));
      }
      if (data.lastName !== undefined) {
        modifications.push(new ldap.Change({ operation: 'replace', modification: new ldap.Attribute({ type: 'sn', vals: [data.lastName] }) }));
      }
      if (data.email !== undefined) {
        modifications.push(new ldap.Change({ operation: data.email ? 'replace' : 'delete', modification: new ldap.Attribute({ type: 'mail', vals: data.email ? [data.email] : [] }) }));
      }

      if (modifications.length === 0) {
        client.unbind();
        return resolve();
      }

      client.modify(userDN, modifications, (err) => {
        client.unbind();
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
