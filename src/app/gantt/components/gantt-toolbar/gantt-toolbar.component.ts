import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gantt-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toolbar">
      <div class="toolbar-left">
        <label class="lbl">Jaar:</label>
        <input
          type="number"
          class="year-input"
          [ngModel]="year"
          (ngModelChange)="yearChange.emit($event)"
          min="2020" max="2040"
        />
        <span class="info-badge" *ngIf="projectCount > 0">
          {{ projectCount }} projecten &middot; {{ columnCount }} kolommen &middot; {{ phaseTypeCount }} fasetypen
        </span>
      </div>
      <div class="toolbar-right">
        <button class="btn-today" (click)="scrollToToday.emit()">&#8594; Vandaag</button>
      </div>
    </div>
  `,
  styles: [`
    .toolbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 14px; background: #f0efe8;
      border-bottom: 1px solid #e0dfd8; flex-wrap: wrap; gap: 8px;
    }
    .toolbar-left, .toolbar-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .lbl { font-size: 12px; color: #6b6b67; }
    .year-input {
      width: 80px; font-size: 12px; padding: 5px 8px;
      border-radius: 6px; border: 1px solid #d0cfc8;
      background: #fff; color: #1a1a18;
    }
    .info-badge {
      font-size: 11px; color: #6b6b67;
      background: #e8e7e0; border-radius: 4px; padding: 3px 8px;
    }
    .btn-today {
      font-size: 12px; padding: 6px 14px;
      border-radius: 6px; border: none;
      background: #185FA5; color: #fff; cursor: pointer;
    }
    .btn-today:hover { background: #0c447c; }
  `]
})
export class GanttToolbarComponent {
  @Input() year = 2026;
  @Input() projectCount = 0;
  @Input() columnCount = 0;
  @Input() phaseTypeCount = 0;
  @Output() yearChange = new EventEmitter<number>();
  @Output() scrollToToday = new EventEmitter<void>();
}
