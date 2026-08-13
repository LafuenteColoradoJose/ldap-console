import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/users';

  getAllUsers(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getUser(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${username}`).pipe(
      map(response => response.data)
    );
  }

  createUser(username: string, firstName: string, lastName: string, email: string, password?: string, forcePasswordChange: boolean = true): Observable<any> {
    return this.http.post<any>(this.apiUrl, { username, firstName, lastName, email, password, forcePasswordChange });
  }

  updateUser(cn: string, data: { firstName?: string, lastName?: string, email?: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${cn}`, data);
  }

  toggleUserStatus(cn: string, enable: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${cn}/status`, { enable });
  }

  deleteUser(cn: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${cn}`);
  }
}
