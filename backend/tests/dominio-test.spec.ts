import { describe, it, expect } from 'vitest';
import { DomainService } from '../src/services/ldap/domain.service';

describe('Exploración del Dominio (Top-Level)', () => {
  
  it('debería obtener la información del dominio raíz', async () => {
    // 1. Llamamos a nuestro servicio para leer la raíz del árbol
    const domainInfo = await DomainService.getDomainInfo();
    
    // 2. Verificamos que hemos obtenido un objeto
    expect(domainInfo).toBeDefined();
    expect(domainInfo.objectName).toBeDefined(); // Ej: "DC=corp,DC=local"
    
    // La raíz siempre debe tener la clase "domain"
    expect(domainInfo.attributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'objectClass' })
      ])
    );
  });

  it('debería listar las OUs y contenedores principales', async () => {
    // 1. Llamamos a nuestro servicio para listar el primer nivel
    const structure = await DomainService.getBaseStructure();
    
    // 2. Comprobamos que devuelve un array de contenedores
    expect(Array.isArray(structure)).toBe(true);
    expect(structure.length).toBeGreaterThan(0); // AD siempre tiene Users, Computers, etc.

    // 3. Verificamos que el contenedor 'Users' por defecto existe
    const usersContainer = structure.find(entry => entry.objectName.includes('CN=Users'));
    expect(usersContainer).toBeDefined();
    
    // Comprobamos la estructura de un atributo devuelto por ldapjs
    const nameAttribute = usersContainer.attributes.find((a: any) => a.type === 'name');
    expect(nameAttribute.values).toContain('Users');
  });

});
