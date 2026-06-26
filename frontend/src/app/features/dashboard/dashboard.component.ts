import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReportService, GradeService } from '../../core/services/api.services';
import { DashboardStats } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';

const GRADE_POINTS: Record<string, number> = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 0 };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="dashboard">
      <h2 class="page-title">Dashboard</h2>
      <p class="welcome">Welcome back, <strong>{{ auth.currentUser()?.username }}</strong></p>

      @if (loading) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }

      @if (stats) {
        <div class="stats-grid">
          @for (card of statCards; track card.label) {
            <mat-card class="stat-card" [style.border-left-color]="card.color">
              <mat-card-content>
                <div class="stat-icon" [style.background]="card.color + '22'">
                  <mat-icon [style.color]="card.color">{{ card.icon }}</mat-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ card.value }}</div>
                  <div class="stat-label">{{ card.label }}</div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }

      @if (auth.hasRole('STUDENT') && !loading) {
        @if (!auth.currentUser()?.profileId) {
          <p class="empty-hint">No student profile is linked to this account yet. Contact admin.</p>
        } @else {
          <div class="stats-grid">
            <mat-card class="stat-card" style="border-left-color:#1a237e">
              <mat-card-content>
                <div class="stat-icon" style="background:#1a237e22"><mat-icon style="color:#1a237e">event_available</mat-icon></div>
                <div class="stat-info">
                  <div class="stat-value">{{ attendancePct }}%</div>
                  <div class="stat-label">Attendance</div>
                </div>
              </mat-card-content>
            </mat-card>
            <mat-card class="stat-card" style="border-left-color:#388e3c">
              <mat-card-content>
                <div class="stat-icon" style="background:#388e3c22"><mat-icon style="color:#388e3c">school</mat-icon></div>
                <div class="stat-info">
                  <div class="stat-value">{{ gpa }}</div>
                  <div class="stat-label">Current GPA</div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .dashboard { padding: 8px; }
    .page-title { font-size: 1.8rem; font-weight: 600; margin: 0 0 4px; color: #1a237e; }
    .welcome { color: #666; margin: 0 0 24px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .stat-card { border-left: 4px solid; border-radius: 8px !important; }
    mat-card-content { display: flex; align-items: center; gap: 16px; padding: 20px !important; }
    .stat-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .stat-value { font-size: 2rem; font-weight: 700; line-height: 1; }
    .stat-label { color: #666; font-size: 0.85rem; margin-top: 4px; }
    .empty-hint { color: #888; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = false;
  attendancePct = 0;
  gpa = '—';

  statCards: { label: string; icon: string; color: string; value: number }[] = [];

  constructor(public auth: AuthService, private reportService: ReportService, private gradeService: GradeService) {}

  ngOnInit(): void {
    if (this.auth.hasRole('ADMIN')) {
      this.loading = true;
      this.reportService.getDashboard().subscribe({
        next: (s) => {
          this.stats = s;
          this.statCards = [
            { label: 'Total Students',    icon: 'people',    color: '#1a237e', value: s.totalStudents },
            { label: 'Total Faculty',     icon: 'person_pin',color: '#00897b', value: s.totalFaculty },
            { label: 'Total Courses',     icon: 'menu_book', color: '#f57c00', value: s.totalCourses },
            { label: 'Departments',       icon: 'business',  color: '#7b1fa2', value: s.totalDepartments },
            { label: 'Payments Received', icon: 'payments',  color: '#388e3c', value: s.totalPayments },
          ];
          this.loading = false;
        },
        error: () => this.loading = false
      });
    } else if (this.auth.hasRole('STUDENT')) {
      const studentId = this.auth.currentUser()?.profileId;
      if (studentId) {
        this.reportService.getAttendanceReport(studentId).subscribe(r => this.attendancePct = Math.round(r.percentage));
        this.gradeService.getByStudent(studentId).subscribe(grades => {
          const valid = grades.filter(g => g.grade && GRADE_POINTS[g.grade] !== undefined);
          this.gpa = valid.length
            ? (valid.reduce((sum, g) => sum + GRADE_POINTS[g.grade!], 0) / valid.length).toFixed(2)
            : '—';
        });
      }
    }
  }
}
