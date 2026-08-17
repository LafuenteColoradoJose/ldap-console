import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/telemetry';

  deployLinux(host: string, username: string, password?: string, privateKey?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/deploy-linux`, {
      host,
      username,
      password,
      privateKey
    });
  }
}
