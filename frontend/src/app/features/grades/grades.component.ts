import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { GradeService, CourseService, EnrollmentService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { Grade, Course } from '../../core/models';

const GRADE_POINTS: Record<string, number> = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 0 };

interface GradeRow {
  studentId: number;
  studentName: string;
  gradeId: number | null;
  marks: number | null;
  grade: string | null;
}

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressBarModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <div><h2 class="page-title">Grades</h2><p class="subtitle">Manage student grades</p></div>
    </div>

    @if (auth.hasRole('ADMIN', 'FACULTY')) {
      <mat-card class="filter-card">
        <mat-card-content>
          <mat-form-field appearance="outline">
            <mat-label>Course</mat-label>
            <mat-select [formControl]="courseCtrl" (selectionChange)="loadRoster()">
              @for (c of courses; track c.courseId) { <mat-option [value]="c.courseId">{{ c.courseCode }} - {{ c.courseName }}</mat-option> }
            </mat-select>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      @if (loading) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }

      @if (courseCtrl.value) {
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ rows.length }} students enrolled{{ semester ? ' · ' + semester : '' }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="rows" class="full-width">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Student</th>
                <td mat-cell *matCellDef="let r">{{ r.studentName }}</td>
              </ng-container>
              <ng-container matColumnDef="marks">
                <th mat-header-cell *matHeaderCellDef>Marks (0-100)</th>
                <td mat-cell *matCellDef="let r">
                  <mat-form-field appearance="outline" class="dense"><input matInput type="number" [(ngModel)]="r.marks"></mat-form-field>
                </td>
              </ng-container>
              <ng-container matColumnDef="grade">
                <th mat-header-cell *matHeaderCellDef>Grade</th>
                <td mat-cell *matCellDef="let r">
                  <mat-form-field appearance="outline" class="dense">
                    <mat-select [(ngModel)]="r.grade">
                      @for (g of gradeOptions; track g) { <mat-option [value]="g">{{ g }}</mat-option> }
                    </mat-select>
                  </mat-form-field>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let r">
                  <button mat-raised-button color="primary" (click)="saveRow(r)">{{ r.gradeId ? 'Update' : 'Save' }}</button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;"></tr>
              <tr *matNoDataRow><td class="no-data" colspan="4">No students enrolled in this course</td></tr>
            </table>
          </mat-card-content>
        </mat-card>
      }
    }

    @if (auth.hasRole('STUDENT')) {
      <div class="gpa-card">
        <div class="gpa-item"><span class="gpa-label">Current GPA</span><span class="gpa-value">{{ calcGPA() }}</span></div>
      </div>

      @if (loading) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }
      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="grades" class="full-width">
            <ng-container matColumnDef="course"><th mat-header-cell *matHeaderCellDef>Course</th><td mat-cell *matCellDef="let g">{{ g.courseName }}</td></ng-container>
            <ng-container matColumnDef="semester"><th mat-header-cell *matHeaderCellDef>Semester</th><td mat-cell *matCellDef="let g">{{ g.semester }}</td></ng-container>
            <ng-container matColumnDef="marksRead"><th mat-header-cell *matHeaderCellDef>Marks</th><td mat-cell *matCellDef="let g">{{ g.marks ?? '—' }}</td></ng-container>
            <ng-container matColumnDef="gradeRead">
              <th mat-header-cell *matHeaderCellDef>Grade</th>
              <td mat-cell *matCellDef="let g"><span class="grade-chip grade-{{ g.grade }}">{{ g.grade ?? '—' }}</span></td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="studentCols"></tr>
            <tr mat-row *matRowDef="let r; columns: studentCols;"></tr>
            <tr *matNoDataRow><td class="no-data" colspan="4">No grades found</td></tr>
          </table>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
    .page-title{font-size:1.8rem;font-weight:600;margin:0;color:#1a237e}.subtitle{color:#666;margin:4px 0 0}
    .filter-card{margin-bottom:16px}
    mat-card-content{padding:16px!important}
    mat-card-header mat-card-title{padding:0 0 8px}
    .full-width{width:100%}
    .dense{width:120px}
    .dense .mat-mdc-form-field-subscript-wrapper{display:none}
    .gpa-card{background:#e8f5e9;border-radius:8px;padding:16px 24px;margin-bottom:16px;display:flex;gap:32px}
    .gpa-label{display:block;font-size:0.85rem;color:#444}.gpa-value{font-size:2rem;font-weight:700;color:#2e7d32}
    .grade-chip{padding:4px 10px;border-radius:8px;font-weight:700;font-size:0.9rem}
    .grade-A+,.grade-A{background:#e8f5e9;color:#1b5e20}.grade-B+,.grade-B{background:#e3f2fd;color:#0d47a1}
    .grade-C+,.grade-C{background:#fff8e1;color:#f57f17}.grade-D{background:#fff3e0;color:#e65100}.grade-F{background:#fce4ec;color:#b71c1c}
    .no-data{text-align:center;padding:40px;color:#999}
  `]
})
export class GradesComponent implements OnInit {
  grades: Grade[] = [];
  courses: Course[] = [];
  rows: GradeRow[] = [];
  cols = ['name', 'marks', 'grade', 'actions'];
  studentCols = ['course', 'semester', 'marksRead', 'gradeRead'];
  loading = false;
  semester = '';
  gradeOptions = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
  courseCtrl = new FormControl<number | null>(null);

  constructor(
    private gradeService: GradeService,
    private courseService: CourseService,
    private enrollmentService: EnrollmentService,
    public auth: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.courseService.getAll().subscribe(c => this.courses = c);
    if (this.auth.hasRole('STUDENT')) {
      const studentId = this.auth.currentUser()?.profileId;
      if (studentId) this.loadForStudent(studentId);
    }
  }

  loadForStudent(id: number): void {
    this.loading = true;
    this.gradeService.getByStudent(id).subscribe({ next: g => { this.grades = g; this.loading = false; }, error: () => this.loading = false });
  }

  loadRoster(): void {
    const courseId = this.courseCtrl.value;
    if (!courseId) return;
    this.semester = this.courses.find(c => c.courseId === courseId)?.semester ?? '';
    this.loading = true;
    forkJoin([
      this.enrollmentService.getRoster(courseId, this.semester),
      this.gradeService.getByCourse(courseId, this.semester)
    ]).subscribe({
      next: ([roster, grades]) => {
        this.rows = roster.map(r => {
          const g = grades.find(g => g.studentId === r.studentId);
          return { studentId: r.studentId, studentName: r.studentName, gradeId: g?.gradeId ?? null, marks: g?.marks ?? null, grade: g?.grade ?? null };
        });
        this.loading = false;
      },
      error: () => { this.rows = []; this.loading = false; }
    });
  }

  saveRow(r: GradeRow): void {
    const courseId = this.courseCtrl.value;
    if (!courseId) return;
    const payload = { studentId: r.studentId, courseId, semester: this.semester, marks: r.marks ?? undefined, grade: r.grade ?? undefined };
    const obs = r.gradeId ? this.gradeService.update(r.gradeId, payload) : this.gradeService.create(payload);
    obs.subscribe({
      next: (g) => { r.gradeId = g.gradeId; this.snackBar.open(`Grade saved for ${r.studentName}`, 'Close', { duration: 2500 }); },
      error: e => this.snackBar.open(e.error?.message ?? 'Failed to save grade', 'Close', { duration: 3000 })
    });
  }

  calcGPA(): string {
    const valid = this.grades.filter(g => g.grade && GRADE_POINTS[g.grade] !== undefined);
    if (!valid.length) return '—';
    return (valid.reduce((sum, g) => sum + GRADE_POINTS[g.grade!], 0) / valid.length).toFixed(2);
  }
}
