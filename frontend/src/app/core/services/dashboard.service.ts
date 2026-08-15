import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  users: { 
    total: number; 
    active: number;
    disabled: number;
    recent?: { username: string, fullName: string, lastLogonTs: number }[];
  };
  groups: { total: number };
  ous: { total: number };
  computers: { 
    total: number; 
    online: number;
    osStats?: Record<string, number>;
  };
}

export interface DashboardStatsResponse {
  status: string;
  data: DashboardStats;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  getStats(): Observable<DashboardStatsResponse> {
    return this.http.get<DashboardStatsResponse>(`${this.apiUrl}/dashboard/stats`);
  }
}
