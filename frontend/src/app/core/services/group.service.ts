import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/groups';

  // Nota: El backend actualmente solo expone 'GET /api/groups/:name'. 
  // Para la vista de lista de grupos necesitaremos un 'GET /api/groups' 
  // Vamos a usar una ruta ficticia o añadirla al backend si no existe.
  // Por ahora, asumamos que añadiremos un listado en el backend o usamos la estructura del dominio.
  
  getGroup(name: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${name}`).pipe(
      map(response => response.data)
    );
  }

  createGroup(name: string, description: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { name, description });
  }

  deleteGroup(name: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${name}`);
  }
}
