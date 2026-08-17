import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface DeployDialogData {
  host: string;
}

@Component({
  selector: 'app-deploy-dialog',
  templateUrl: './deploy-dialog.html',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ]
})
export class DeployDialog {
  host = '';
  username = '';
  password = '';

  constructor(
    public dialogRef: MatDialogRef<DeployDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DeployDialogData
  ) {
    this.host = data.host;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onDeploy(): void {
    this.dialogRef.close({
      host: this.host,
      username: this.username,
      password: this.password
    });
  }
}
