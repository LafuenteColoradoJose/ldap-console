import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class Users implements OnInit {
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  users: any[] = [];
  displayedColumns: string[] = ['name', 'username', 'email', 'status', 'actions'];
  loading = true;

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.showToast('Error al cargar usuarios');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  createUserDummy() {
    const username = prompt('Usuario (sAMAccountName):');
    if (!username) return;
    const firstName = prompt('Nombre:');
    const lastName = prompt('Apellidos:');
    const email = prompt('Correo electrónico (opcional):');
    
    if (!firstName || !lastName) {
      this.showToast('Nombre y apellidos son obligatorios');
      return;
    }

    this.loading = true;
    this.userService.createUser(username, firstName, lastName, email || '').subscribe({
      next: () => {
        this.showToast(`Usuario ${username} creado exitosamente.`);
        this.fetchUsers();
      },
      error: (err) => {
        console.error(err);
        this.showToast(`Error al crear: ${err.error?.message || err.message}`);
        this.loading = false;
      }
    });
  }

  toggleStatus(user: any) {
    const cn = this.getUserValue(user, 'cn');
    const currentlyDisabled = this.isUserDisabled(user);
    const willEnable = currentlyDisabled;

    this.loading = true;
    this.userService.toggleUserStatus(cn, willEnable).subscribe({
      next: () => {
        this.showToast(`Usuario ${willEnable ? 'habilitado' : 'deshabilitado'}.`);
        this.fetchUsers();
      },
      error: (err) => {
        console.error(err);
        this.showToast(`Error: ${err.error?.message || err.message}`);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteUser(cn: string) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el usuario ${cn}?`)) return;

    this.loading = true;
    this.userService.deleteUser(cn).subscribe({
      next: () => {
        this.showToast(`Usuario eliminado.`);
        this.fetchUsers();
      },
      error: (err) => {
        console.error(err);
        this.showToast(`Error al eliminar: ${err.error?.message || err.message}`);
        this.loading = false;
      }
    });
  }

  private showToast(message: string) {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }

  getUserValue(user: any, attr: string): string {
    const attribute = user.attributes?.find((a: any) => a.type === attr);
    return attribute ? attribute.values[0] : '';
  }

  isUserDisabled(user: any): boolean {
    const uac = this.getUserValue(user, 'userAccountControl');
    // UAC en Active Directory es un bitmask. 
    // Si (uac & 2) === 2, la cuenta está deshabilitada.
    const uacInt = parseInt(uac, 10);
    return !isNaN(uacInt) && (uacInt & 2) === 2;
  }
}
