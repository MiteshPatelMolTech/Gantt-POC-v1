import { Injectable } from '@angular/core';
import { MonthGroup, WeekCell, MONTHS_SHORT } from '../models/gantt.model';

@Injectable({ providedIn: 'root' })
export class WeekHelperService {

  getISOWeek(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  getWeeksInYear(year: number): number {
    return this.getISOWeek(new Date(year, 11, 28));
  }

  getMonthForWeek(year: number, week: number): number {
    const d = new Date(year, 0, 1 + (week - 1) * 7);
    const day = d.getDay() || 7;
    if (day !== 1) d.setDate(d.getDate() - (day - 1));
    return d.getMonth();
  }

  getTodayWeek(): number {
    return this.getISOWeek(new Date());
  }

  getTodayISOYear(): number {
    const today = new Date();
    const week = this.getISOWeek(today);
    if (week === 1 && today.getMonth() === 11) return today.getFullYear() + 1;
    if (week >= 52 && today.getMonth() === 0) return today.getFullYear() - 1;
    return today.getFullYear();
  }

  buildWeekCells(year: number): WeekCell[] {
    const total = this.getWeeksInYear(year);
    const todayW = this.getTodayWeek();
    const todayY = this.getTodayISOYear();
    const cells: WeekCell[] = [];
    for (let w = 1; w <= total; w++) {
      cells.push({
        week: w,
        year,
        isToday: w === todayW && year === todayY,
        monthIndex: this.getMonthForWeek(year, w),
      });
    }
    return cells;
  }

  buildMonthGroups(cells: WeekCell[]): MonthGroup[] {
    const groups: MonthGroup[] = [];
    let prev = -1, count = 0;
    for (const c of cells) {
      if (c.monthIndex !== prev) {
        if (prev >= 0) groups.push({ label: MONTHS_SHORT[prev], weekCount: count });
        prev = c.monthIndex; count = 1;
      } else { count++; }
    }
    if (count > 0) groups.push({ label: MONTHS_SHORT[prev], weekCount: count });
    return groups;
  }
}
