import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComputerService, Computer } from '../../core/services/computer.service';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-machines',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  providers: [DatePipe],
  templateUrl: './machines.html',
  styleUrl: './machines.scss'
})
export class Machines implements OnInit {
  private computerService = inject(ComputerService);
  private datePipe = inject(DatePipe);
  private cdr = inject(ChangeDetectorRef);

  computers: Computer[] = [];
  loading = true;
  displayedColumns: string[] = ['status', 'name', 'os', 'dns', 'created'];

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
}
