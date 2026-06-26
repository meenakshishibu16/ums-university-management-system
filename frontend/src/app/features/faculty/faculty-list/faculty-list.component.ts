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
import { FacultyService } from '../../../core/services/api.services';
import { Faculty } from '../../../core/models';

@Component({
  selector: 'app-faculty-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatCardModule, MatButtonModule,
    MatIconModule, MatProgressBarModule, MatTooltipModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Faculty</h2>
        <p class="subtitle">Manage faculty members</p>
      </div>
      <a mat-raised-button color="primary" routerLink="/faculty/new">
        <mat-icon>add</mat-icon> Add Faculty
      </a>
    </div>

    <mat-card>
      <mat-card-content>
        @if (loading) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }
        <table mat-table [dataSource]="faculty" class="full-width">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let f">
              <div class="name">{{ f.name }}</div>
              <div class="email">{{ f.email }}</div>
            </td>
          </ng-container>
          <ng-container matColumnDef="qualification">
            <th mat-header-cell *matHeaderCellDef>Qualification</th>
            <td mat-cell *matCellDef="let f">{{ f.qualification ?? '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="department">
            <th mat-header-cell *matHeaderCellDef>Department</th>
            <td mat-cell *matCellDef="let f">{{ f.departmentName ?? '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="contact">
            <th mat-header-cell *matHeaderCellDef>Contact</th>
            <td mat-cell *matCellDef="let f">{{ f.contact ?? '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let f">
              <a mat-icon-button [routerLink]="['/faculty', f.facultyId, 'edit']" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </a>
              <button mat-icon-button color="warn" (click)="confirmDelete(f)" matTooltip="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let r; columns: cols;"></tr>
          <tr *matNoDataRow><td class="no-data" colspan="5">No faculty found</td></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-title { font-size: 1.8rem; font-weight: 600; margin: 0; color: #1a237e; }
    .subtitle { color: #666; margin: 4px 0 0; }
    .full-width { width: 100%; }
    .name { font-weight: 500; }
    .email { font-size: 0.8rem; color: #666; }
    .no-data { text-align: center; padding: 40px; color: #999; }
  `]
})
export class FacultyListComponent implements OnInit {
  faculty: Faculty[] = [];
  cols = ['name', 'qualification', 'department', 'contact', 'actions'];
  loading = false;

  constructor(private facultyService: FacultyService, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.facultyService.getAll().subscribe({ next: d => { this.faculty = d; this.loading = false; }, error: () => this.loading = false });
  }

  confirmDelete(f: Faculty): void {
    if (!confirm(`Delete faculty "${f.name}"?`)) return;
    this.facultyService.delete(f.facultyId).subscribe({
      next: () => { this.snackBar.open('Faculty deleted', 'Close', { duration: 3000 }); this.load(); },
      error: () => this.snackBar.open('Delete failed', 'Close', { duration: 3000 })
    });
  }
}
