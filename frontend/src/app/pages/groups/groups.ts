import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupService } from '../../core/services/group.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GroupDialog } from './group-dialog';
import { MembersDialog } from './members-dialog';
import { OuService } from '../../core/services/ou.service';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './groups.html',
  styleUrl: './groups.scss'
})
export class Groups implements OnInit {
  private groupService = inject(GroupService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);

  groups: any[] = [];
  displayedColumns: string[] = ['name', 'description', 'actions'];
  loading = true;

  ngOnInit() {
    this.fetchGroups();
  }

  fetchGroups() {
    this.loading = true;
    this.groupService.getAllGroups().subscribe({
      next: (data) => {
        this.groups = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.showToast('Error al cargar grupos');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openGroupDialog(group?: any) {
    const isEdit = !!group;
    const dialogRef = this.dialog.open(GroupDialog, {
      width: '400px',
      data: {
        isEdit,
        group: isEdit ? {
          name: this.getGroupValue(group, 'sAMAccountName'),
          description: this.getGroupValue(group, 'description')
        } : { name: '', description: '' }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        if (isEdit) {
          const name = this.getGroupValue(group, 'sAMAccountName');
          this.groupService.updateGroup(name, result.description).subscribe({
            next: () => {
              this.showToast('Grupo actualizado correctamente');
              this.fetchGroups();
            },
            error: (err) => {
              console.error(err);
              this.showToast('Error al actualizar grupo');
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.groupService.createGroup(result.name, result.description).subscribe({
            next: () => {
              this.showToast('Grupo creado correctamente');
              this.fetchGroups();
            },
            error: (err) => {
              console.error(err);
              this.showToast('Error al crear grupo');
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        }
      }
    });
  }

  deleteGroup(name: string) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el grupo ${name}?`)) return;

    this.loading = true;
    this.groupService.deleteGroup(name).subscribe({
      next: () => {
        this.showToast(`Grupo ${name} eliminado.`);
        this.fetchGroups();
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

  openMembersDialog(group: any) {
    const groupName = this.getGroupValue(group, 'sAMAccountName');
    const members = this.getGroupValue(group, 'member', true);
    
    const dialogRef = this.dialog.open(MembersDialog, {
      width: '500px',
      data: { groupName, members }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.fetchGroups();
    });
  }

  private ouService = inject(OuService);

  openMoveDialog(group: any) {
    const name = this.getGroupValue(group, 'sAMAccountName');
    const currentDN = this.getGroupValue(group, 'distinguishedName') || `CN=${name},CN=Users,DC=corp,DC=local`;

    import('../../shared/components/move-dialog/move-dialog').then(m => {
      const dialogRef = this.dialog.open(m.MoveDialog, {
        width: '400px',
        data: { name, type: 'group', currentDN }
      });

      dialogRef.afterClosed().subscribe((selectedOU) => {
        if (selectedOU) {
          const newDN = `CN=${name},${selectedOU}`;
          if (newDN.toLowerCase() === currentDN.toLowerCase()) {
            this.showToast('El grupo ya se encuentra en esa ubicación');
            return;
          }

          this.loading = true;
          this.ouService.moveObject(currentDN, newDN).subscribe({
            next: () => {
              this.showToast('Grupo movido correctamente');
              this.fetchGroups();
            },
            error: (err: any) => {
              console.error(err);
              this.showToast('Error al mover grupo');
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        }
      });
    });
  }

  getGroupValue(group: any, key: string, allValues = false): any {
    const attr = group.attributes?.find((a: any) => a.type === key);
    if (!attr || !attr.values) return allValues ? [] : '';
    return allValues ? attr.values : (attr.values[0] || '');
  }
}
