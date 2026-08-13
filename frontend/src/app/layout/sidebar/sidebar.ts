import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  @Output() navigate = new EventEmitter<void>();

  isDark = false;

  menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/domain', label: 'Dominio', icon: 'account_tree' },
    { path: '/users', label: 'Usuarios', icon: 'group' },
    { path: '/groups', label: 'Grupos', icon: 'groups' },
    { path: '/machines', label: 'Equipos', icon: 'computer' },
    { path: '/gpo', label: 'Políticas (GPO)', icon: 'policy' },
  ];

  ngOnInit() {
    // Detect current theme from localStorage or system
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDark = true;
      document.body.classList.add('theme-dark');
    } else if (savedTheme === 'light') {
      this.isDark = false;
      document.body.classList.add('theme-light');
    }
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    if (this.isDark) {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      localStorage.setItem('theme', 'light');
    }
  }
}
