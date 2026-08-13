import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-group-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  template: `
    <h2 mat-dialog-title>{{ data.isEdit ? 'Editar Grupo' : 'Nuevo Grupo' }}</h2>
    <mat-dialog-content>
      <div style="display: flex; flex-direction: column; gap: 1rem; padding-top: 0.5rem; min-width: 300px;">
        <mat-form-field appearance="outline">
          <mat-label>Nombre del Grupo</mat-label>
          <input matInput [(ngModel)]="group.name" required [disabled]="data.isEdit">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Descripción</mat-label>
          <textarea matInput [(ngModel)]="group.description" rows="3"></textarea>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="group" [disabled]="!group.name">Guardar</button>
    </mat-dialog-actions>
  `
})
export class GroupDialog {
  group: any;
  constructor(
    public dialogRef: MatDialogRef<GroupDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.group = { ...data.group };
  }
}
