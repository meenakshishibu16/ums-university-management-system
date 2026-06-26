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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FacultyService, DepartmentService } from '../../../core/services/api.services';
import { Department } from '../../../core/models';

@Component({
  selector: 'app-faculty-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? 'Edit Faculty' : 'Add Faculty' }}</h2>
      <a mat-stroked-button routerLink="/faculty"><mat-icon>arrow_back</mat-icon> Back</a>
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
              <mat-label>Qualification</mat-label>
              <input matInput formControlName="qualification">
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
          </div>
          @if (errorMsg) { <div class="error-banner">{{ errorMsg }}</div> }
          <div class="form-actions">
            <a mat-stroked-button routerLink="/faculty">Cancel</a>
            <button mat-raised-button color="primary" type="submit" [disabled]="loading || form.invalid">
              @if (loading) { <mat-spinner diameter="20"></mat-spinner> }
              @else { {{ isEdit ? 'Update' : 'Create' }} }
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-title { font-size: 1.8rem; font-weight: 600; margin: 0; color: #1a237e; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 8px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
    .error-banner { background: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin: 16px 0; }
  `]
})
export class FacultyFormComponent implements OnInit {
  isEdit = false;
  facultyId: number | null = null;
  loading = false;
  errorMsg = '';
  departments: Department[] = [];

  form = this.fb.group({
    username: [''], email: ['', Validators.email], password: [''],
    name: ['', Validators.required], qualification: [''],
    contact: [''], departmentId: [null as number | null]
  });

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router,
    private facultyService: FacultyService, private deptService: DepartmentService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.deptService.getAll().subscribe(d => this.departments = d);
    this.facultyId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
    this.isEdit = !!this.facultyId;
    if (!this.isEdit) {
      this.form.get('username')!.setValidators(Validators.required);
      this.form.get('password')!.setValidators([Validators.required, Validators.minLength(8)]);
    }
    if (this.isEdit && this.facultyId) {
      this.facultyService.getById(this.facultyId).subscribe(f =>
        this.form.patchValue({ name: f.name, qualification: f.qualification ?? '', contact: f.contact ?? '', departmentId: f.departmentId ?? null }));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const obs = this.isEdit && this.facultyId
      ? this.facultyService.update(this.facultyId, this.form.value as any)
      : this.facultyService.create(this.form.value);
    obs.subscribe({
      next: () => { this.snackBar.open('Saved', 'Close', { duration: 3000 }); this.router.navigate(['/faculty']); },
      error: (err) => { this.errorMsg = err.error?.message ?? 'Operation failed'; this.loading = false; }
    });
  }
}
