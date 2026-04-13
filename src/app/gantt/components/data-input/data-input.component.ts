import {
  Component, OnInit, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DEFAULT_PHASES_JSON,
  DEFAULT_PROJECTS_JSON
} from '../../services/gantt-state.service';

export interface DataInputEvent {
  phasesJson: string;
  projectsJson: string;
}

@Component({
  selector: 'app-data-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="data-input-panel">
      <div class="panel-header">
        <span class="panel-title">Data Configuratie</span>
        <span class="panel-hint">Bewerk de JSON en klik op "Genereer Gantt" om de chart bij te werken</span>
        <div class="panel-actions">
          <button class="btn-reset" (click)="onReset()">Herstel standaard</button>
          <button class="btn-generate" (click)="onGenerate()">&#9654; Genereer Gantt</button>
        </div>
      </div>

      <div class="textareas-wrap">
        <!-- PHASES textarea -->
        <div class="textarea-block">
          <div class="ta-label-row">
            <span class="ta-label">Fase Definities</span>
            <span class="ta-hint">JSON array — elk object heeft: <code>key</code>, <code>label</code>, <code>color</code></span>
          </div>
          <div class="ta-schema">
            <code>[ &#123; "key": "uitv", "label": "Uitvoering", "color": "#4A9E4A" &#125;, ... ]</code>
          </div>
          <div class="ta-wrap" [class.error]="phasesError">
            <textarea
              [(ngModel)]="phasesJson"
              (ngModelChange)="onPhasesChange()"
              spellcheck="false"
              class="json-textarea"
              placeholder='[ { "key": "uitv", "label": "Uitvoering", "color": "#4A9E4A" } ]'
            ></textarea>
            <div class="char-count">{{ phasesJson.length }} tekens</div>
          </div>
          <div class="validation-msg error-msg" *ngIf="phasesError">
            <span class="msg-icon">&#9888;</span> {{ phasesError }}
          </div>
          <div class="validation-msg ok-msg" *ngIf="!phasesError && phasesOk">
            <span class="msg-icon">&#10003;</span> Geldig JSON — {{ phaseCount }} fase(n) gevonden
          </div>
        </div>

        <!-- PROJECTS textarea -->
        <div class="textarea-block">
          <div class="ta-label-row">
            <span class="ta-label">Project Data</span>
            <span class="ta-hint">JSON array — vrije velden + <code>_phases</code> array + optioneel <code>_rowColor</code></span>
          </div>
          <div class="ta-schema">
            <code>[ &#123; "veld1": "...", "_rowColor": "#fff", "_phases": [ &#123; "phaseKey": "uitv", "startWeek": 1, "endWeek": 10 &#125; ] &#125; ]</code>
          </div>
          <div class="ta-wrap" [class.error]="projectsError">
            <textarea
              [(ngModel)]="projectsJson"
              (ngModelChange)="onProjectsChange()"
              spellcheck="false"
              class="json-textarea projects-ta"
              placeholder='[ { "veld": "waarde", "_phases": [ { "phaseKey": "uitv", "startWeek": 1, "endWeek": 10 } ] } ]'
            ></textarea>
            <div class="char-count">{{ projectsJson.length }} tekens</div>
          </div>
          <div class="validation-msg error-msg" *ngIf="projectsError">
            <span class="msg-icon">&#9888;</span> {{ projectsError }}
          </div>
          <div class="validation-msg ok-msg" *ngIf="!projectsError && projectsOk">
            <span class="msg-icon">&#10003;</span> Geldig JSON — {{ projectCount }} project(en), {{ columnCount }} kolom(men)
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .data-input-panel {
      background: #fafaf8;
      border: 1px solid #e0dfd8;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .panel-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #f0efe8;
      border-bottom: 1px solid #e0dfd8;
      flex-wrap: wrap;
    }
    .panel-title {
      font-size: 13px;
      font-weight: 500;
      color: #1a1a18;
      white-space: nowrap;
    }
    .panel-hint {
      font-size: 11px;
      color: #8a8a84;
      flex: 1;
    }
    .panel-actions { display: flex; gap: 8px; flex-shrink: 0; }
    .btn-reset {
      font-size: 12px; padding: 6px 12px;
      border-radius: 6px; border: 1px solid #d0cfc8;
      background: transparent; color: #4a4a46; cursor: pointer;
    }
    .btn-reset:hover { background: #e8e7e0; }
    .btn-generate {
      font-size: 12px; padding: 6px 16px;
      border-radius: 6px; border: none;
      background: #185FA5; color: #fff; cursor: pointer;
      font-weight: 500;
    }
    .btn-generate:hover { background: #0c447c; }

    .textareas-wrap {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 0;
    }
    .textarea-block {
      display: flex;
      flex-direction: column;
      padding: 14px 16px;
      border-right: 1px solid #e0dfd8;
    }
    .textarea-block:last-child { border-right: none; }

    .ta-label-row {
      display: flex;
      align-items: baseline;
      gap: 10px;
      margin-bottom: 6px;
      flex-wrap: wrap;
    }
    .ta-label {
      font-size: 12px; font-weight: 500; color: #1a1a18;
    }
    .ta-hint {
      font-size: 11px; color: #8a8a84;
    }
    .ta-schema {
      font-size: 10px; background: #f0efe8;
      border: 1px solid #e0dfd8; border-radius: 4px;
      padding: 5px 8px; margin-bottom: 8px;
      overflow-x: auto; white-space: nowrap;
    }
    code { font-family: 'Courier New', monospace; color: #185FA5; font-size: 10px; }
    .ta-wrap {
      position: relative;
      flex: 1;
    }
    .ta-wrap.error .json-textarea { border-color: #e24b4a; }
    .json-textarea {
      width: 100%;
      height: 220px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      line-height: 1.6;
      padding: 10px 12px;
      border-radius: 6px;
      border: 1px solid #d0cfc8;
      background: #fff;
      color: #1a1a18;
      resize: vertical;
      box-sizing: border-box;
      tab-size: 2;
    }
    .json-textarea:focus { outline: none; border-color: #185FA5; }
    .projects-ta { height: 220px; }
    .char-count {
      position: absolute;
      bottom: 6px; right: 10px;
      font-size: 10px; color: #b0b0aa;
      pointer-events: none;
    }
    .validation-msg {
      display: flex; align-items: center; gap: 5px;
      font-size: 11px; margin-top: 6px; padding: 5px 8px;
      border-radius: 4px;
    }
    .error-msg { background: #fcebeb; color: #a32d2d; border: 1px solid #f7c1c1; }
    .ok-msg    { background: #eaf3de; color: #3b6d11; border: 1px solid #c0dd97; }
    .msg-icon  { font-size: 12px; }

    @media (max-width: 800px) {
      .textareas-wrap { grid-template-columns: 1fr; }
      .textarea-block { border-right: none; border-bottom: 1px solid #e0dfd8; }
    }
  `]
})
export class DataInputComponent implements OnInit {
  @Output() generate = new EventEmitter<DataInputEvent>();

  phasesJson = '';
  projectsJson = '';

  phasesError = '';
  projectsError = '';
  phasesOk = false;
  projectsOk = false;
  phaseCount = 0;
  projectCount = 0;
  columnCount = 0;

  ngOnInit(): void {
    this.phasesJson = DEFAULT_PHASES_JSON;
    this.projectsJson = DEFAULT_PROJECTS_JSON;
    this.validatePhases();
    this.validateProjects();
  }

  onPhasesChange(): void {
    this.validatePhases();
  }

  onProjectsChange(): void {
    this.validateProjects();
  }

  validatePhases(): void {
    this.phasesError = '';
    this.phasesOk = false;
    if (!this.phasesJson.trim()) { this.phasesError = 'Leeg veld'; return; }
    try {
      const arr = JSON.parse(this.phasesJson);
      if (!Array.isArray(arr)) { this.phasesError = 'Moet een JSON array zijn [ ... ]'; return; }
      const missing = arr.findIndex((x: any) => !x.key || !x.label || !x.color);
      if (missing >= 0) { this.phasesError = `Item [${missing}] mist "key", "label" of "color"`; return; }
      this.phaseCount = arr.length;
      this.phasesOk = true;
    } catch (e: any) {
      this.phasesError = `JSON fout: ${e.message}`;
    }
  }

  validateProjects(): void {
    this.projectsError = '';
    this.projectsOk = false;
    if (!this.projectsJson.trim()) { this.projectsError = 'Leeg veld'; return; }
    try {
      const arr = JSON.parse(this.projectsJson);
      if (!Array.isArray(arr)) { this.projectsError = 'Moet een JSON array zijn [ ... ]'; return; }
      this.projectCount = arr.length;
      // Count unique non-reserved keys
      const keys = new Set<string>();
      arr.forEach((item: any) => Object.keys(item).filter(k => !k.startsWith('_')).forEach(k => keys.add(k)));
      this.columnCount = keys.size;
      this.projectsOk = true;
    } catch (e: any) {
      this.projectsError = `JSON fout: ${e.message}`;
    }
  }

  onGenerate(): void {
    this.validatePhases();
    this.validateProjects();
    if (this.phasesError || this.projectsError) return;
    this.generate.emit({ phasesJson: this.phasesJson, projectsJson: this.projectsJson });
  }

  onReset(): void {
    this.phasesJson = DEFAULT_PHASES_JSON;
    this.projectsJson = DEFAULT_PROJECTS_JSON;
    this.validatePhases();
    this.validateProjects();
    this.generate.emit({ phasesJson: this.phasesJson, projectsJson: this.projectsJson });
  }
}
