/**
 * FULLY DYNAMIC GANTT MODELS
 * No fixed fields anywhere. Everything is driven by user input.
 */

/** A phase definition — user defines name, color, key */
export interface PhaseDefinition {
  key: string;       // unique identifier e.g. "uitv"
  label: string;     // display label e.g. "Uitvoering"
  color: string;     // any CSS color e.g. "#4A9E4A"
}

/**
 * A single phase segment on a project row.
 * phaseKey must match a PhaseDefinition.key
 */
export interface PhaseSegment {
  phaseKey: string;
  startWeek: number;
  endWeek: number;
}

/**
 * A project row — all fields except id/phases are fully dynamic key-value pairs.
 * The user defines which columns exist via the PROJECTS textarea.
 */
export interface GanttProject {
  _id: number;                        // internal row id
  _rowColor?: string;                 // optional row highlight color
  _phases: PhaseSegment[];            // phase bars
  [key: string]: any;                 // all other fields are dynamic
}

/** Parsed config from the two textareas */
export interface GanttConfig {
  phaseDefinitions: PhaseDefinition[];
  projects: GanttProject[];
  columnKeys: string[];               // ordered list of user-defined column keys
  columnWidths: Record<string, number>; // pixel width per column
}

/** Week cell for header rendering */
export interface WeekCell {
  week: number;
  year: number;
  isToday: boolean;
  monthIndex: number;
}

export interface MonthGroup {
  label: string;
  weekCount: number;
}

export const MONTHS_SHORT = [
  'Jan','Feb','Mrt','Apr','Mei','Jun',
  'Jul','Aug','Sep','Okt','Nov','Dec'
];

/** Default column width if not specified */
export const DEFAULT_COL_WIDTH = 120;
export const WEEK_WIDTH = 22;
export const ROW_HEIGHT = 32;
