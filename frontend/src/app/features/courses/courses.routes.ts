import { Routes } from '@angular/router';
export const COURSE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./course-list/course-list.component').then(m => m.CourseListComponent) },
  { path: 'new', loadComponent: () => import('./course-form/course-form.component').then(m => m.CourseFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./course-form/course-form.component').then(m => m.CourseFormComponent) },
  { path: ':id/roster', loadComponent: () => import('./course-roster/course-roster.component').then(m => m.CourseRosterComponent) },
];
