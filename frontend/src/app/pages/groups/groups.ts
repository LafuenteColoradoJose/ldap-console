import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupService } from '../../core/services/group.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './groups.html',
  styleUrl: './groups.scss'
})
export class Groups implements OnInit {
  private groupService = inject(GroupService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

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

  createGroupDummy() {
    const name = prompt('Nombre del grupo (sAMAccountName):');
    if (!name) return;
    const desc = prompt('Descripción del grupo:');
    
    this.loading = true;
    this.groupService.createGroup(name, desc || '').subscribe({
      next: () => {
        this.showToast(`Grupo ${name} creado exitosamente.`);
        this.fetchGroups();
      },
      error: (err) => {
        console.error(err);
        this.showToast(`Error al crear el grupo: ${err.error?.message || err.message}`);
        this.loading = false;
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

  getGroupValue(group: any, attr: string): string {
    const attribute = group.attributes?.find((a: any) => a.type === attr);
    return attribute ? attribute.values[0] : '';
  }
}
