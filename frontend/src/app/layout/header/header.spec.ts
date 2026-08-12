import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería emitir el evento toggleMenu al hacer click en el botón', () => {
    vi.spyOn(component.toggleMenu, 'emit');
    
    // Obtenemos el botón del template y forzamos el click
    const button = fixture.debugElement.nativeElement.querySelector('.menu-button');
    button.click();
    
    expect(component.toggleMenu.emit).toHaveBeenCalled();
  });
});
