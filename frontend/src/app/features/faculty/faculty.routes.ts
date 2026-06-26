import { Routes } from '@angular/router';

export const FACULTY_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./faculty-list/faculty-list.component').then(m => m.FacultyListComponent) },
  { path: 'new', loadComponent: () => import('./faculty-form/faculty-form.component').then(m => m.FacultyFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./faculty-form/faculty-form.component').then(m => m.FacultyFormComponent) },
];
