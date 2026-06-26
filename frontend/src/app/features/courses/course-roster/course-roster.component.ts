import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CourseService, StudentService, EnrollmentService } from '../../../core/services/api.services';
import { AuthService } from '../../../core/services/auth.service';
import { Course, Student, Enrollment } from '../../../core/models';

@Component({
  selector: 'app-course-roster',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressBarModule, MatFormFieldModule, MatSelectModule, MatSnackBarModule, MatTooltipModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">{{ course?.courseCode }} — {{ course?.courseName }}</h2>
        <p class="subtitle">Enrolled students {{ course?.semester ? '· ' + course?.semester : '' }}</p>
      </div>
      <a mat-stroked-button routerLink="/courses"><mat-icon>arrow_back</mat-icon> Back to Courses</a>
    </div>

    @if (auth.hasRole('ADMIN', 'ADMISSION_OFFICER')) {
      <mat-card class="mb-16">
        <mat-card-content>
          <mat-form-field appearance="outline">
            <mat-label>Add Student</mat-label>
            <mat-select [formControl]="addStudentCtrl">
              @for (s of availableStudents; track s.studentId) { <mat-option [value]="s.studentId">{{ s.name }} ({{ s.username }})</mat-option> }
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="primary" [disabled]="!addStudentCtrl.value" (click)="enroll()">
            <mat-icon>person_add</mat-icon> Enroll
          </button>
        </mat-card-content>
      </mat-card>
    }

    @if (loading) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }

    <mat-card>
      <mat-card-content>
        <table mat-table [dataSource]="roster" class="full-width">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Student</th>
            <td mat-cell *matCellDef="let r">{{ r.studentName }}</td>
          </ng-container>
          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef>Username</th>
            <td mat-cell *matCellDef="let r">{{ r.studentUsername }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let r">
              @if (auth.hasRole('ADMIN', 'ADMISSION_OFFICER')) {
                <button mat-icon-button color="warn" (click)="unenroll(r)" matTooltip="Remove">
                  <mat-icon>person_remove</mat-icon>
                </button>
              }
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          <tr *matNoDataRow><td class="no-data" colspan="3">No students enrolled in this course yet</td></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
    .page-title{font-size:1.6rem;font-weight:600;margin:0;color:#1a237e}.subtitle{color:#666;margin:4px 0 0}
    .mb-16{margin-bottom:16px}
    mat-card-content{display:flex;gap:16px;align-items:center;flex-wrap:wrap;padding:16px!important}
    .full-width{width:100%}
    .no-data{text-align:center;padding:40px;color:#999}
  `]
})
export class CourseRosterComponent implements OnInit {
  course: Course | null = null;
  roster: Enrollment[] = [];
  allStudents: Student[] = [];
  cols = ['name', 'username', 'actions'];
  loading = false;
  addStudentCtrl = new FormControl<number | null>(null);

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private studentService: StudentService,
    private enrollmentService: EnrollmentService,
    public auth: AuthService,
    private snackBar: MatSnackBar
  ) {}

  get availableStudents(): Student[] {
    const enrolledIds = new Set(this.roster.map(r => r.studentId));
    return this.allStudents.filter(s => !enrolledIds.has(s.studentId));
  }

  ngOnInit(): void {
    const courseId = Number(this.route.snapshot.params['id']);
    this.courseService.getById(courseId).subscribe(c => {
      this.course = c;
      this.loadRoster();
    });
    this.studentService.getAll(0, 500).subscribe(s => this.allStudents = s);
  }

  loadRoster(): void {
    if (!this.course) return;
    this.loading = true;
    this.enrollmentService.getRoster(this.course.courseId, this.course.semester).subscribe({
      next: r => { this.roster = r; this.loading = false; },
      error: () => this.loading = false
    });
  }

  enroll(): void {
    const studentId = this.addStudentCtrl.value;
    if (!studentId || !this.course) return;
    this.enrollmentService.enroll(this.course.courseId, studentId, this.course.semester ?? '').subscribe({
      next: () => { this.snackBar.open('Student enrolled', 'Close', { duration: 3000 }); this.addStudentCtrl.reset(); this.loadRoster(); },
      error: e => this.snackBar.open(e.error?.message ?? 'Failed to enroll', 'Close', { duration: 3000 })
    });
  }

  unenroll(r: Enrollment): void {
    if (!this.course || !confirm(`Remove ${r.studentName} from this course?`)) return;
    this.enrollmentService.unenroll(this.course.courseId, r.studentId, this.course.semester).subscribe({
      next: () => { this.snackBar.open('Student removed', 'Close', { duration: 3000 }); this.loadRoster(); },
      error: () => this.snackBar.open('Failed to remove', 'Close', { duration: 3000 })
    });
  }
}
