import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';

export interface User {
  username: string;
}

export interface AuthResponse {
  status: string;
  token?: string;
  user?: User;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  // Estado ultra-reactivo con Signals
  private currentUserSignal = signal<User | null>(null);
  
  // Propiedad pública de solo lectura para acceder al usuario
  readonly currentUser = this.currentUserSignal.asReadonly();
  
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient, private router: Router) {
    this.checkInitialAuth();
  }

  /**
   * Intenta loguear al usuario contra el backend y guarda el JWT
   */
  login(username: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(response => {
        if (response.status === 'success' && response.token && response.user) {
          localStorage.setItem('ldap_token', response.token);
          localStorage.setItem('ldap_user', JSON.stringify(response.user));
          this.currentUserSignal.set(response.user);
        }
      }),
      map(response => response.status === 'success'),
      catchError(() => of(false)) // Si da error (401), devuelve false en vez de romper el flujo
    );
  }

  /**
   * Cierra sesión borrando tokens y reseteando el signal
   */
  logout(): void {
    localStorage.removeItem('ldap_token');
    localStorage.removeItem('ldap_user');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Verifica si hay un token válido y restaura el estado
   */
  private checkInitialAuth(): void {
    const token = localStorage.getItem('ldap_token');
    const userStr = localStorage.getItem('ldap_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUserSignal.set(user);
      } catch (e) {
        this.logout();
      }
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('ldap_token');
  }
}
