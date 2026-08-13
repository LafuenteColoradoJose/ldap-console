import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainService } from '../../core/services/domain.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-domain',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './domain.html',
  styleUrl: './domain.scss'
})
export class Domain implements OnInit {
  private domainService = inject(DomainService);
  private cdr = inject(ChangeDetectorRef);
  
  domainInfo: any = null;
  domainStructure: any[] = [];
  loading = true;

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.loading = true;
    forkJoin({
      info: this.domainService.getDomainInfo(),
      structure: this.domainService.getDomainStructure()
    }).subscribe({
      next: (result) => {
        this.domainInfo = result.info;
        this.domainStructure = result.structure || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching domain data:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getIconForClass(entry: any): string {
    const classes = entry.attributes?.find((a: any) => a.type === 'objectClass')?.values || [];
    if (classes.includes('organizationalUnit')) return 'folder';
    if (classes.includes('container')) return 'inventory_2';
    return 'folder_open';
  }

  getName(entry: any): string {
    const nameAttr = entry.attributes?.find((a: any) => a.type === 'name');
    return nameAttr && nameAttr.values ? nameAttr.values[0] : entry.objectName;
  }
}
