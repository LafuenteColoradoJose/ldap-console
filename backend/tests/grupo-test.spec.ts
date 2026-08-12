import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GroupService } from '../src/services/ldap/group.service';

describe('Gestión de Grupos (Groups)', () => {
  const TEST_GROUP_NAME = 'grupo-test';
  const TEST_GROUP_DESC = 'Grupo de pruebas automatizadas E2E';

  // Limpieza inicial por si falló un test anterior
  beforeAll(async () => {
    try {
      await GroupService.deleteGroup(TEST_GROUP_NAME);
    } catch (e) {
      // Ignoramos si el grupo no existe, es lo esperado
    }
  });

  // Limpieza final para no ensuciar el AD real
  afterAll(async () => {
    try {
      await GroupService.deleteGroup(TEST_GROUP_NAME);
    } catch (e) {
      // Ignorar errores
    }
  });

  it('debería poder crear un nuevo grupo de prueba en el AD', async () => {
    // 1. Verificamos que no existe al principio
    let group = await GroupService.findGroup(TEST_GROUP_NAME);
    expect(group).toBeNull();

    // 2. Creamos el grupo usando el servicio
    await GroupService.createGroup(TEST_GROUP_NAME, TEST_GROUP_DESC);

    // 3. Volvemos a buscarlo para confirmar que ahora sí existe
    group = await GroupService.findGroup(TEST_GROUP_NAME);
    
    expect(group).toBeDefined();
    expect(group).not.toBeNull();
    expect(group.objectName).toBeDefined();
    
    // 4. Verificamos los atributos básicos creados
    const descAttr = group.attributes.find((a: any) => a.type === 'description');
    expect(descAttr).toBeDefined();
    expect(descAttr.values).toContain(TEST_GROUP_DESC);

    const samAttr = group.attributes.find((a: any) => a.type === 'sAMAccountName');
    expect(samAttr.values).toContain(TEST_GROUP_NAME);
  });

  it('debería poder eliminar el grupo de prueba del AD', async () => {
    // 1. Borramos el grupo
    await GroupService.deleteGroup(TEST_GROUP_NAME);

    // 2. Intentamos buscarlo, debe devolver null
    const group = await GroupService.findGroup(TEST_GROUP_NAME);
    expect(group).toBeNull();
  });
});
