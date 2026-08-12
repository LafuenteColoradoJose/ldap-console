import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  template: `
    <div class="dashboard-container">
      <h1>Bienvenido al Dashboard</h1>
      <p>Has iniciado sesión correctamente. Esta página está protegida por AuthGuard.</p>
    </div>
  `,
  styles: `
    .dashboard-container {
      padding: 24px;
    }
  `
})
export class Dashboard {
}
