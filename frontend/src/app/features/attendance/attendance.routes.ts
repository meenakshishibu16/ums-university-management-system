import { Routes } from '@angular/router';
export const ATTENDANCE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./attendance-history/attendance-history.component').then(m => m.AttendanceHistoryComponent) },
  { path: 'mark', loadComponent: () => import('./mark-attendance/mark-attendance.component').then(m => m.MarkAttendanceComponent) },
];
