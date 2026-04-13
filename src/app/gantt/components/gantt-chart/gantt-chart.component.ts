import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GanttConfig, WeekCell, WEEK_WIDTH } from '../../models/gantt.model';
import { GanttStateService } from '../../services/gantt-state.service';
import { WeekHelperService } from '../../services/week-helper.service';
import { GanttParserService } from '../../services/gantt-parser.service';
import { GanttHeaderComponent } from '../gantt-header/gantt-header.component';
import { GanttRowComponent } from '../gantt-row/gantt-row.component';
import { GanttToolbarComponent } from '../gantt-toolbar/gantt-toolbar.component';
import { DataInputComponent } from '../data-input/data-input.component';

@Component({
  selector: 'app-gantt-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DataInputComponent,
    GanttToolbarComponent,
    GanttHeaderComponent,
    GanttRowComponent
  ],
  template: `
    <div class="page">

      <!-- Two-textarea data input panel -->
      <app-data-input (generate)="onGenerate($event)"></app-data-input>

      <!-- Error messages -->
      <div class="errors-panel" *ngIf="errors.length > 0">
        <div class="error-title">&#9888; Validatiefouten ({{ errors.length }})</div>
        <ul class="error-list">
          <li *ngFor="let e of errors">{{ e }}</li>
        </ul>
      </div>

      <!-- Empty state -->
      <div class="empty-state" *ngIf="!config">
        <div class="empty-icon">&#128200;</div>
        <div class="empty-title">Nog geen Gantt chart</div>
        <div class="empty-hint">Vul de twee JSON-velden hierboven in en klik op "Genereer Gantt"</div>
      </div>

      <!-- Gantt chart -->
      <div class="gantt-container" *ngIf="config">

        <!-- Toolbar -->
        <app-gantt-toolbar
          [year]="year"
          [projectCount]="config.projects.length"
          [columnCount]="config.columnKeys.length"
          [phaseTypeCount]="config.phaseDefinitions.length"
          (yearChange)="onYearChange($event)"
          (scrollToToday)="scrollToToday()"
        ></app-gantt-toolbar>

        <!-- Dynamic legend -->
        <div class="legend-bar">
          <div class="leg-item" *ngFor="let ph of config.phaseDefinitions">
            <div class="leg-swatch" [style.background]="ph.color"></div>
            <span>{{ ph.label }}</span>
          </div>
        </div>

        <!-- Scroll area -->
        <div class="gantt-scroll" #scrollArea>
          <div class="gantt-inner" [style.minWidth.px]="totalLeftWidth + totalWeeks * weekWidth">

            <!-- Sticky header -->
            <app-gantt-header
              [config]="config"
              [year]="year"
            ></app-gantt-header>

            <!-- Data rows -->
            <div class="rows-wrap">
              <app-gantt-row
                *ngFor="let project of config.projects; trackBy: trackById"
                [project]="project"
                [config]="config"
                [weekCells]="weekCells"
                [totalWeeks]="totalWeeks"
                [selected]="selectedId === project._id"
                (rowClick)="onRowClick($event)"
              ></app-gantt-row>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 0; }

    /* Errors */
    .errors-panel {
      margin-bottom: 12px; padding: 12px 16px;
      background: #fcebeb; border: 1px solid #f7c1c1;
      border-radius: 8px;
    }
    .error-title { font-size: 12px; font-weight: 500; color: #a32d2d; margin-bottom: 6px; }
    .error-list { margin: 0; padding-left: 18px; }
    .error-list li { font-size: 11px; color: #a32d2d; margin-bottom: 2px; }

    /* Empty */
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 48px 24px;
      border: 1px dashed #d0cfc8; border-radius: 10px;
      background: #fafaf8; text-align: center;
    }
    .empty-icon { font-size: 36px; margin-bottom: 12px; }
    .empty-title { font-size: 15px; font-weight: 500; color: #1a1a18; margin-bottom: 6px; }
    .empty-hint { font-size: 12px; color: #8a8a84; }

    /* Gantt container */
    .gantt-container {
      border: 1px solid #e0dfd8; border-radius: 10px;
      overflow: hidden; background: #fff;
    }

    /* Legend */
    .legend-bar {
      display: flex; align-items: center; gap: 16px;
      padding: 8px 14px; background: #fff;
      border-bottom: 1px solid #e0dfd8; flex-wrap: wrap;
    }
    .leg-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #6b6b67; }
    .leg-swatch { width: 18px; height: 10px; border-radius: 2px; flex-shrink: 0; }

    /* Scroll */
    .gantt-scroll { overflow: auto; max-height: 65vh; }
    .gantt-inner { display: flex; flex-direction: column; }
    .rows-wrap { display: flex; flex-direction: column; }
  `]
})
export class GanttChartComponent implements OnInit, OnDestroy {
  @ViewChild('scrollArea') scrollArea!: ElementRef<HTMLDivElement>;

  config: GanttConfig | null = null;
  year = new Date().getFullYear();
  weekCells: WeekCell[] = [];
  totalWeeks = 52;
  totalLeftWidth = 0;
  weekWidth = WEEK_WIDTH;
  selectedId: number | null = null;
  errors: string[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private state: GanttStateService,
    private weekHelper: WeekHelperService,
    private parser: GanttParserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    combineLatest([this.state.config$, this.state.year$, this.state.errors$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([config, year, errors]) => {
        this.config = config;
        this.year = year;
        this.errors = errors;
        this.rebuildTimeline();
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private rebuildTimeline(): void {
    this.totalWeeks = this.weekHelper.getWeeksInYear(this.year);
    this.weekCells = this.weekHelper.buildWeekCells(this.year);
    this.totalLeftWidth = this.config
      ? this.config.columnKeys.reduce((sum, k) => sum + (this.config!.columnWidths[k] || 100), 0)
      : 0;
  }

  onGenerate(event: { phasesJson: string; projectsJson: string }): void {
    const result = this.parser.parse(event.phasesJson, event.projectsJson);
    this.state.setConfig(result.config);
    this.state.setErrors(result.errors);
    this.selectedId = null;
  }

  onYearChange(year: number): void {
    this.state.setYear(year);
  }

  onRowClick(id: number): void {
    this.selectedId = this.selectedId === id ? null : id;
    this.cdr.markForCheck();
  }

  scrollToToday(): void {
    const todayWeek = this.weekHelper.getTodayWeek();
    const todayYear = this.weekHelper.getTodayISOYear();
    if (todayYear === this.year && this.scrollArea) {
      const offset = Math.max(0, (todayWeek - 3) * this.weekWidth + this.totalLeftWidth - 200);
      this.scrollArea.nativeElement.scrollTo({ left: offset, behavior: 'smooth' });
    }
  }

  trackById(_: number, project: any): number {
    return project._id;
  }
}
