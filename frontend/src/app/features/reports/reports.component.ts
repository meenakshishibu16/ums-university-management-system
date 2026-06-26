import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ReportService } from '../../core/services/api.services';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatTableModule],
  template: `
    <div class="page-header">
      <div><h2 class="page-title">Reports</h2><p class="subtitle">System analytics and reports</p></div>
    </div>

    @if (loading) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }

    <div class="reports-grid">
      <!-- Student Report -->
      <mat-card class="report-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="icon-students">people</mat-icon>
          <mat-card-title>Student Report</mat-card-title>
          <mat-card-subtitle>Enrollment statistics</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (studentReport) {
            <div class="report-stats">
              <div class="stat"><span class="label">Total</span><span class="value">{{ studentReport.total }}</span></div>
              <div class="stat"><span class="label">Active</span><span class="value active">{{ studentReport.active }}</span></div>
              <div class="stat"><span class="label">Graduated</span><span class="value graduated">{{ studentReport.graduated }}</span></div>
              <div class="stat"><span class="label">Suspended</span><span class="value suspended">{{ studentReport.suspended }}</span></div>
            </div>
          }
        </mat-card-content>
        <mat-card-actions>
          <button mat-button color="primary" (click)="loadStudentReport()">Refresh</button>
        </mat-card-actions>
      </mat-card>

      <!-- Fee Report -->
      <mat-card class="report-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="icon-fees">payments</mat-icon>
          <mat-card-title>Fee Report</mat-card-title>
          <mat-card-subtitle>Payment statistics</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (feeReport) {
            <div class="report-stats">
              <div class="stat"><span class="label">Total Payments</span><span class="value">{{ feeReport.totalPayments }}</span></div>
              <div class="stat"><span class="label">Paid</span><span class="value active">{{ feeReport.paidPayments }}</span></div>
              <div class="stat"><span class="label">Pending</span><span class="value suspended">{{ feeReport.pendingPayments }}</span></div>
            </div>
          }
        </mat-card-content>
        <mat-card-actions>
          <button mat-button color="primary" (click)="loadFeeReport()">Refresh</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
    .page-title{font-size:1.8rem;font-weight:600;margin:0;color:#1a237e}.subtitle{color:#666;margin:4px 0 0}
    .reports-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}
    .report-card{}
    mat-card-content{padding:16px!important}
    .report-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
    .stat{padding:12px;background:#f5f7fa;border-radius:8px}
    .label{display:block;font-size:0.8rem;color:#666;margin-bottom:4px}
    .value{font-size:1.8rem;font-weight:700;color:#1a237e}
    .active{color:#2e7d32}.graduated{color:#1565c0}.suspended{color:#e65100}
    .icon-students{background:#e3f2fd;color:#1565c0;border-radius:50%;padding:8px}
    .icon-fees{background:#e8f5e9;color:#2e7d32;border-radius:50%;padding:8px}
  `]
})
export class ReportsComponent implements OnInit {
  studentReport: any = null;
  feeReport: any = null;
  loading = false;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadStudentReport();
    this.loadFeeReport();
  }

  loadStudentReport(): void {
    this.reportService.getStudentReport().subscribe(r => this.studentReport = r);
  }

  loadFeeReport(): void {
    this.reportService.getFeeReport().subscribe(r => this.feeReport = r);
  }
}
