import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CourseService, DepartmentService } from '../../../core/services/api.services';
import { Department } from '../../../core/models';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? 'Edit Course' : 'Add Course' }}</h2>
      <a mat-stroked-button routerLink="/courses"><mat-icon>arrow_back</mat-icon> Back</a>
    </div>
    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Course Code</mat-label>
              <input matInput formControlName="courseCode">
              <mat-error>Required</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Course Name</mat-label>
              <input matInput formControlName="courseName">
              <mat-error>Required</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Credits</mat-label>
              <input matInput formControlName="credits" type="number">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Semester</mat-label>
              <input matInput formControlName="semester" placeholder="e.g. 2024-ODD">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Department</mat-label>
              <mat-select formControlName="departmentId">
                <mat-option [value]="null">None</mat-option>
                @for (d of departments; track d.departmentId) {
                  <mat-option [value]="d.departmentId">{{ d.departmentName }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-actions">
            <a mat-stroked-button routerLink="/courses">Cancel</a>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">{{ isEdit ? 'Update' : 'Create' }}</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.page-title{font-size:1.8rem;font-weight:600;margin:0;color:#1a237e}.form-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:8px}.form-actions{display:flex;gap:12px;justify-content:flex-end;margin-top:24px}`]
})
export class CourseFormComponent implements OnInit {
  isEdit = false; courseId: number | null = null; departments: Department[] = [];
  form = this.fb.group({ courseCode: ['', Validators.required], courseName: ['', Validators.required], credits: [3], semester: [''], departmentId: [null as number | null] });
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private courseService: CourseService, private deptService: DepartmentService, private snackBar: MatSnackBar) {}
  ngOnInit(): void {
    this.deptService.getAll().subscribe(d => this.departments = d);
    this.courseId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
    this.isEdit = !!this.courseId;
    if (this.isEdit && this.courseId) {
      this.courseService.getById(this.courseId).subscribe(c => this.form.patchValue({ courseCode: c.courseCode, courseName: c.courseName, credits: c.credits, semester: c.semester ?? '', departmentId: c.departmentId ?? null }));
    }
  }
  onSubmit(): void {
    const obs = this.isEdit && this.courseId ? this.courseService.update(this.courseId, this.form.value as any) : this.courseService.create(this.form.value as any);
    obs.subscribe({ next: () => { this.snackBar.open('Saved', 'Close', { duration: 3000 }); this.router.navigate(['/courses']); }, error: e => this.snackBar.open(e.error?.message ?? 'Failed', 'Close', { duration: 3000 }) });
  }
}
