import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgApexchartsModule, ApexChart, ApexNonAxisChartSeries, ApexPlotOptions, ApexFill } from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  colors: string[];
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule, MatProgressSpinnerModule, NgApexchartsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  loading = signal(true);
  stats = signal<DashboardStats | null>(null);

  // Users chart options computed from stats
  usersChartOptions = computed<ChartOptions>(() => {
    const s = this.stats();
    const pct = this.getPercentage(s?.users?.online, s?.users?.total);
    return this.createRadialChartOptions([pct], ['Conectados'], ['#3f51b5']);
  });

  // Computers chart options computed from stats
  computersChartOptions = computed<ChartOptions>(() => {
    const s = this.stats();
    const pct = this.getPercentage(s?.computers?.online, s?.computers?.total);
    return this.createRadialChartOptions([pct], ['Encendidos'], ['#ff4081']);
  });

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    this.loading.set(true);
    this.dashboardService.getStats().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.stats.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching stats', error);
        this.loading.set(false);
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

  private createRadialChartOptions(series: number[], labels: string[], colors: string[]): ChartOptions {
    return {
      series,
      chart: {
        height: 150,
        type: 'radialBar',
        sparkline: { enabled: true }
      },
      colors,
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: {
            background: 'rgba(255, 255, 255, 0.1)',
            margin: 5
          },
          dataLabels: {
            name: { show: false },
            value: {
              offsetY: 0,
              fontSize: '22px',
              fontWeight: 600,
              color: 'var(--text-color, #ffffff)',
              formatter: function (val) {
                return val + "%";
              }
            }
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'horizontal',
          gradientToColors: [colors[0] + '88'],
          stops: [0, 100]
        }
      },
      labels
    };
  }
}
