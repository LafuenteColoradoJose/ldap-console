import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { OuService, OU } from '../../../core/services/ou.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-move-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule, 
    MatSelectModule, 
    MatFormFieldModule, 
    FormsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Mover {{ data.type === 'user' ? 'Usuario' : 'Grupo' }}: {{ data.name }}</h2>
    <mat-dialog-content>
      <div style="min-width: 350px; min-height: 150px; display: flex; flex-direction: column; padding-top: 1rem;">
        
        @if (loading()) {
          <div style="display: flex; justify-content: center; align-items: center; flex: 1;">
            <mat-spinner diameter="30"></mat-spinner>
          </div>
        } @else {
          <p style="margin-bottom: 1rem; color: #666;">Selecciona la Unidad Organizativa de destino:</p>
          <mat-form-field appearance="outline" style="width: 100%;">
            <mat-label>Unidad Organizativa (OU)</mat-label>
            <mat-select [ngModel]="selectedOU()" (ngModelChange)="selectedOU.set($event)">
              <mat-option [value]="'CN=Users,DC=corp,DC=local'">[Predeterminado] CN=Users</mat-option>
              @for (ou of ous(); track ou.distinguishedName) {
                @if (ou.type === 'ou') {
                  <mat-option [value]="ou.distinguishedName">
                    {{ ou.distinguishedName }}
                  </mat-option>
                }
              }
            </mat-select>
          </mat-form-field>
        }
        
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="selectedOU()" [disabled]="!selectedOU() || loading()">Mover</button>
    </mat-dialog-actions>
  `
})
export class MoveDialog implements OnInit {
  dialogRef = inject(MatDialogRef<MoveDialog>);
  data = inject(MAT_DIALOG_DATA);
  ouService = inject(OuService);

  ous = signal<OU[]>([]);
  loading = signal(true);
  selectedOU = signal<string>('');

  ngOnInit() {
    this.ouService.getAllOUs().subscribe({
      next: (data) => {
        this.ous.set(data);
        
        const parts = this.data.currentDN.split(',');
        parts.shift(); // remove CN=...
        const parentDN = parts.join(',');
        this.selectedOU.set(parentDN);
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }
}

