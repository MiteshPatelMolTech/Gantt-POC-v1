import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeekCell, MonthGroup, GanttConfig, WEEK_WIDTH } from '../../models/gantt.model';
import { WeekHelperService } from '../../services/week-helper.service';

@Component({
  selector: 'app-gantt-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="header-root">
      <!-- Left: dynamic column headers -->
      <div class="left-headers" [style.width.px]="totalLeftWidth" [style.minWidth.px]="totalLeftWidth">
        <div
          *ngFor="let col of config?.columnKeys"
          class="left-hdr-cell"
          [style.minWidth.px]="config?.columnWidths[col] || 100"
          [style.maxWidth.px]="config?.columnWidths[col] || 100"
          [title]="col"
        >{{ col }}</div>
      </div>

      <!-- Right: year / month / week rows -->
      <div class="right-headers">
        <!-- Year row -->
        <div class="hdr-row year-row">
          <div class="year-cell" [style.width.px]="totalWeeks * weekWidth">{{ year }}</div>
        </div>
        <!-- Month row -->
        <div class="hdr-row month-row">
          <div
            *ngFor="let mg of monthGroups"
            class="month-cell"
            [style.width.px]="mg.weekCount * weekWidth"
          >{{ mg.label }}</div>
        </div>
        <!-- Week row -->
        <div class="hdr-row week-row">
          <div
            *ngFor="let cell of weekCells"
            class="week-cell"
            [class.today]="cell.isToday"
            [style.width.px]="weekWidth"
          >{{ cell.week }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-root {
      display: flex;
      position: sticky;
      top: 0;
      z-index: 20;
      background: #f5f5f3;
      border-bottom: 1px solid #e0dfd8;
      flex-shrink: 0;
    }
    .left-headers {
      display: flex;
      flex-shrink: 0;
      border-right: 2px solid #c8c7c0;
      background: #f0efe8;
    }
    .left-hdr-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 56px;
      font-size: 11px;
      font-weight: 500;
      color: #4a4a46;
      border-right: 1px solid #e0dfd8;
      padding: 0 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex-shrink: 0;
      text-align: center;
    }
    .left-hdr-cell:last-child { border-right: none; }
    .right-headers { display: flex; flex-direction: column; }
    .hdr-row { display: flex; border-bottom: 1px solid #e0dfd8; }
    .hdr-row:last-child { border-bottom: none; }
    .year-cell {
      display: flex; align-items: center; justify-content: center;
      height: 22px; font-size: 12px; font-weight: 500; color: #4a4a46;
      border-right: 1px solid #e0dfd8; flex-shrink: 0;
    }
    .month-cell {
      display: flex; align-items: center; justify-content: center;
      height: 18px; font-size: 10px; color: #8a8a84;
      border-right: 1px solid #e0dfd8; flex-shrink: 0; overflow: hidden;
    }
    .week-cell {
      display: flex; align-items: center; justify-content: center;
      height: 16px; font-size: 9px; color: #b0b0aa;
      border-right: 1px solid #e0dfd8; flex-shrink: 0;
    }
    .week-cell.today {
      background: rgba(24,95,165,0.15);
      font-weight: 700; color: #185FA5;
    }
  `]
})
export class GanttHeaderComponent implements OnChanges {
  @Input() config: GanttConfig | null = null;
  @Input() year = 2026;
  weekWidth = WEEK_WIDTH;

  weekCells: WeekCell[] = [];
  monthGroups: MonthGroup[] = [];
  totalWeeks = 52;
  totalLeftWidth = 0;

  constructor(private weekHelper: WeekHelperService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.rebuild();
  }

  private rebuild(): void {
    this.totalWeeks = this.weekHelper.getWeeksInYear(this.year);
    this.weekCells = this.weekHelper.buildWeekCells(this.year);
    this.monthGroups = this.weekHelper.buildMonthGroups(this.weekCells);
    this.totalLeftWidth = this.config
      ? this.config.columnKeys.reduce((sum, k) => sum + (this.config!.columnWidths[k] || 100), 0)
      : 0;
  }
}
