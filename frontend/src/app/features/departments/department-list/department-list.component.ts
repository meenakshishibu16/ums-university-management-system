import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DepartmentService } from '../../../core/services/api.services';
import { Department } from '../../../core/models';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Departments</h2>
        <p class="subtitle">Manage university departments</p>
      </div>
      <a mat-raised-button color="primary" routerLink="/departments/new">
        <mat-icon>add</mat-icon> Add Department
      </a>
    </div>
    <mat-card>
      <mat-card-content>
        @if (loading) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }
        <table mat-table [dataSource]="departments" class="full-width">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Department Name</th>
            <td mat-cell *matCellDef="let d">{{ d.departmentName }}</td>
          </ng-container>
          <ng-container matColumnDef="hod">
            <th mat-header-cell *matHeaderCellDef>Head of Department</th>
            <td mat-cell *matCellDef="let d">{{ d.hodName ?? '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let d">
              <a mat-icon-button [routerLink]="['/departments', d.departmentId, 'edit']" matTooltip="Edit"><mat-icon>edit</mat-icon></a>
              <button mat-icon-button color="warn" (click)="confirmDelete(d)" matTooltip="Delete"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let r; columns: cols;"></tr>
          <tr *matNoDataRow><td class="no-data" colspan="3">No departments found</td></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}.page-title{font-size:1.8rem;font-weight:600;margin:0;color:#1a237e}.subtitle{color:#666;margin:4px 0 0}.full-width{width:100%}.no-data{text-align:center;padding:40px;color:#999}`]
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  cols = ['name', 'hod', 'actions'];
  loading = false;
  constructor(private deptService: DepartmentService, private snackBar: MatSnackBar) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    this.deptService.getAll().subscribe({ next: d => { this.departments = d; this.loading = false; }, error: () => this.loading = false });
  }
  confirmDelete(d: Department): void {
    if (!confirm(`Delete department "${d.departmentName}"?`)) return;
    this.deptService.delete(d.departmentId).subscribe({
      next: () => { this.snackBar.open('Deleted', 'Close', { duration: 3000 }); this.load(); },
      error: () => this.snackBar.open('Delete failed', 'Close', { duration: 3000 })
    });
  }
}
