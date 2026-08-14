import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgApexchartsModule, ApexChart, ApexNonAxisChartSeries, ApexPlotOptions, ApexFill, ApexLegend, ApexDataLabels, ApexStroke, ApexTooltip } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';

export type RadialChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  colors: string[];
};

export type DonutChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, NgApexchartsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  loading = signal(true);
  stats = signal<DashboardStats | null>(null);

  // Users chart options computed from stats
  usersChartOptions = computed<RadialChartOptions>(() => {
    const s = this.stats();
    const pct = this.getPercentage(s?.users?.online, s?.users?.total);
    return this.createRadialChartOptions([pct], ['Conectados'], ['#00e676']); // Neon green
  });

  // Computers chart options computed from stats
  computersChartOptions = computed<RadialChartOptions>(() => {
    const s = this.stats();
    const pct = this.getPercentage(s?.computers?.online, s?.computers?.total);
    return this.createRadialChartOptions([pct], ['Encendidos'], ['#00b0ff']); // Neon blue
  });

  // OS Distribution Chart
  osChartOptions = computed<DonutChartOptions>(() => {
    const s = this.stats();
    const osStats = s?.computers?.osStats || {};
    const labels = Object.keys(osStats);
    const series = Object.values(osStats) as number[];

    return {
      series: series.length ? series : [1],
      labels: labels.length ? labels : ['Sin datos'],
      chart: {
        type: 'donut',
        height: 280,
        background: 'transparent',
        fontFamily: 'Inter, sans-serif'
      },
      colors: ['#00e676', '#00b0ff', '#f50057', '#ffea00', '#d500f9'],
      stroke: { show: true, colors: ['rgba(0,0,0,0.2)'], width: 2 },
      dataLabels: { enabled: false },
      legend: {
        position: 'bottom',
        labels: { colors: 'var(--text-color, #e0e0e0)' }
      },
      tooltip: { theme: 'dark' }
    };
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

  formatDate(timestamp: number): string {
    if (!timestamp || timestamp === 0) return 'Nunca';
    return new Date(timestamp).toLocaleString();
  }

  private createRadialChartOptions(series: number[], labels: string[], colors: string[]): RadialChartOptions {
    return {
      series,
      chart: {
        height: 120,
        type: 'radialBar',
        sparkline: { enabled: true }
      },
      colors,
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: {
            background: 'rgba(255, 255, 255, 0.05)',
            margin: 5
          },
          dataLabels: {
            name: { show: false },
            value: {
              offsetY: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: colors[0],
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
          gradientToColors: [colors[0] + 'aa'],
          stops: [0, 100]
        }
      },
      labels
    };
  }
}
