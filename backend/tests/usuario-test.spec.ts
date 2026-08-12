import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { UserService } from '../src/services/ldap/user.service';

describe('Gestión de Usuarios (Users)', () => {
  const TEST_USERNAME = 'usuario-test';
  const TEST_FIRST_NAME = 'Usuario';
  const TEST_LAST_NAME = 'DePrueba';
  const TEST_CN = `${TEST_FIRST_NAME} ${TEST_LAST_NAME}`;

  // Limpiar antes de empezar
  beforeAll(async () => {
    try {
      await UserService.deleteUserByCN(TEST_CN);
    } catch (e) {
      // Ignoramos si no existe
    }
  });

  // Limpiar al terminar para no ensuciar el contenedor real
  afterAll(async () => {
    try {
      await UserService.deleteUserByCN(TEST_CN);
    } catch (e) {
      // Ignorar
    }
  });

  it('debería poder crear un nuevo usuario-test en el AD', async () => {
    // 1. Asegurar que no existe
    let user = await UserService.findUser(TEST_USERNAME);
    expect(user).toBeNull();

    // 2. Crear usuario a través del servicio
    await UserService.createUser(TEST_USERNAME, TEST_FIRST_NAME, TEST_LAST_NAME, 'test@corp.local');

    // 3. Buscar para validar su creación
    user = await UserService.findUser(TEST_USERNAME);
    expect(user).toBeDefined();
    expect(user).not.toBeNull();
    expect(user.objectName).toContain(`CN=${TEST_CN}`);

    // 4. Comprobar atributos (LDAP suele devolver arrays o strings)
    const mailAttr = user.attributes.find((a: any) => a.type === 'mail');
    expect(mailAttr.values).toContain('test@corp.local');
  });

  it('debería poder eliminar el usuario-test del AD', async () => {
    await UserService.deleteUserByCN(TEST_CN);
    const user = await UserService.findUser(TEST_USERNAME);
    expect(user).toBeNull();
  });
});
