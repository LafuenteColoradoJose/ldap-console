import { Component, HostListener, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Sidebar } from './layout/sidebar/sidebar';
import { Header } from './layout/header/header';
import { Auth } from './core/services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatSidenavModule, Sidebar, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  title = 'LDAP console';
  authService = inject(Auth);
  
  isMobile = false;
  sidebarOpen = false; // Solo se usa en móvil para abrir/cerrar

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      // En escritorio siempre está abierto y usa el efecto hover de SCSS
      this.sidebarOpen = true; 
    } else {
      this.sidebarOpen = false;
    }
  }

  toggleMobileMenu() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeMobileMenu() {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
