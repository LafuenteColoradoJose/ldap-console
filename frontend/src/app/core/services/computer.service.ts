import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Computer {
  dn: string;
  cn: string;
  dNSHostName: string;
  operatingSystem: string;
  operatingSystemVersion: string;
  whenCreated: string;
  isOnline: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ComputerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/computers';

  getAllComputers(): Observable<Computer[]> {
    return this.http.get<Computer[]>(this.apiUrl);
  }
}
