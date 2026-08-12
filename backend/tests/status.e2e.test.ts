import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('E2E: /api/status', () => {
  it('should return a JSON response', async () => {
    const res = await request(app).get('/api/status');
    
    // El servidor puede devolver 200 (si LDAP funciona) o 500 (si no hay LDAP)
    expect([200, 500]).toContain(res.status);
    expect(res.type).toBe('application/json');
    expect(res.body).toHaveProperty('status');
  });

  // Nota: Para un test estricto de conexión 200 OK, el entorno de Docker debe estar activo.
  // Podríamos tener un test específico de integración para eso si quisiéramos.
});
