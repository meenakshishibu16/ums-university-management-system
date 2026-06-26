import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { forkJoin } from 'rxjs';
import { StudentService, AttendanceService, GradeService, FeeService } from '../../../core/services/api.services';
import { Student, Attendance, Grade, Payment } from '../../../core/models';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatTabsModule, MatButtonModule, MatIconModule,
    MatTableModule, MatProgressBarModule
  ],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Student Profile</h2>
      </div>
      <div class="header-actions">
        <a mat-stroked-button routerLink="/students"><mat-icon>arrow_back</mat-icon> Back</a>
        <a mat-raised-button color="primary" [routerLink]="['/students', studentId, 'edit']">
          <mat-icon>edit</mat-icon> Edit
        </a>
      </div>
    </div>

    @if (loading) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }

    @if (student) {
      <mat-card class="profile-card">
        <mat-card-content>
          <div class="profile-header">
            <div class="avatar">{{ student.name[0] }}</div>
            <div class="profile-info">
              <h3>{{ student.name }}</h3>
              <p>{{ student.email }} · {{ student.username }}</p>
              <span class="chip chip-{{ student.academicStatus.toLowerCase() }}">{{ student.academicStatus }}</span>
            </div>
            <div class="profile-meta">
              <div><strong>Department:</strong> {{ student.departmentName ?? '—' }}</div>
              <div><strong>Enrollment Year:</strong> {{ student.enrollmentYear ?? '—' }}</div>
              <div><strong>Gender:</strong> {{ student.gender ?? '—' }}</div>
              <div><strong>Contact:</strong> {{ student.contact ?? '—' }}</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-tab-group class="mt-16">
        <mat-tab label="Grades">
          <div class="tab-content">
            <table mat-table [dataSource]="grades" class="full-width">
              <ng-container matColumnDef="course"><th mat-header-cell *matHeaderCellDef>Course</th>
                <td mat-cell *matCellDef="let g">{{ g.courseName }}</td></ng-container>
              <ng-container matColumnDef="semester"><th mat-header-cell *matHeaderCellDef>Semester</th>
                <td mat-cell *matCellDef="let g">{{ g.semester }}</td></ng-container>
              <ng-container matColumnDef="marks"><th mat-header-cell *matHeaderCellDef>Marks</th>
                <td mat-cell *matCellDef="let g">{{ g.marks ?? '—' }}</td></ng-container>
              <ng-container matColumnDef="grade"><th mat-header-cell *matHeaderCellDef>Grade</th>
                <td mat-cell *matCellDef="let g">{{ g.grade ?? '—' }}</td></ng-container>
              <tr mat-header-row *matHeaderRowDef="gradeColumns"></tr>
              <tr mat-row *matRowDef="let r; columns: gradeColumns;"></tr>
              <tr *matNoDataRow><td class="no-data" colspan="4">No grades recorded</td></tr>
            </table>
          </div>
        </mat-tab>

        <mat-tab label="Attendance">
          <div class="tab-content">
            @if (attendanceSummary) {
              <div class="summary-bar">
                <span>Present: <strong>{{ attendanceSummary.present }}</strong></span>
                <span>Total: <strong>{{ attendanceSummary.total }}</strong></span>
                <span>Percentage: <strong>{{ attendanceSummary.percentage | number:'1.1-1' }}%</strong></span>
              </div>
            }
            <table mat-table [dataSource]="attendance" class="full-width">
              <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let a">{{ a.date }}</td></ng-container>
              <ng-container matColumnDef="course"><th mat-header-cell *matHeaderCellDef>Course</th>
                <td mat-cell *matCellDef="let a">{{ a.courseName }}</td></ng-container>
              <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let a">
                  <span class="chip chip-{{ a.status.toLowerCase() }}">{{ a.status }}</span>
                </td></ng-container>
              <tr mat-header-row *matHeaderRowDef="attendanceColumns"></tr>
              <tr mat-row *matRowDef="let r; columns: attendanceColumns;"></tr>
              <tr *matNoDataRow><td class="no-data" colspan="3">No attendance records</td></tr>
            </table>
          </div>
        </mat-tab>

        <mat-tab label="Fee Payments">
          <div class="tab-content">
            <table mat-table [dataSource]="payments" class="full-width">
              <ng-container matColumnDef="receiptNo"><th mat-header-cell *matHeaderCellDef>Receipt</th>
                <td mat-cell *matCellDef="let p">{{ p.receiptNo }}</td></ng-container>
              <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let p">₹{{ p.amount | number:'1.2-2' }}</td></ng-container>
              <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let p">{{ p.paymentDate }}</td></ng-container>
              <ng-container matColumnDef="method"><th mat-header-cell *matHeaderCellDef>Method</th>
                <td mat-cell *matCellDef="let p">{{ p.method ?? '—' }}</td></ng-container>
              <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let p">
                  <span class="chip chip-{{ p.status.toLowerCase() }}">{{ p.status }}</span>
                </td></ng-container>
              <tr mat-header-row *matHeaderRowDef="paymentColumns"></tr>
              <tr mat-row *matRowDef="let r; columns: paymentColumns;"></tr>
              <tr *matNoDataRow><td class="no-data" colspan="5">No payment records</td></tr>
            </table>
          </div>
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-title { font-size: 1.8rem; font-weight: 600; margin: 0; color: #1a237e; }
    .header-actions { display: flex; gap: 8px; }
    .profile-card { margin-bottom: 16px; }
    .profile-header { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
    .avatar { width: 72px; height: 72px; border-radius: 50%; background: #1a237e; color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; }
    .profile-info h3 { margin: 0; font-size: 1.4rem; }
    .profile-info p { color: #666; margin: 4px 0 8px; }
    .profile-meta { margin-left: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
    .profile-meta div { font-size: 0.9rem; color: #444; }
    .chip { padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; }
    .chip-active, .chip-present, .chip-paid { background: #e8f5e9; color: #2e7d32; }
    .chip-graduated { background: #e3f2fd; color: #1565c0; }
    .chip-suspended, .chip-late { background: #fff3e0; color: #e65100; }
    .chip-dropped, .chip-absent, .chip-failed { background: #fce4ec; color: #c62828; }
    .chip-pending { background: #fff8e1; color: #f57f17; }
    .tab-content { padding: 16px 0; }
    .full-width { width: 100%; }
    .no-data { text-align: center; padding: 32px; color: #999; }
    .mt-16 { margin-top: 16px; }
    .summary-bar { display: flex; gap: 24px; padding: 12px 16px; background: #e8f5e9; border-radius: 8px; margin-bottom: 16px; }
  `]
})
export class StudentDetailComponent implements OnInit {
  studentId!: number;
  student: Student | null = null;
  grades: Grade[] = [];
  attendance: Attendance[] = [];
  payments: Payment[] = [];
  attendanceSummary: any = null;
  loading = false;

  gradeColumns = ['course', 'semester', 'marks', 'grade'];
  attendanceColumns = ['date', 'course', 'status'];
  paymentColumns = ['receiptNo', 'amount', 'date', 'method', 'status'];

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private attendanceService: AttendanceService,
    private gradeService: GradeService,
    private feeService: FeeService
  ) {}

  ngOnInit(): void {
    this.studentId = +this.route.snapshot.params['id'];
    this.loading = true;
    forkJoin({
      student: this.studentService.getById(this.studentId),
      grades: this.gradeService.getByStudent(this.studentId),
      attendance: this.attendanceService.getByStudent(this.studentId),
      payments: this.feeService.getStudentPayments(this.studentId)
    }).subscribe({
      next: (data) => {
        this.student = data.student;
        this.grades = data.grades;
        this.attendance = data.attendance;
        this.payments = data.payments;
        const total = data.attendance.length;
        const present = data.attendance.filter(a => a.status === 'PRESENT').length;
        this.attendanceSummary = { total, present, absent: total - present, percentage: total ? (present * 100 / total) : 0 };
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
