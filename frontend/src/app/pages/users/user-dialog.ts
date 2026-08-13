import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, FormsModule],
  template: `
    <h2 mat-dialog-title>{{ data.isEdit ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
    <mat-dialog-content>
      <div style="display: flex; flex-direction: column; gap: 1rem; padding-top: 0.5rem; min-width: 300px;">
        <mat-form-field appearance="outline" *ngIf="!data.isEdit">
          <mat-label>Nombre de usuario (sAMAccountName)</mat-label>
          <input matInput [(ngModel)]="user.username" required>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Nombre (givenName)</mat-label>
          <input matInput [(ngModel)]="user.firstName" required>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Apellidos (sn)</mat-label>
          <input matInput [(ngModel)]="user.lastName" required>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Correo Electrónico (mail)</mat-label>
          <input matInput [(ngModel)]="user.email" type="email">
        </mat-form-field>
        <ng-container *ngIf="!data.isEdit">
          <mat-form-field appearance="outline">
            <mat-label>Contraseña</mat-label>
            <input matInput [(ngModel)]="user.password" type="password" required>
          </mat-form-field>
          <mat-checkbox [(ngModel)]="user.forcePasswordChange" color="primary">
            Obligar al usuario a cambiar la contraseña en el siguiente inicio de sesión
          </mat-checkbox>
        </ng-container>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="user" [disabled]="!isValid()">Guardar</button>
    </mat-dialog-actions>
  `
})
export class UserDialog {
  user: any;
  constructor(
    public dialogRef: MatDialogRef<UserDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.user = { ...data.user };
    if (!this.data.isEdit) {
      this.user.forcePasswordChange = true;
    }
  }

  isValid() {
    if (!this.data.isEdit) {
      if (!this.user.username || !this.user.password) return false;
    }
    return !!this.user.firstName && !!this.user.lastName;
  }
}
