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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StudentService, DepartmentService } from '../../../core/services/api.services';
import { Department } from '../../../core/models';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule,
    MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">{{ isEdit ? 'Edit Student' : 'Add Student' }}</h2>
        <p class="subtitle">{{ isEdit ? 'Update student information' : 'Register a new student' }}</p>
      </div>
      <a mat-stroked-button routerLink="/students"><mat-icon>arrow_back</mat-icon> Back</a>
    </div>

    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            @if (!isEdit) {
              <mat-form-field appearance="outline">
                <mat-label>Username</mat-label>
                <input matInput formControlName="username">
                <mat-error>Required</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email">
                <mat-error>Valid email required</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Password</mat-label>
                <input matInput formControlName="password" type="password">
                <mat-error>Min 8 characters</mat-error>
              </mat-form-field>
            }

            <mat-form-field appearance="outline">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name">
              <mat-error>Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date of Birth</mat-label>
              <input matInput [matDatepicker]="dob" formControlName="dob">
              <mat-datepicker-toggle matIconSuffix [for]="dob"></mat-datepicker-toggle>
              <mat-datepicker #dob></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Gender</mat-label>
              <mat-select formControlName="gender">
                <mat-option value="MALE">Male</mat-option>
                <mat-option value="FEMALE">Female</mat-option>
                <mat-option value="OTHER">Other</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Contact</mat-label>
              <input matInput formControlName="contact">
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

            <mat-form-field appearance="outline">
              <mat-label>Enrollment Year</mat-label>
              <input matInput formControlName="enrollmentYear" type="number">
            </mat-form-field>

            @if (isEdit) {
              <mat-form-field appearance="outline">
                <mat-label>Academic Status</mat-label>
                <mat-select formControlName="academicStatus">
                  <mat-option value="ACTIVE">Active</mat-option>
                  <mat-option value="GRADUATED">Graduated</mat-option>
                  <mat-option value="SUSPENDED">Suspended</mat-option>
                  <mat-option value="DROPPED">Dropped</mat-option>
                </mat-select>
              </mat-form-field>
            }
          </div>

          @if (errorMsg) {
            <div class="error-banner">{{ errorMsg }}</div>
          }

          <div class="form-actions">
            <a mat-stroked-button routerLink="/students">Cancel</a>
            <button mat-raised-button color="primary" type="submit" [disabled]="loading || form.invalid">
              @if (loading) { <mat-spinner diameter="20"></mat-spinner> }
              @else { {{ isEdit ? 'Update' : 'Create' }} Student }
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-title { font-size: 1.8rem; font-weight: 600; margin: 0; color: #1a237e; }
    .subtitle { color: #666; margin: 4px 0 0; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 8px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
    .error-banner { background: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin: 16px 0; }
  `]
})
export class StudentFormComponent implements OnInit {
  isEdit = false;
  studentId: number | null = null;
  loading = false;
  errorMsg = '';
  departments: Department[] = [];

  form = this.fb.group({
    username: [''],
    email: ['', Validators.email],
    password: [''],
    name: ['', Validators.required],
    dob: [null as any],
    gender: [''],
    contact: [''],
    departmentId: [null as number | null],
    enrollmentYear: [null as number | null],
    academicStatus: ['ACTIVE']
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private deptService: DepartmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.deptService.getAll().subscribe(d => this.departments = d);

    this.studentId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
    this.isEdit = this.route.snapshot.url.some(s => s.path === 'edit');

    if (!this.isEdit) {
      this.form.get('username')!.setValidators(Validators.required);
      this.form.get('email')!.setValidators([Validators.required, Validators.email]);
      this.form.get('password')!.setValidators([Validators.required, Validators.minLength(8)]);
    }

    if (this.isEdit && this.studentId) {
      this.studentService.getById(this.studentId).subscribe(s => {
        this.form.patchValue({
          name: s.name, gender: s.gender ?? '', contact: s.contact ?? '',
          departmentId: s.departmentId ?? null, enrollmentYear: s.enrollmentYear ?? null,
          academicStatus: s.academicStatus
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';

    const val = this.form.value;
    const obs = this.isEdit && this.studentId
      ? this.studentService.update(this.studentId, val as any)
      : this.studentService.create(val as any);

    obs.subscribe({
      next: () => {
        this.snackBar.open(`Student ${this.isEdit ? 'updated' : 'created'} successfully`, 'Close', { duration: 3000 });
        this.router.navigate(['/students']);
      },
      error: (err) => { this.errorMsg = err.error?.message ?? 'Operation failed'; this.loading = false; }
    });
  }
}
