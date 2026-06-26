import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TimetableService, CourseService, FacultyService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { Timetable, Course, Faculty } from '../../core/models';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <div><h2 class="page-title">Timetable</h2><p class="subtitle">Class schedule management</p></div>
    </div>

    @if (auth.hasRole('ADMIN')) {
      <mat-card class="mb-16">
        <mat-card-header><mat-card-title>Add Schedule</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="addEntry()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Course</mat-label>
                <mat-select formControlName="courseId">
                  @for (c of courses; track c.courseId) { <mat-option [value]="c.courseId">{{ c.courseCode }}</mat-option> }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Faculty</mat-label>
                <mat-select formControlName="facultyId">
                  @for (f of faculty; track f.facultyId) { <mat-option [value]="f.facultyId">{{ f.name }}</mat-option> }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Day</mat-label>
                <mat-select formControlName="day">
                  @for (d of days; track d) { <mat-option [value]="d">{{ d }}</mat-option> }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Start Time</mat-label>
                <input matInput formControlName="startTime" type="time">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>End Time</mat-label>
                <input matInput formControlName="endTime" type="time">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Room</mat-label>
                <input matInput formControlName="room">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Semester</mat-label>
                <input matInput formControlName="semester">
              </mat-form-field>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Add</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }

    <!-- Weekly Grid View -->
    <div class="timetable-grid">
      @for (day of days; track day) {
        @if (getByDay(day).length > 0) {
          <div class="day-column">
            <div class="day-header">{{ day }}</div>
            @for (entry of getByDay(day); track entry.id) {
              <div class="timetable-card">
                <div class="time">{{ entry.startTime }} – {{ entry.endTime }}</div>
                <div class="course-name">{{ entry.courseName }}</div>
                <div class="meta">{{ entry.facultyName }} · {{ entry.room ?? 'No room' }}</div>
                @if (auth.hasRole('ADMIN')) {
                  <button mat-icon-button class="delete-btn" (click)="deleteEntry(entry.id)" matTooltip="Delete">
                    <mat-icon>close</mat-icon>
                  </button>
                }
              </div>
            }
          </div>
        }
      }
    </div>

    @if (loading) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }

    <!-- Table View -->
    <mat-card class="mt-16">
      <mat-card-content>
        <table mat-table [dataSource]="timetable" class="full-width">
          <ng-container matColumnDef="day"><th mat-header-cell *matHeaderCellDef>Day</th><td mat-cell *matCellDef="let t">{{ t.day }}</td></ng-container>
          <ng-container matColumnDef="time"><th mat-header-cell *matHeaderCellDef>Time</th><td mat-cell *matCellDef="let t">{{ t.startTime }} – {{ t.endTime }}</td></ng-container>
          <ng-container matColumnDef="course"><th mat-header-cell *matHeaderCellDef>Course</th><td mat-cell *matCellDef="let t">{{ t.courseCode }} – {{ t.courseName }}</td></ng-container>
          <ng-container matColumnDef="faculty"><th mat-header-cell *matHeaderCellDef>Faculty</th><td mat-cell *matCellDef="let t">{{ t.facultyName }}</td></ng-container>
          <ng-container matColumnDef="room"><th mat-header-cell *matHeaderCellDef>Room</th><td mat-cell *matCellDef="let t">{{ t.room ?? '—' }}</td></ng-container>
          <ng-container matColumnDef="semester"><th mat-header-cell *matHeaderCellDef>Semester</th><td mat-cell *matCellDef="let t">{{ t.semester }}</td></ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let r; columns: cols;"></tr>
          <tr *matNoDataRow><td class="no-data" colspan="6">No timetable entries</td></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
    .page-title{font-size:1.8rem;font-weight:600;margin:0;color:#1a237e}.subtitle{color:#666;margin:4px 0 0}
    .mb-16{margin-bottom:16px}.mt-16{margin-top:16px}
    .form-row{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-start}
    .form-row mat-form-field{flex:1;min-width:130px}
    .timetable-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:16px}
    .day-column{background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.1)}
    .day-header{background:#1a237e;color:#fff;padding:8px 12px;font-weight:600;font-size:0.85rem}
    .timetable-card{padding:10px 12px;border-bottom:1px solid #eee;position:relative}
    .time{font-size:0.75rem;color:#888}
    .course-name{font-weight:600;font-size:0.9rem;margin:2px 0}
    .meta{font-size:0.75rem;color:#666}
    .delete-btn{position:absolute;top:4px;right:4px;width:24px;height:24px;line-height:24px}
    .full-width{width:100%}
    .no-data{text-align:center;padding:40px;color:#999}
  `]
})
export class TimetableComponent implements OnInit {
  timetable: Timetable[] = [];
  courses: Course[] = [];
  faculty: Faculty[] = [];
  days = DAYS;
  cols = ['day', 'time', 'course', 'faculty', 'room', 'semester'];
  loading = false;

  form = this.fb.group({
    courseId: [null as number | null, Validators.required],
    facultyId: [null as number | null, Validators.required],
    day: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    room: [''], semester: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private ttService: TimetableService, private courseService: CourseService, private facultyService: FacultyService, public auth: AuthService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.courseService.getAll().subscribe(c => this.courses = c);
    this.facultyService.getAll().subscribe(f => this.faculty = f);
    this.load();
  }

  load(): void {
    this.loading = true;
    this.ttService.getAll().subscribe({ next: t => { this.timetable = t; this.loading = false; }, error: () => this.loading = false });
  }

  getByDay(day: string): Timetable[] {
    return this.timetable.filter(t => t.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  addEntry(): void {
    this.ttService.create(this.form.value as any).subscribe({
      next: (t) => { this.timetable.push(t); this.form.reset(); this.snackBar.open('Entry added', 'Close', { duration: 3000 }); },
      error: e => this.snackBar.open(e.error?.message ?? 'Failed', 'Close', { duration: 3000 })
    });
  }

  deleteEntry(id: number): void {
    if (!confirm('Delete this schedule?')) return;
    this.ttService.delete(id).subscribe({
      next: () => { this.timetable = this.timetable.filter(t => t.id !== id); this.snackBar.open('Deleted', 'Close', { duration: 3000 }); },
      error: () => this.snackBar.open('Failed', 'Close', { duration: 3000 })
    });
  }
}
