import { Routes } from '@angular/router';
export const GRADE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./grades.component').then(m => m.GradesComponent) },
];
