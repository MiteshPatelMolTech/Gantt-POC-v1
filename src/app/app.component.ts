import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GanttChartComponent } from './gantt';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GanttChartComponent],
  template: `
    <div class="app-shell">
      <header class="app-header">
        <h1>Gantt Projectplanning</h1>
        <p>Volledig dynamische Gantt chart — geen vaste velden, geen vaste fasen</p>
      </header>
      <main class="app-main">
        <app-gantt-chart></app-gantt-chart>
      </main>
    </div>
  `,
  styles: [`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .app-shell {
      min-height: 100vh;
      background: #f7f6f2;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .app-header {
      padding: 20px 24px 14px;
      border-bottom: 1px solid #e0dfd8;
      background: #fff;
    }
    .app-header h1 {
      font-size: 20px; font-weight: 500; color: #1a1a18; margin-bottom: 4px;
    }
    .app-header p { font-size: 12px; color: #8a8a84; }
    .app-main { padding: 20px 24px; max-width: 1800px; }
  `]
})
export class AppComponent {}
