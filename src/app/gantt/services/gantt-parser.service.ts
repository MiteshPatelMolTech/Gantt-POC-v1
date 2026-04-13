import { Injectable } from '@angular/core';
import {
  GanttConfig, GanttProject, PhaseDefinition, PhaseSegment,
  DEFAULT_COL_WIDTH, MONTHS_SHORT
} from '../models/gantt.model';

export interface ParseResult {
  config: GanttConfig | null;
  errors: string[];
}

/**
 * PHASES textarea format (JSON array):
 * [
 *   { "key": "schet", "label": "Schetsontwerp",  "color": "#A8D8F0" },
 *   { "key": "uitv",  "label": "Uitvoering",      "color": "#4A9E4A" }
 * ]
 *
 * PROJECTS textarea format (JSON array):
 * Every object can have any fields. Reserved fields (prefixed _):
 *   _rowColor  : optional CSS color for row background
 *   _phases    : array of { phaseKey, startWeek, endWeek }
 *
 * Example:
 * [
 *   {
 *     "nr": "980065-0012",
 *     "engineering": "251008",
 *     "projectId": "D.26984",
 *     "tranche": "TR1",
 *     "description": "NV26 MHT TR01 HS OSS",
 *     "_rowColor": "#FAEEDA",
 *     "_phases": [
 *       { "phaseKey": "afr",  "startWeek": 10, "endWeek": 12 },
 *       { "phaseKey": "uitv", "startWeek": 13, "endWeek": 28 }
 *     ]
 *   }
 * ]
 */
@Injectable({ providedIn: 'root' })
export class GanttParserService {

  parsePhases(raw: string): { defs: PhaseDefinition[]; errors: string[] } {
    const errors: string[] = [];
    if (!raw.trim()) return { defs: [], errors: ['Phases textarea is empty.'] };

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (e: any) {
      return { defs: [], errors: [`Phases JSON parse error: ${e.message}`] };
    }

    if (!Array.isArray(parsed)) {
      return { defs: [], errors: ['Phases must be a JSON array [ ... ]'] };
    }

    const defs: PhaseDefinition[] = [];
    parsed.forEach((item: any, i: number) => {
      if (!item.key)   errors.push(`Phase[${i}]: missing "key"`);
      if (!item.label) errors.push(`Phase[${i}]: missing "label"`);
      if (!item.color) errors.push(`Phase[${i}]: missing "color"`);
      if (item.key && item.label && item.color) {
        defs.push({ key: item.key, label: item.label, color: item.color });
      }
    });

    return { defs, errors };
  }

  parseProjects(raw: string, phaseDefs: PhaseDefinition[]): { projects: GanttProject[]; columnKeys: string[]; columnWidths: Record<string, number>; errors: string[] } {
    const errors: string[] = [];
    const phaseKeySet = new Set(phaseDefs.map(p => p.key));

    if (!raw.trim()) return { projects: [], columnKeys: [], columnWidths: {}, errors: ['Projects textarea is empty.'] };

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (e: any) {
      return { projects: [], columnKeys: [], columnWidths: {}, errors: [`Projects JSON parse error: ${e.message}`] };
    }

    if (!Array.isArray(parsed)) {
      return { projects: [], columnKeys: [], columnWidths: {}, errors: ['Projects must be a JSON array [ ... ]'] };
    }

    // Discover all column keys (non-reserved) across all rows
    const colKeySet = new LinkedKeySet();
    parsed.forEach((item: any) => {
      Object.keys(item).forEach(k => {
        if (!k.startsWith('_')) colKeySet.add(k);
      });
    });

    const columnKeys = colKeySet.toArray();

    // Build column widths: estimate from key name length, min 80px
    const columnWidths: Record<string, number> = {};
    columnKeys.forEach(k => {
      columnWidths[k] = Math.max(80, Math.min(300, k.length * 9 + 40));
    });

    // Parse projects
    const projects: GanttProject[] = parsed.map((item: any, i: number) => {
      const phases: PhaseSegment[] = [];

      if (item._phases && Array.isArray(item._phases)) {
        item._phases.forEach((ph: any, j: number) => {
          if (!ph.phaseKey) {
            errors.push(`Project[${i}]._phases[${j}]: missing "phaseKey"`);
            return;
          }
          if (!phaseKeySet.has(ph.phaseKey)) {
            errors.push(`Project[${i}]._phases[${j}]: phaseKey "${ph.phaseKey}" not defined in phases`);
          }
          if (!ph.startWeek || !ph.endWeek) {
            errors.push(`Project[${i}]._phases[${j}]: missing startWeek or endWeek`);
            return;
          }
          phases.push({
            phaseKey: ph.phaseKey,
            startWeek: Number(ph.startWeek),
            endWeek: Number(ph.endWeek)
          });
        });
      }

      const project: GanttProject = { _id: i + 1, _phases: phases };
      if (item._rowColor) project._rowColor = item._rowColor;

      columnKeys.forEach(k => {
        project[k] = item[k] !== undefined ? String(item[k]) : '';
      });

      return project;
    });

    return { projects, columnKeys, columnWidths, errors };
  }

  parse(phasesRaw: string, projectsRaw: string): ParseResult {
    const { defs, errors: phaseErrors } = this.parsePhases(phasesRaw);
    const { projects, columnKeys, columnWidths, errors: projErrors } = this.parseProjects(projectsRaw, defs);

    const allErrors = [...phaseErrors, ...projErrors];

    if (defs.length === 0 || projects.length === 0) {
      return { config: null, errors: allErrors };
    }

    return {
      config: { phaseDefinitions: defs, projects, columnKeys, columnWidths },
      errors: allErrors
    };
  }
}

/** Insertion-order-preserving key set */
class LinkedKeySet {
  private map = new Map<string, true>();
  add(k: string) { this.map.set(k, true); }
  toArray() { return Array.from(this.map.keys()); }
}
