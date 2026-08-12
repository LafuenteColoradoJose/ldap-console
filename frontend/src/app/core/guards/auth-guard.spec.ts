import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot, provideRouter } from '@angular/router';
import { authGuard } from './auth-guard';
import { Auth } from '../services/auth';
import { vi } from 'vitest';

describe('authGuard', () => {
  let mockAuthService: any;
  let router: Router;

  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    mockAuthService = {
      isLoggedIn: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: mockAuthService },
        provideRouter([]) // Provee un router real para que funcionen las utilidades internas como parseUrl y createUrlTree
      ]
    });
    
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('debería permitir el acceso si el usuario está logueado', () => {
    mockAuthService.isLoggedIn.mockReturnValue(true);
    
    // Ejecutamos el guard
    const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    
    expect(result).toBe(true);
    expect(mockAuthService.isLoggedIn).toHaveBeenCalled();
  });

  it('debería denegar el acceso y redirigir a /login si no está logueado', () => {
    mockAuthService.isLoggedIn.mockReturnValue(false);
    
    const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as any;
    
    // El resultado es un UrlTree, podemos verificar a dónde redirige usando toString()
    expect(result.toString()).toBe('/login');
  });
});
