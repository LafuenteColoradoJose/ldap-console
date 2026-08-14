import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  stats: DashboardStats | null = null;

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    this.dashboardService.getStats().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.stats = response.data;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching stats', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getPercentage(online: number | undefined, total: number | undefined): number {
    if (!total || total === 0) return 0;
    return Math.round(((online || 0) / total) * 100);
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
