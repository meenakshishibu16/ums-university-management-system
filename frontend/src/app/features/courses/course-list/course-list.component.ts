import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CourseService, DepartmentService } from '../../../core/services/api.services';
import { AuthService } from '../../../core/services/auth.service';
import { Course, Department } from '../../../core/models';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatTableModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule, MatSnackBarModule, MatSelectModule, MatFormFieldModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Courses</h2>
        <p class="subtitle">Course catalog</p>
      </div>
      @if (auth.hasRole('ADMIN')) {
        <a mat-raised-button color="primary" routerLink="/courses/new"><mat-icon>add</mat-icon> Add Course</a>
      }
    </div>
    <mat-card>
      <mat-card-content>
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Filter by Department</mat-label>
          <mat-select [formControl]="deptCtrl" (selectionChange)="load()">
            <mat-option [value]="null">All Departments</mat-option>
            @for (d of departments; track d.departmentId) {
              <mat-option [value]="d.departmentId">{{ d.departmentName }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        @if (loading) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }
        <table mat-table [dataSource]="courses" class="full-width">
          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef>Code</th>
            <td mat-cell *matCellDef="let c"><strong>{{ c.courseCode }}</strong></td>
          </ng-container>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Course Name</th>
            <td mat-cell *matCellDef="let c">{{ c.courseName }}</td>
          </ng-container>
          <ng-container matColumnDef="credits">
            <th mat-header-cell *matHeaderCellDef>Credits</th>
            <td mat-cell *matCellDef="let c">{{ c.credits }}</td>
          </ng-container>
          <ng-container matColumnDef="semester">
            <th mat-header-cell *matHeaderCellDef>Semester</th>
            <td mat-cell *matCellDef="let c">{{ c.semester ?? '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="department">
            <th mat-header-cell *matHeaderCellDef>Department</th>
            <td mat-cell *matCellDef="let c">{{ c.departmentName ?? '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let c">
              @if (auth.hasRole('ADMIN', 'ADMISSION_OFFICER')) {
                <a mat-icon-button [routerLink]="['/courses', c.courseId, 'roster']" matTooltip="Manage Roster"><mat-icon>group</mat-icon></a>
              }
              @if (auth.hasRole('ADMIN')) {
                <a mat-icon-button [routerLink]="['/courses', c.courseId, 'edit']" matTooltip="Edit"><mat-icon>edit</mat-icon></a>
                <button mat-icon-button color="warn" (click)="confirmDelete(c)" matTooltip="Delete"><mat-icon>delete</mat-icon></button>
              }
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let r; columns: cols;"></tr>
          <tr *matNoDataRow><td class="no-data" colspan="6">No courses found</td></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}.page-title{font-size:1.8rem;font-weight:600;margin:0;color:#1a237e}.subtitle{color:#666;margin:4px 0 0}.full-width{width:100%}.filter-field{width:280px;margin-bottom:16px}.no-data{text-align:center;padding:40px;color:#999}`]
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  departments: Department[] = [];
  cols = ['code', 'name', 'credits', 'semester', 'department', 'actions'];
  loading = false;
  deptCtrl = new FormControl<number | null>(null);
  constructor(private courseService: CourseService, private deptService: DepartmentService, public auth: AuthService, private snackBar: MatSnackBar) {}
  ngOnInit(): void { this.deptService.getAll().subscribe(d => this.departments = d); this.load(); }
  load(): void {
    this.loading = true;
    this.courseService.getAll(this.deptCtrl.value ?? undefined).subscribe({ next: d => { this.courses = d; this.loading = false; }, error: () => this.loading = false });
  }
  confirmDelete(c: Course): void {
    if (!confirm(`Delete course "${c.courseName}"?`)) return;
    this.courseService.delete(c.courseId).subscribe({ next: () => { this.snackBar.open('Deleted', 'Close', { duration: 3000 }); this.load(); }, error: () => this.snackBar.open('Failed', 'Close', { duration: 3000 }) });
  }
}
