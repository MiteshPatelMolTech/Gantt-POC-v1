import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  GanttProject, GanttConfig, WeekCell, PhaseDefinition, WEEK_WIDTH, ROW_HEIGHT
} from '../../models/gantt.model';

interface RenderedBar {
  left: number;
  width: number;
  color: string;
  tooltip: string;
}

@Component({
  selector: 'app-gantt-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="row-wrap" [class.selected]="selected" (click)="rowClick.emit(project._id)">
      <!-- Left: dynamic data cells -->
      <div
        class="row-left"
        [style.background]="project._rowColor || null"
        [style.width.px]="totalLeftWidth"
        [style.minWidth.px]="totalLeftWidth"
      >
        <div
          *ngFor="let col of config.columnKeys"
          class="data-cell"
          [style.minWidth.px]="config.columnWidths[col] || 100"
          [style.maxWidth.px]="config.columnWidths[col] || 100"
          [title]="project[col]"
        >{{ project[col] }}</div>
      </div>

      <!-- Right: gantt bars area -->
      <div class="row-right" [style.width.px]="totalWeeks * weekWidth">
        <!-- Week background columns -->
        <div
          *ngFor="let cell of weekCells"
          class="week-bg"
          [class.today]="cell.isToday"
          [style.width.px]="weekWidth"
          [style.height.px]="rowHeight"
        ></div>
        <!-- Phase bars -->
        <div
          *ngFor="let bar of bars"
          class="phase-bar"
          [style.left.px]="bar.left"
          [style.width.px]="bar.width"
          [style.background]="bar.color"
          [title]="bar.tooltip"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .row-wrap {
      display: flex;
      border-bottom: 1px solid #e8e7e0;
      height: 32px;
      cursor: pointer;
    }
    .row-wrap:hover .row-left,
    .row-wrap:hover .row-right { filter: brightness(0.96); }
    .row-wrap.selected .row-left,
    .row-wrap.selected .row-right { box-shadow: inset 0 0 0 1px rgba(24,95,165,0.3); }

    .row-left {
      display: flex;
      align-items: stretch;
      border-right: 2px solid #c8c7c0;
      flex-shrink: 0;
      background: #fff;
    }
    .data-cell {
      display: flex;
      align-items: center;
      padding: 0 6px;
      font-size: 11px;
      color: #1a1a18;
      border-right: 1px solid #e8e7e0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-shrink: 0;
    }
    .data-cell:last-child { border-right: none; }

    .row-right {
      display: flex;
      align-items: center;
      position: relative;
      background: #fff;
      flex-shrink: 0;
    }
    .week-bg {
      flex-shrink: 0;
      border-right: 1px solid #f0efe8;
      height: 100%;
    }
    .week-bg.today { background: rgba(24,95,165,0.06); }

    .phase-bar {
      position: absolute;
      height: 18px;
      top: 7px;
      border-radius: 3px;
      pointer-events: none;
      opacity: 0.92;
    }
  `]
})
export class GanttRowComponent implements OnChanges {
  @Input() project!: GanttProject;
  @Input() config!: GanttConfig;
  @Input() weekCells: WeekCell[] = [];
  @Input() totalWeeks = 52;
  @Input() selected = false;
  @Output() rowClick = new EventEmitter<number>();

  weekWidth = WEEK_WIDTH;
  rowHeight = ROW_HEIGHT;
  bars: RenderedBar[] = [];
  totalLeftWidth = 0;

  ngOnChanges(changes: SimpleChanges): void {
    this.totalLeftWidth = this.config.columnKeys.reduce(
      (sum, k) => sum + (this.config.columnWidths[k] || 100), 0
    );
    this.buildBars();
  }

  private buildBars(): void {
    const phaseMap = new Map<string, PhaseDefinition>(
      this.config.phaseDefinitions.map(p => [p.key, p])
    );
    this.bars = (this.project._phases || []).map(seg => {
      const def = phaseMap.get(seg.phaseKey);
      const color = def ? def.color : '#cccccc';
      const label = def ? def.label : seg.phaseKey;
      return {
        left: (seg.startWeek - 1) * this.weekWidth,
        width: Math.max((seg.endWeek - seg.startWeek + 1) * this.weekWidth, 3),
        color,
        tooltip: `${label}: W${seg.startWeek}–W${seg.endWeek}`
      };
    });
  }
}
