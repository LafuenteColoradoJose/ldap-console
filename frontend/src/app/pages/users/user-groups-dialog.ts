import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-user-groups-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatListModule],
  template: `
    <h2 mat-dialog-title>Grupos de {{ data.userName }}</h2>
    <mat-dialog-content>
      <div style="min-width: 400px; min-height: 200px;">
        <div *ngIf="data.groups.length === 0" style="text-align: center; padding: 2rem; color: #666;">
          Este usuario no pertenece a ningún grupo.
        </div>
        
        <mat-list *ngIf="data.groups.length > 0">
          <mat-list-item *ngFor="let group of data.groups">
            <mat-icon matListItemIcon color="accent">group_work</mat-icon>
            <div matListItemTitle>{{ group }}</div>
          </mat-list-item>
        </mat-list>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `
})
export class UserGroupsDialog {
  constructor(
    public dialogRef: MatDialogRef<UserGroupsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { userName: string, groups: string[] }
  ) {}
}
