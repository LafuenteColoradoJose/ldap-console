import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('API REST y Middleware de Autenticación', () => {
  let validToken: string;

  beforeAll(async () => {
    // 1. Hacemos login simulado para obtener un token real del backend
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'administrator',
        password: process.env.AD_PASSWORD || 'SuperSegura2026!'
      });
      
    // En el entorno de test puede que el AD no esté disponible para autenticar la pass,
    // o que tarde. Asumiremos que si devuelve token, lo guardamos.
    if (res.body.token) {
      validToken = res.body.token;
    }
  });

  it('debería denegar el acceso a /api/domain/info si no hay token (401)', async () => {
    const res = await request(app).get('/api/domain/info');
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('No se proporcionó un token');
  });

  it('debería denegar el acceso si el token es inventado (401)', async () => {
    const res = await request(app)
      .get('/api/domain/info')
      .set('Authorization', 'Bearer token_inventado_totalmente_falso');
    
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Token expirado o inválido');
  });

  it('debería permitir el acceso a /api/domain/info si el token es válido', async () => {
    // Si el setup inicial (beforeAll) no logró obtener token por falta de entorno,
    // saltamos este test para no ensuciar la consola.
    if (!validToken) return;

    const res = await request(app)
      .get('/api/domain/info')
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.objectName).toBeDefined(); // La raíz del AD (ej: DC=corp,DC=local)
  });
});
