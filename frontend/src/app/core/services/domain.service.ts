import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DomainService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/domain';

  getDomainInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/info`).pipe(
      map(response => response.data)
    );
  }

  getDomainStructure(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/structure`).pipe(
      map(response => response.data)
    );
  }
}
