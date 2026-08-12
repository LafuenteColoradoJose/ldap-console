import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { App } from './app';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App], // Necesario para mat-sidenav
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it(`debería tener como título 'LDAP console'`, () => {
    expect(component.title).toEqual('LDAP console');
  });

  it('debería detectar correctamente si es móvil', () => {
    // Simulamos que la ventana es pequeña
    const originalInnerWidth = window.innerWidth;
    
    // Testeamos la lógica de onResize directamente
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    component.onResize();
    expect(component.isMobile).toBe(true);
    expect(component.sidebarOpen).toBe(false);

    // Testeamos resolución de escritorio
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    component.onResize();
    expect(component.isMobile).toBe(false);
    expect(component.sidebarOpen).toBe(true);
    
    // Restauramos
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalInnerWidth });
  });
  it('debería alternar el menú móvil', () => {
    component.sidebarOpen = false;
    component.toggleMobileMenu();
    expect(component.sidebarOpen).toBe(true);
    component.toggleMobileMenu();
    expect(component.sidebarOpen).toBe(false);
  });

  it('debería cerrar el menú móvil si está en modo móvil', () => {
    component.isMobile = true;
    component.sidebarOpen = true;
    component.closeMobileMenu();
    expect(component.sidebarOpen).toBe(false);
  });

  it('no debería cerrar el menú si está en escritorio al llamar closeMobileMenu', () => {
    component.isMobile = false;
    component.sidebarOpen = true;
    component.closeMobileMenu();
    expect(component.sidebarOpen).toBe(true);
  });

  it('debería renderizar el layout logueado si authService devuelve true', () => {
    localStorage.setItem('ldap_token', 'fake-token');
    
    // Creamos un fixture nuevo para que evalúe el *ngIf desde cero en su primer ciclo
    const localFixture = TestBed.createComponent(App);
    localFixture.detectChanges();
    
    // Buscamos el sidenav container
    const sidenavContainer = localFixture.nativeElement.querySelector('mat-sidenav-container');
    expect(sidenavContainer).toBeTruthy();
    
    localStorage.removeItem('ldap_token');
  });
});
