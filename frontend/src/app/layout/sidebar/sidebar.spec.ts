import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideRouter([])]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería alternar el tema correctamente', () => {
    localStorage.removeItem('theme');
    // Empezamos con light por defecto (si el SO es light) o forzamos isDark false
    component.isDark = false;
    
    component.toggleTheme();
    
    expect(component.isDark).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.body.classList.contains('theme-dark')).toBe(true);
    
    component.toggleTheme();
    
    expect(component.isDark).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.body.classList.contains('theme-light')).toBe(true);
  });
});
