import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserDialog } from './user-dialog';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class Users implements OnInit {
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);

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

  openUserDialog(user?: any) {
    const isEdit = !!user;
    const dialogRef = this.dialog.open(UserDialog, {
      width: '400px',
      data: {
        isEdit,
        user: isEdit ? {
          username: this.getUserValue(user, 'sAMAccountName'),
          firstName: this.getUserValue(user, 'givenName'),
          lastName: this.getUserValue(user, 'sn'),
          email: this.getUserValue(user, 'mail')
        } : { username: '', firstName: '', lastName: '', email: '' }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        if (isEdit) {
          const cn = this.getUserValue(user, 'cn');
          this.userService.updateUser(cn, {
            firstName: result.firstName,
            lastName: result.lastName,
            email: result.email
          }).subscribe({
            next: () => {
              this.showToast('Usuario actualizado correctamente');
              this.fetchUsers();
            },
            error: (err) => {
              console.error(err);
              this.showToast('Error al actualizar usuario');
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.userService.createUser(result.username, result.firstName, result.lastName, result.email).subscribe({
            next: () => {
              this.showToast('Usuario aprovisionado correctamente');
              this.fetchUsers();
            },
            error: (err) => {
              console.error(err);
              this.showToast('Error al aprovisionar usuario');
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        }
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
