import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/groups';

  // Vamos a usar la ruta getAllGroups que añadimos en el backend
  getAllGroups(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getGroup(name: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${name}`).pipe(
      map(response => response.data)
    );
  }

  createGroup(name: string, description: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { name, description });
  }

  updateGroup(name: string, description: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${name}`, { description });
  }

  deleteGroup(name: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${name}`);
  }
}
