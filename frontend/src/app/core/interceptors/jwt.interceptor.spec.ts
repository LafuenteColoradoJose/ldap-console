import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, HttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './jwt.interceptor';
import { Auth } from '../services/auth';
import { vi } from 'vitest';

describe('jwtInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let mockAuthService: any;

  beforeEach(() => {
    mockAuthService = {
      logout: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: mockAuthService },
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería inyectar el token en las cabeceras si existe', () => {
    localStorage.setItem('ldap_token', 'test-token');

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({});
  });

  it('no debería inyectar el token si no existe', () => {
    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('debería llamar a authService.logout() cuando se recibe un error 401', () => {
    httpClient.get('/api/test').subscribe({
      next: () => expect.fail('debería haber fallado con un error 401'),
      error: (error) => {
        expect(error.status).toBe(401);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('no debería llamar a authService.logout() en otros errores (ej. 404, 500)', () => {
    httpClient.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(mockAuthService.logout).not.toHaveBeenCalled();
  });
});
