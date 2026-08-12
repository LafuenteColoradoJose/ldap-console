import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { of } from 'rxjs';
import { Login } from './login';
import { Auth } from '../../core/services/auth';
import { vi } from 'vitest';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let mockAuthService: any;
  let mockAnnouncer: any;

  beforeEach(async () => {
    mockAuthService = {
      login: vi.fn()
    };
    mockAnnouncer = {
      announce: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '**', component: class Dummy {} }]),
        { provide: Auth, useValue: mockAuthService },
        { provide: LiveAnnouncer, useValue: mockAnnouncer }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener el formulario inválido por defecto', () => {
    expect(component.loginForm.invalid).toBe(true);
  });

  it('debería mostrar error si no hay usuario o contraseña', () => {
    component.onSubmit();
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('debería llamar a authService y redirigir si el login es correcto', () => {
    mockAuthService.login.mockReturnValue(of(true));
    
    component.loginForm.controls['username'].setValue('admin');
    component.loginForm.controls['password'].setValue('1234');
    
    component.onSubmit();
    
    expect(mockAuthService.login).toHaveBeenCalledWith('admin', '1234');
    expect(mockAnnouncer.announce).toHaveBeenCalledWith('Sesión iniciada correctamente');
  });

  it('debería mostrar mensaje de error si el login falla', () => {
    mockAuthService.login.mockReturnValue(of(false));
    
    component.loginForm.controls['username'].setValue('baduser');
    component.loginForm.controls['password'].setValue('badpass');
    
    component.onSubmit();
    
    expect(component.errorMessage()).toBe('Credenciales inválidas. Compruebe su usuario y contraseña.');
    expect(mockAnnouncer.announce).toHaveBeenCalledWith('Credenciales inválidas. Compruebe su usuario y contraseña.');
  });
});
