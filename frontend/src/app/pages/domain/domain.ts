import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainService } from '../../core/services/domain.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-domain',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './domain.html',
  styleUrl: './domain.scss'
})
export class Domain implements OnInit {
  private domainService = inject(DomainService);
  
  domainInfo: any = null;
  domainStructure: any[] = [];
  loading = true;

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    // Podríamos usar forkJoin, pero para mantenerlo simple hacemos dos llamadas
    this.domainService.getDomainInfo().subscribe({
      next: (info) => {
        this.domainInfo = info;
        this.checkLoading();
      },
      error: (err) => {
        console.error('Error info:', err);
        this.checkLoading();
      }
    });

    this.domainService.getDomainStructure().subscribe({
      next: (structure) => {
        this.domainStructure = structure;
        this.checkLoading();
      },
      error: (err) => {
        console.error('Error structure:', err);
        this.checkLoading();
      }
    });
  }

  checkLoading() {
    if (this.domainInfo && this.domainStructure.length > 0) {
      this.loading = false;
    }
  }

  getIconForClass(entry: any): string {
    const classes = entry.attributes?.find((a: any) => a.type === 'objectClass')?.values || [];
    if (classes.includes('organizationalUnit')) return 'folder';
    if (classes.includes('container')) return 'inventory_2';
    return 'folder_open';
  }

  getName(entry: any): string {
    const nameAttr = entry.attributes?.find((a: any) => a.type === 'name');
    return nameAttr ? nameAttr.values[0] : entry.objectName;
  }
}
