import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComputerService, Computer } from '../../core/services/computer.service';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DeployDialog } from './deploy-dialog';
import { TelemetryService } from '../../core/services/telemetry.service';

@Component({
  selector: 'app-machines',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule, MatDialogModule, MatSnackBarModule],
  providers: [DatePipe],
  templateUrl: './machines.html',
  styleUrl: './machines.scss'
})
export class Machines implements OnInit {
  private computerService = inject(ComputerService);
  private datePipe = inject(DatePipe);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private telemetryService = inject(TelemetryService);

  computers: Computer[] = [];
  loading = true;
  displayedColumns: string[] = ['name', 'os', 'dns', 'created', 'actions'];

  ngOnInit() {
    this.fetchComputers();
  }

  fetchComputers() {
    this.loading = true;
    this.computerService.getAllComputers().subscribe({
      next: (data) => {
        this.computers = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching computers:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(ldapDate: string): string {
    if (!ldapDate) return 'Desconocida';
    // Format: YYYYMMDDHHMMSS.0Z
    const year = ldapDate.substring(0, 4);
    const month = ldapDate.substring(4, 6);
    const day = ldapDate.substring(6, 8);
    return `${day}/${month}/${year}`;
  }

  openDeployDialog(computer: Computer) {
    // Basic check for linux by looking at operatingSystem field if present, but since we don't have it explicitly guaranteed, let's just let the user try.
    // However, the user knows it's for Linux.
    const host = computer.dNSHostName || computer.cn;
    
    const dialogRef = this.dialog.open(DeployDialog, {
      width: '400px',
      data: { host }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open(`Desplegando telemetría en ${result.host}...`, '', { duration: 2000 });
        
        this.telemetryService.deployLinux(result.host, result.username, result.password)
          .subscribe({
            next: (res) => {
              this.snackBar.open(`¡Despliegue exitoso en ${result.host}!`, 'Cerrar', { duration: 5000, panelClass: ['success-snackbar'] });
            },
            error: (err) => {
              console.error('Error deploying:', err);
              this.snackBar.open(`Error: ${err.error?.error || err.message}`, 'Cerrar', { duration: 7000, panelClass: ['error-snackbar'] });
            }
          });
      }
    });
  }
}
