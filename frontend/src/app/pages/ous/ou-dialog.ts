import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ou-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  template: `
    <h2 mat-dialog-title>{{ data.isEdit ? 'Editar Unidad Organizativa' : 'Nueva Unidad Organizativa' }}</h2>
    <mat-dialog-content>
      <div style="display: flex; flex-direction: column; gap: 1rem; padding-top: 0.5rem; min-width: 300px;">
        
        @if (!data.isEdit && data.parentDN) {
          <div style="font-size: 0.85rem; color: #888; margin-bottom: 0.5rem;">
            Se creará dentro de: <br/> <strong>{{ data.parentDN }}</strong>
          </div>
        }

        <mat-form-field appearance="outline">
          <mat-label>Nombre de la OU</mat-label>
          <input matInput [ngModel]="ou().name" (ngModelChange)="updateName($event)" required [disabled]="data.isEdit">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Descripción</mat-label>
          <textarea matInput [ngModel]="ou().description" (ngModelChange)="updateDesc($event)" rows="3"></textarea>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="{ name: ou().name, description: ou().description, parentDN: data.parentDN }" [disabled]="!ou().name">Guardar</button>
    </mat-dialog-actions>
  `
})
export class OuDialog implements OnInit {
  dialogRef = inject(MatDialogRef<OuDialog>);
  data = inject(MAT_DIALOG_DATA);

  ou = signal({ name: '', description: '' });

  ngOnInit() {
    this.ou.set({ ...this.data.ou });
  }

  updateName(val: string) {
    this.ou.update(o => ({ ...o, name: val }));
  }

  updateDesc(val: string) {
    this.ou.update(o => ({ ...o, description: val }));
  }
}
