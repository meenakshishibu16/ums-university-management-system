import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { StudentService } from '../../../core/services/api.services';
import { AuthService } from '../../../core/services/auth.service';
import { Student } from '../../../core/models';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatTableModule, MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatChipsModule,
    MatProgressBarModule, MatPaginatorModule, MatTooltipModule,
    MatDialogModule, MatSnackBarModule
  ],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Students</h2>
        <p class="subtitle">Manage student records</p>
      </div>
      @if (auth.hasRole('ADMIN', 'ADMISSION_OFFICER')) {
        <a mat-raised-button color="primary" routerLink="/students/new">
          <mat-icon>add</mat-icon> Add Student
        </a>
      }
    </div>

    <mat-card>
      <mat-card-content>
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search students...</mat-label>
          <input matInput [formControl]="searchCtrl">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        @if (loading) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }

        <table mat-table [dataSource]="students" class="mat-elevation-z0 full-width">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let s">{{ s.studentId }}</td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let s">
              <div class="student-name">{{ s.name }}</div>
              <div class="student-email">{{ s.email }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef>Username</th>
            <td mat-cell *matCellDef="let s">{{ s.username }}</td>
          </ng-container>

          <ng-container matColumnDef="department">
            <th mat-header-cell *matHeaderCellDef>Department</th>
            <td mat-cell *matCellDef="let s">{{ s.departmentName ?? '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="year">
            <th mat-header-cell *matHeaderCellDef>Enrollment Year</th>
            <td mat-cell *matCellDef="let s">{{ s.enrollmentYear ?? '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let s">
              <span class="chip" [class]="'chip-' + s.academicStatus.toLowerCase()">
                {{ s.academicStatus }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let s">
              <a mat-icon-button [routerLink]="['/students', s.studentId]" matTooltip="View">
                <mat-icon>visibility</mat-icon>
              </a>
              @if (auth.hasRole('ADMIN', 'ADMISSION_OFFICER')) {
                <a mat-icon-button [routerLink]="['/students', s.studentId, 'edit']" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="confirmDelete(s)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" colspan="6">No students found</td>
          </tr>
        </table>

        <mat-paginator [length]="total" [pageSize]="pageSize"
                       [pageSizeOptions]="[10, 20, 50]"
                       (page)="onPage($event)"></mat-paginator>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-title { font-size: 1.8rem; font-weight: 600; margin: 0; color: #1a237e; }
    .subtitle { color: #666; margin: 4px 0 0; }
    .search-field { width: 100%; margin-bottom: 16px; }
    .full-width { width: 100%; }
    .student-name { font-weight: 500; }
    .student-email { font-size: 0.8rem; color: #666; }
    .chip { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; }
    .chip-active { background: #e8f5e9; color: #2e7d32; }
    .chip-graduated { background: #e3f2fd; color: #1565c0; }
    .chip-suspended { background: #fff3e0; color: #e65100; }
    .chip-dropped { background: #fce4ec; color: #c62828; }
    .no-data { text-align: center; padding: 40px; color: #999; }
  `]
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  displayedColumns = ['id', 'name', 'username', 'department', 'year', 'status', 'actions'];
  loading = false;
  total = 0;
  pageSize = 20;
  currentPage = 0;
  searchCtrl = new FormControl('');

  constructor(
    private studentService: StudentService,
    public auth: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => { this.currentPage = 0; this.load(); });
  }

  load(): void {
    this.loading = true;
    this.studentService.getAll(this.currentPage, this.pageSize, this.searchCtrl.value ?? '')
      .subscribe({
        next: (data) => { this.students = data; this.loading = false; },
        error: () => this.loading = false
      });
  }

  onPage(e: PageEvent): void {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  confirmDelete(s: Student): void {
    if (!confirm(`Delete student "${s.name}"? This cannot be undone.`)) return;
    this.studentService.delete(s.studentId).subscribe({
      next: () => { this.snackBar.open('Student deleted', 'Close', { duration: 3000 }); this.load(); },
      error: () => this.snackBar.open('Delete failed', 'Close', { duration: 3000 })
    });
  }
}
