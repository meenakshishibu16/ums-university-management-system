import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AttendanceService, CourseService, EnrollmentService } from '../../../core/services/api.services';
import { Course, Enrollment } from '../../../core/models';

@Component({
  selector: 'app-mark-attendance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, MatRadioModule, MatDatepickerModule, MatNativeDateModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">Mark Attendance</h2>
      <a mat-stroked-button routerLink="/attendance"><mat-icon>arrow_back</mat-icon> Back</a>
    </div>
    <mat-card class="filter-card">
      <mat-card-content>
        <div class="filter-row">
          <mat-form-field appearance="outline">
            <mat-label>Course</mat-label>
            <mat-select [(value)]="selectedCourse" (selectionChange)="loadStudents()">
              @for (c of courses; track c.courseId) { <mat-option [value]="c">{{ c.courseCode }} - {{ c.courseName }}</mat-option> }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date</mat-label>
            <input matInput [matDatepicker]="dp" [(ngModel)]="selectedDate">
            <mat-datepicker-toggle matIconSuffix [for]="dp"></mat-datepicker-toggle>
            <mat-datepicker #dp></mat-datepicker>
          </mat-form-field>
        </div>
      </mat-card-content>
    </mat-card>

    @if (students.length > 0) {
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ students.length }} students enrolled</mat-card-title>
          <div class="quick-actions">
            <button mat-stroked-button (click)="markAll('PRESENT')">All Present</button>
            <button mat-stroked-button (click)="markAll('ABSENT')">All Absent</button>
          </div>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="students" class="full-width">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Student</th>
              <td mat-cell *matCellDef="let s">{{ s.studentName }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let s">
                <mat-radio-group [(ngModel)]="attendance[s.studentId]" class="radio-group">
                  <mat-radio-button value="PRESENT" class="present">Present</mat-radio-button>
                  <mat-radio-button value="ABSENT" class="absent">Absent</mat-radio-button>
                  <mat-radio-button value="LATE" class="late">Late</mat-radio-button>
                </mat-radio-group>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let r; columns: cols;"></tr>
          </table>
          <div class="save-row">
            <button mat-raised-button color="primary" (click)="submit()" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Save Attendance' }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
    .page-title{font-size:1.8rem;font-weight:600;margin:0;color:#1a237e}
    .filter-card{margin-bottom:16px}
    .filter-row{display:flex;gap:16px;flex-wrap:wrap}
    .filter-row mat-form-field{flex:1;min-width:200px}
    .full-width{width:100%}
    .radio-group{display:flex;gap:16px}
    .quick-actions{display:flex;gap:8px;margin-left:auto}
    .save-row{display:flex;justify-content:flex-end;margin-top:16px}
    mat-card-header{display:flex;align-items:center;padding:16px 16px 0}
  `]
})
export class MarkAttendanceComponent implements OnInit {
  courses: Course[] = [];
  students: Enrollment[] = [];
  selectedCourse: Course | null = null;
  selectedDate: Date = new Date();
  attendance: Record<number, string> = {};
  cols = ['name', 'status'];
  saving = false;

  constructor(private courseService: CourseService, private enrollmentService: EnrollmentService,
    private attendanceService: AttendanceService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.courseService.getAll().subscribe(c => this.courses = c);
  }

  loadStudents(): void {
    if (!this.selectedCourse) return;
    this.enrollmentService.getRoster(this.selectedCourse.courseId, this.selectedCourse.semester).subscribe(students => {
      this.students = students;
      this.attendance = {};
      students.forEach(s => this.attendance[s.studentId] = 'PRESENT');
    });
  }

  markAll(status: string): void {
    this.students.forEach(s => this.attendance[s.studentId] = status);
  }

  submit(): void {
    if (!this.selectedCourse) return;
    this.saving = true;
    const entries = this.students.map(s => ({ studentId: s.studentId, status: this.attendance[s.studentId] ?? 'PRESENT' }));
    const dateStr = this.selectedDate.toISOString().split('T')[0];
    this.attendanceService.markAttendance({ courseId: this.selectedCourse.courseId, date: dateStr, entries }).subscribe({
      next: () => { this.snackBar.open('Attendance saved', 'Close', { duration: 3000 }); this.saving = false; },
      error: () => { this.snackBar.open('Failed to save', 'Close', { duration: 3000 }); this.saving = false; }
    });
  }
}
