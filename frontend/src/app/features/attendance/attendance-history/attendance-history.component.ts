import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AttendanceService, ReportService } from '../../../core/services/api.services';
import { AuthService } from '../../../core/services/auth.service';
import { Attendance } from '../../../core/models';

@Component({
  selector: 'app-attendance-history',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressBarModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Attendance</h2>
        <p class="subtitle">View and manage attendance records</p>
      </div>
      @if (auth.hasRole('ADMIN', 'FACULTY')) {
        <a mat-raised-button color="primary" routerLink="/attendance/mark"><mat-icon>add</mat-icon> Mark Attendance</a>
      }
    </div>

    @if (auth.hasRole('ADMIN', 'FACULTY')) {
      <mat-card class="filter-card">
        <mat-card-content>
          <mat-form-field appearance="outline">
            <mat-label>Student ID</mat-label>
            <input matInput [formControl]="studentIdCtrl" type="number" placeholder="Enter student ID">
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="loadById()">Search</button>
        </mat-card-content>
      </mat-card>
    }

    @if (summary) {
      <div class="summary-cards">
        <div class="summary-card green"><div class="val">{{ summary.present }}</div><div class="lbl">Present</div></div>
        <div class="summary-card red"><div class="val">{{ summary.absent }}</div><div class="lbl">Absent</div></div>
        <div class="summary-card blue"><div class="val">{{ summary.total }}</div><div class="lbl">Total Classes</div></div>
        <div class="summary-card purple"><div class="val">{{ summary.percentage | number:'1.1-1' }}%</div><div class="lbl">Attendance %</div></div>
      </div>
    }

    <mat-card>
      <mat-card-content>
        @if (loading) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }
        <table mat-table [dataSource]="records" class="full-width">
          <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let a">{{ a.date }}</td></ng-container>
          <ng-container matColumnDef="course"><th mat-header-cell *matHeaderCellDef>Course</th><td mat-cell *matCellDef="let a">{{ a.courseName }}</td></ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let a"><span class="chip chip-{{ a.status.toLowerCase() }}">{{ a.status }}</span></td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let r; columns: cols;"></tr>
          <tr *matNoDataRow><td class="no-data" colspan="3">No records found</td></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
    .page-title{font-size:1.8rem;font-weight:600;margin:0;color:#1a237e}.subtitle{color:#666;margin:4px 0 0}
    .filter-card{margin-bottom:16px}
    mat-card-content{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
    .summary-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
    .summary-card{padding:16px;border-radius:8px;text-align:center}
    .green{background:#e8f5e9}.red{background:#fce4ec}.blue{background:#e3f2fd}.purple{background:#f3e5f5}
    .val{font-size:2rem;font-weight:700}.lbl{font-size:0.85rem;color:#444;margin-top:4px}
    .full-width{width:100%}
    .chip{padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:500}
    .chip-present{background:#e8f5e9;color:#2e7d32}.chip-absent{background:#fce4ec;color:#c62828}.chip-late{background:#fff3e0;color:#e65100}
    .no-data{text-align:center;padding:40px;color:#999}
  `]
})
export class AttendanceHistoryComponent implements OnInit {
  records: Attendance[] = [];
  cols = ['date', 'course', 'status'];
  loading = false;
  summary: any = null;
  studentIdCtrl = new FormControl<number | null>(null);

  constructor(private attendanceService: AttendanceService, private reportService: ReportService, public auth: AuthService) {}

  ngOnInit(): void {
    if (this.auth.hasRole('STUDENT')) {
      const studentId = this.auth.currentUser()?.profileId;
      if (studentId) this.loadForStudent(studentId);
    }
  }

  loadById(): void {
    const id = this.studentIdCtrl.value;
    if (!id) return;
    this.loadForStudent(id);
  }

  loadForStudent(studentId: number): void {
    this.loading = true;
    this.attendanceService.getByStudent(studentId).subscribe({
      next: data => {
        this.records = data;
        const total = data.length;
        const present = data.filter(a => a.status === 'PRESENT').length;
        this.summary = { total, present, absent: total - present, percentage: total ? present * 100 / total : 0 };
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
