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
import { DepartmentService, FacultyService } from '../../../core/services/api.services';
import { Faculty } from '../../../core/models';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? 'Edit Department' : 'Add Department' }}</h2>
      <a mat-stroked-button routerLink="/departments"><mat-icon>arrow_back</mat-icon> Back</a>
    </div>
    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Department Name</mat-label>
              <input matInput formControlName="departmentName">
              <mat-error>Required</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Head of Department</mat-label>
              <mat-select formControlName="hodId">
                <mat-option [value]="null">None</mat-option>
                @for (f of faculty; track f.facultyId) {
                  <mat-option [value]="f.facultyId">{{ f.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-actions">
            <a mat-stroked-button routerLink="/departments">Cancel</a>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
              {{ isEdit ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.page-title{font-size:1.8rem;font-weight:600;margin:0;color:#1a237e}.form-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:8px}.form-actions{display:flex;gap:12px;justify-content:flex-end;margin-top:24px}`]
})
export class DepartmentFormComponent implements OnInit {
  isEdit = false; deptId: number | null = null;
  faculty: Faculty[] = [];
  form = this.fb.group({ departmentName: ['', Validators.required], hodId: [null as number | null] });
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router,
    private deptService: DepartmentService, private facultyService: FacultyService, private snackBar: MatSnackBar) {}
  ngOnInit(): void {
    this.facultyService.getAll().subscribe(f => this.faculty = f);
    this.deptId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
    this.isEdit = !!this.deptId;
    if (this.isEdit && this.deptId) {
      this.deptService.getById(this.deptId).subscribe(d => this.form.patchValue({ departmentName: d.departmentName, hodId: d.hodId ?? null }));
    }
  }
  onSubmit(): void {
    if (this.form.invalid) return;
    const obs = this.isEdit && this.deptId ? this.deptService.update(this.deptId, this.form.value as any) : this.deptService.create(this.form.value as any);
    obs.subscribe({ next: () => { this.snackBar.open('Saved', 'Close', { duration: 3000 }); this.router.navigate(['/departments']); }, error: (e) => this.snackBar.open(e.error?.message ?? 'Failed', 'Close', { duration: 3000 }) });
  }
}
