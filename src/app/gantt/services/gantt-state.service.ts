import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GanttConfig } from '../models/gantt.model';

export const DEFAULT_PHASES_JSON = `[
  { "key": "schet", "label": "Schetsontwerp",                    "color": "#A8D8F0" },
  { "key": "voor",  "label": "Voorlopig Ontwerp",                "color": "#3EB0DC" },
  { "key": "def",   "label": "Definitief Ontwerp",               "color": "#1A6A9A" },
  { "key": "afr",   "label": "Afronding eng / Werkvoorbereiding","color": "#0D3D5A" },
  { "key": "uitv",  "label": "Uitvoering",                       "color": "#4A9E4A" }
]`;

export const DEFAULT_PROJECTS_JSON = `[
  {
    "nrUitvoer":     "980065-0010",
    "nrEngineering": "231524",
    "projectId":     "D.27195",
    "tranche":       "TR1",
    "omschrijving":  "NV24 HTB TR01 DB-NRD-Maaspoortweg PIMS",
    "marker":        "L",
    "_rowColor":     "#FAEEDA",
    "_phases": [
      { "phaseKey": "def",  "startWeek": 10, "endWeek": 13 },
      { "phaseKey": "uitv", "startWeek": 14, "endWeek": 18 }
    ]
  },
  {
    "nrUitvoer":     "980065-0011",
    "nrEngineering": "251006",
    "projectId":     "D.26978",
    "tranche":       "TR1",
    "omschrijving":  "NV26 HTB TR01 HS HTB-N – Geerke PIMS",
    "marker":        "L",
    "_rowColor":     "#FAEEDA",
    "_phases": [
      { "phaseKey": "voor", "startWeek": 10, "endWeek": 14 },
      { "phaseKey": "def",  "startWeek": 15, "endWeek": 18 },
      { "phaseKey": "uitv", "startWeek": 19, "endWeek": 28 }
    ]
  },
  {
    "nrUitvoer":     "",
    "nrEngineering": "",
    "projectId":     "D.26770",
    "tranche":       "HP",
    "omschrijving":  "NV E OSS OSS Danehoef Kloosterstr PIMS",
    "marker":        "",
    "_phases": [
      { "phaseKey": "uitv", "startWeek": 16, "endWeek": 30 }
    ]
  },
  {
    "nrUitvoer":     "980065-0012",
    "nrEngineering": "251008",
    "projectId":     "D.26984",
    "tranche":       "TR1",
    "omschrijving":  "NV26 MHT TR01 HS OSS – Kloosterstraat PIMS",
    "marker":        "J",
    "_phases": [
      { "phaseKey": "afr",  "startWeek": 10, "endWeek": 12 },
      { "phaseKey": "uitv", "startWeek": 13, "endWeek": 28 }
    ]
  },
  {
    "nrUitvoer":     "980065-0013",
    "nrEngineering": "251033",
    "projectId":     "D.27088",
    "tranche":       "TR2",
    "omschrijving":  "NV26 MHT TR02 HS Oss-Danehoef PIMS",
    "marker":        "J",
    "_phases": [
      { "phaseKey": "def",  "startWeek": 14, "endWeek": 19 },
      { "phaseKey": "uitv", "startWeek": 20, "endWeek": 30 }
    ]
  },
  {
    "nrUitvoer":     "980065-0014",
    "nrEngineering": "251041",
    "projectId":     "D.27095",
    "tranche":       "TR3",
    "omschrijving":  "NV26 MHT TR03 Danenhoef-Vorstengrafdork PIMS",
    "marker":        "J",
    "_phases": [
      { "phaseKey": "afr",  "startWeek": 10, "endWeek": 14 },
      { "phaseKey": "uitv", "startWeek": 15, "endWeek": 34 }
    ]
  },
  {
    "nrUitvoer":     "980065-0015",
    "nrEngineering": "251009",
    "projectId":     "D.26983",
    "tranche":       "TR1",
    "omschrijving":  "NV26 MHT TR01 HS UDEN – Hoeven PIMS",
    "marker":        "L",
    "_phases": [
      { "phaseKey": "afr",  "startWeek": 10, "endWeek": 12 },
      { "phaseKey": "uitv", "startWeek": 13, "endWeek": 24 }
    ]
  },
  {
    "nrUitvoer":     "980065-0016",
    "nrEngineering": "251031",
    "projectId":     "D.27087",
    "tranche":       "TR2",
    "omschrijving":  "NV26 MHT TR02 Neringstr-Vaarzenhof PIMS",
    "marker":        "R",
    "_phases": [
      { "phaseKey": "afr",  "startWeek": 12, "endWeek": 15 },
      { "phaseKey": "uitv", "startWeek": 16, "endWeek": 27 }
    ]
  },
  {
    "nrUitvoer":     "980065-0017",
    "nrEngineering": "251010",
    "projectId":     "D.26981",
    "tranche":       "TR1",
    "omschrijving":  "NV26 MHT TR01 HS-Uden-Frontstraat PIMS",
    "marker":        "R",
    "_phases": [
      { "phaseKey": "afr",  "startWeek": 10, "endWeek": 14 },
      { "phaseKey": "uitv", "startWeek": 28, "endWeek": 36 }
    ]
  },
  {
    "nrUitvoer":     "980065-0018",
    "nrEngineering": "251034",
    "projectId":     "D.27077",
    "tranche":       "TR3",
    "omschrijving":  "NV26 MHT TR03 HS-Uden-Handelslaan PIMS",
    "marker":        "R",
    "_phases": [
      { "phaseKey": "afr",   "startWeek": 10, "endWeek": 14 },
      { "phaseKey": "schet", "startWeek": 15, "endWeek": 19 },
      { "phaseKey": "voor",  "startWeek": 32, "endWeek": 40 },
      { "phaseKey": "uitv",  "startWeek": 41, "endWeek": 52 }
    ]
  },
  {
    "nrUitvoer":     "980065-0019",
    "nrEngineering": "251011",
    "projectId":     "D.26980",
    "tranche":       "TR1",
    "omschrijving":  "NV26 MHT TR01 HS UDEN – Schaijk PIMS",
    "marker":        "L",
    "_phases": [
      { "phaseKey": "afr",  "startWeek": 30, "endWeek": 34 },
      { "phaseKey": "uitv", "startWeek": 35, "endWeek": 44 }
    ]
  }
]`;

@Injectable({ providedIn: 'root' })
export class GanttStateService {
  private _config$ = new BehaviorSubject<GanttConfig | null>(null);
  private _year$   = new BehaviorSubject<number>(new Date().getFullYear());
  private _errors$ = new BehaviorSubject<string[]>([]);

  config$ = this._config$.asObservable();
  year$   = this._year$.asObservable();
  errors$ = this._errors$.asObservable();

  get config(): GanttConfig | null { return this._config$.getValue(); }
  get year(): number               { return this._year$.getValue(); }

  setConfig(config: GanttConfig | null): void { this._config$.next(config); }
  setYear(year: number): void                 { this._year$.next(year); }
  setErrors(errors: string[]): void           { this._errors$.next(errors); }
}
