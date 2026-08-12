import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { Auth, AuthResponse } from './auth';

describe('AuthService', () => {
  let service: Auth;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Limpiamos el localStorage antes de cada prueba
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        Auth,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '**', component: class Dummy {} }])
      ]
    });
    
    service = TestBed.inject(Auth);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Verifica que no haya peticiones HTTP pendientes
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería inicializarse sin usuario si no hay token en localStorage', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('debería inicializarse con usuario si hay token y user en localStorage', () => {
    localStorage.setItem('ldap_token', 'fake-jwt-token');
    localStorage.setItem('ldap_user', JSON.stringify({ username: 'admin' }));
    
    // Forzamos una nueva instancia manualmente
    const http = TestBed.inject(HttpClient);
    const router = TestBed.inject(Router);
    
    const newService = new Auth(http, router);
    expect(newService.isLoggedIn()).toBe(true);
    expect(newService.currentUser()).toEqual({ username: 'admin' });
  });

  it('debería realizar el login correctamente, guardar datos y actualizar signal', () => {
    const mockResponse: AuthResponse = {
      status: 'success',
      token: 'fake-jwt-token',
      user: { username: 'testuser@corp.local' }
    };

    service.login('testuser', 'password123').subscribe(success => {
      expect(success).toBe(true);
      expect(service.isLoggedIn()).toBe(true);
      expect(service.currentUser()?.username).toBe('testuser@corp.local');
      expect(localStorage.getItem('ldap_token')).toBe('fake-jwt-token');
    });

    const req = httpTestingController.expectOne('http://localhost:3000/api/auth/login');
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ username: 'testuser', password: 'password123' });
    
    // Simulamos la respuesta exitosa del backend
    req.flush(mockResponse);
  });

  it('debería fallar el login correctamente y no guardar datos', () => {
    service.login('wronguser', 'wrongpass').subscribe(success => {
      expect(success).toBe(false);
      expect(service.isLoggedIn()).toBe(false);
      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('ldap_token')).toBeNull();
    });

    const req = httpTestingController.expectOne('http://localhost:3000/api/auth/login');
    // Simulamos un error 401 Unauthorized
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('debería realizar el logout borrando el localStorage y el signal', () => {
    // Estado inicial simulado logueado
    localStorage.setItem('ldap_token', 'fake-jwt-token');
    localStorage.setItem('ldap_user', JSON.stringify({ username: 'admin' }));
    
    // Forzamos actualización manual para la prueba sin recrear el servicio
    (service as any).currentUserSignal.set({ username: 'admin' });

    expect(service.isLoggedIn()).toBe(true);
    
    service.logout();
    
    expect(service.isLoggedIn()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('ldap_token')).toBeNull();
    expect(localStorage.getItem('ldap_user')).toBeNull();
  });
});
