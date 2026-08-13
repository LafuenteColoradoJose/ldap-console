import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GroupService } from '../../core/services/group.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-members-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatDialogModule, 
    MatButtonModule, 
    MatSlideToggleModule, 
    MatIconModule,
    MatInputModule,
    MatFormFieldModule
  ],
  template: `
    <h2 mat-dialog-title>Miembros de {{ data.groupName }}</h2>
    <mat-dialog-content>
      <div style="min-width: 450px; min-height: 300px; display: flex; flex-direction: column;">
        <div *ngIf="loading" style="flex: 1; display: flex; align-items: center; justify-content: center;">
          <span style="color: #666;">Cargando usuarios...</span>
        </div>
        
        <div *ngIf="!loading" style="display: flex; flex-direction: column; height: 100%;">
          <!-- Buscador -->
          <div style="position: relative; width: 100%; margin-bottom: 1rem;">
            <mat-icon style="position: absolute; left: 12px; top: 12px; color: #888;">search</mat-icon>
            <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="filterUsers()" placeholder="Buscar usuario por nombre o identificador..." 
                   style="width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #ccc; border-radius: 8px; font-size: 1rem; color: #333; outline: none; box-sizing: border-box; background: white;">
          </div>

          <!-- Lista con scroll -->
          <div style="max-height: 350px; overflow-y: auto; padding-right: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <div *ngIf="filteredUsers.length === 0" style="text-align: center; padding: 2rem; color: #666;">
              No se encontraron usuarios.
            </div>

            <div *ngFor="let user of filteredUsers" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(0,0,0,0.02); border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <mat-icon color="primary">person</mat-icon>
                <div>
                  <strong style="display: block;">{{ user.name }}</strong>
                  <small style="color: #666;">{{ user.username }}</small>
                </div>
              </div>
              <mat-slide-toggle 
                color="primary"
                [checked]="isMember(user)" 
                (change)="toggleMembership(user, $event.checked)"
                [disabled]="toggling[user.cn]">
              </mat-slide-toggle>
            </div>
          </div>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `
})
export class MembersDialog implements OnInit {
  allUsers: any[] = [];
  filteredUsers: any[] = [];
  searchQuery: string = '';
  loading = true;
  toggling: { [key: string]: boolean } = {};
  
  currentMembers: Set<string> = new Set();

  constructor(
    public dialogRef: MatDialogRef<MembersDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { groupName: string, members: string[] },
    private userService: UserService,
    private groupService: GroupService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.parseCurrentMembers(data.members || []);
  }

  ngOnInit() {
    this.fetchUsers();
  }

  parseCurrentMembers(members: string | string[]) {
    this.currentMembers.clear();
    const membersArray = Array.isArray(members) ? members : [members];
    membersArray.forEach(dn => {
      const match = dn.match(/CN=([^,]+)/i);
      if (match && match[1]) {
        this.currentMembers.add(match[1].toLowerCase());
      }
    });
  }

  fetchUsers() {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        const usersArray = Array.isArray(data) ? data : [];
        this.allUsers = usersArray.map((u: any) => {
          const cn = this.getUserValue(u, 'cn');
          const gn = this.getUserValue(u, 'givenName');
          const sn = this.getUserValue(u, 'sn');
          const username = this.getUserValue(u, 'sAMAccountName');
          return {
            cn,
            name: gn || sn ? (gn + ' ' + sn).trim() : cn,
            username
          };
        });
        
        // Ordenar alfabéticamente
        this.allUsers.sort((a, b) => a.name.localeCompare(b.name));
        
        this.filteredUsers = [...this.allUsers];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterUsers() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredUsers = [...this.allUsers];
    } else {
      this.filteredUsers = this.allUsers.filter(u => 
        u.name.toLowerCase().includes(query) || 
        u.username.toLowerCase().includes(query)
      );
    }
  }

  isMember(user: any): boolean {
    return this.currentMembers.has(user.cn.toLowerCase());
  }

  toggleMembership(user: any, add: boolean) {
    this.toggling[user.cn] = true;
    
    if (add) {
      this.groupService.addMember(this.data.groupName, user.cn).subscribe({
        next: () => {
          this.currentMembers.add(user.cn.toLowerCase());
          this.toggling[user.cn] = false;
          this.snackBar.open(user.name + ' añadido al grupo', 'OK', { duration: 2000 });
        },
        error: (err) => {
          console.error(err);
          this.toggling[user.cn] = false;
          this.snackBar.open('Error al añadir miembro', 'OK', { duration: 3000 });
        }
      });
    } else {
      this.groupService.removeMember(this.data.groupName, user.cn).subscribe({
        next: () => {
          this.currentMembers.delete(user.cn.toLowerCase());
          this.toggling[user.cn] = false;
          this.snackBar.open(user.name + ' eliminado del grupo', 'OK', { duration: 2000 });
        },
        error: (err) => {
          console.error(err);
          this.toggling[user.cn] = false;
          this.snackBar.open('Error al eliminar miembro', 'OK', { duration: 3000 });
        }
      });
    }
  }

  getUserValue(user: any, key: string): string {
    const attr = user.attributes?.find((a: any) => a.type === key);
    return attr?.values?.[0] || '';
  }
}
