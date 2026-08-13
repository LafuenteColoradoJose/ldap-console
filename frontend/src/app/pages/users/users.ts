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
import { UserGroupsDialog } from './user-groups-dialog';

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
  displayedColumns: string[] = ['name', 'username', 'email', 'lastLogon', 'status', 'actions'];
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
          this.userService.createUser(result.username, result.firstName, result.lastName, result.email, result.password, result.forcePasswordChange).subscribe({
            next: () => {
              this.showToast('Usuario aprovisionado correctamente');
              this.fetchUsers();
            },
            error: (err) => {
              console.error(err);
              const msg = err.error?.message || err.message;
              this.showToast(msg.includes('Constraint Violation') 
                ? 'Error: La contraseña no cumple los requisitos mínimos de seguridad (complejidad/longitud).' 
                : `Error al aprovisionar: ${msg}`);
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

  openUserGroupsDialog(user: any) {
    const gn = this.getUserValue(user, 'givenName');
    const sn = this.getUserValue(user, 'sn');
    const cn = this.getUserValue(user, 'cn');
    const userName = gn || sn ? (gn + ' ' + sn).trim() : cn;
    
    const rawGroups = this.getUserValue(user, 'memberOf', true);
    let groupsArray: string[] = [];
    if (rawGroups && rawGroups.length > 0) {
      const arr = Array.isArray(rawGroups) ? rawGroups : [rawGroups];
      groupsArray = arr.map((dn: string) => {
        const match = dn.match(/CN=([^,]+)/i);
        return match ? match[1] : dn;
      });
    }

    this.dialog.open(UserGroupsDialog, {
      width: '450px',
      data: { userName, groups: groupsArray }
    });
  }

  getUserValue(user: any, key: string, allValues = false): any {
    const attr = user.attributes?.find((a: any) => a.type === key);
    if (!attr || !attr.values) return allValues ? [] : '';
    return allValues ? attr.values : (attr.values[0] || '');
  }

  isUserDisabled(user: any): boolean {
    const uac = this.getUserValue(user, 'userAccountControl');
    // UAC en Active Directory es un bitmask. 
    // Si (uac & 2) === 2, la cuenta está deshabilitada.
    const uacInt = parseInt(uac, 10);
    return !isNaN(uacInt) && (uacInt & 2) === 2;
  }

  formatLastLogon(user: any): string {
    const lastLogon = this.getUserValue(user, 'lastLogon');
    if (!lastLogon || lastLogon === '0') return 'Nunca';
    
    // lastLogon is Windows FileTime (100-nanosecond intervals since 1601-01-01)
    const fileTime = parseInt(lastLogon, 10);
    if (isNaN(fileTime)) return 'Desconocido';
    
    // Convert to JavaScript Date (milliseconds since 1970-01-01)
    const jsTime = (fileTime / 10000) - 11644473600000;
    const date = new Date(jsTime);
    
    return date.toLocaleString('es-ES', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
