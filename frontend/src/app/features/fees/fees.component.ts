import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FeeService, DepartmentService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { FeeStructure, Payment, Department } from '../../core/models';

@Component({
  selector: 'app-fees',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatTabsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressBarModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <div><h2 class="page-title">Fee Management</h2><p class="subtitle">Fee structures and payment records</p></div>
    </div>

    <mat-tab-group>
      <!-- Fee Structure Tab -->
      <mat-tab label="Fee Structure">
        <div class="tab-body">
          @if (auth.hasRole('ADMIN', 'FINANCE_OFFICER')) {
            <mat-card class="mb-16">
              <mat-card-header><mat-card-title>Add Fee Structure</mat-card-title></mat-card-header>
              <mat-card-content>
                <form [formGroup]="feeStructureForm" (ngSubmit)="addFeeStructure()">
                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Department</mat-label>
                      <mat-select formControlName="departmentId">
                        <mat-option [value]="null">All Departments</mat-option>
                        @for (d of departments; track d.departmentId) { <mat-option [value]="d.departmentId">{{ d.departmentName }}</mat-option> }
                      </mat-select>
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Semester</mat-label>
                      <input matInput formControlName="semester">
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Amount (₹)</mat-label>
                      <input matInput formControlName="amount" type="number">
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Description</mat-label>
                      <input matInput formControlName="description">
                    </mat-form-field>
                    <button mat-raised-button color="primary" type="submit" [disabled]="feeStructureForm.invalid">Add</button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          }
          <mat-card>
            <mat-card-content>
              @if (loadingStructure) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }
              <table mat-table [dataSource]="feeStructures" class="full-width">
                <ng-container matColumnDef="department"><th mat-header-cell *matHeaderCellDef>Department</th><td mat-cell *matCellDef="let f">{{ f.departmentName ?? 'All' }}</td></ng-container>
                <ng-container matColumnDef="semester"><th mat-header-cell *matHeaderCellDef>Semester</th><td mat-cell *matCellDef="let f">{{ f.semester }}</td></ng-container>
                <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef>Amount</th><td mat-cell *matCellDef="let f">₹{{ f.amount | number:'1.2-2' }}</td></ng-container>
                <ng-container matColumnDef="description"><th mat-header-cell *matHeaderCellDef>Description</th><td mat-cell *matCellDef="let f">{{ f.description ?? '—' }}</td></ng-container>
                <tr mat-header-row *matHeaderRowDef="feeStructureCols"></tr>
                <tr mat-row *matRowDef="let r; columns: feeStructureCols;"></tr>
                <tr *matNoDataRow><td class="no-data" colspan="4">No fee structures defined</td></tr>
              </table>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-tab>

      <!-- Payments Tab -->
      <mat-tab label="Payments">
        <div class="tab-body">
          @if (auth.hasRole('ADMIN', 'FINANCE_OFFICER')) {
            <mat-card class="mb-16">
              <mat-card-content>
                <mat-form-field appearance="outline">
                  <mat-label>Student ID</mat-label>
                  <input matInput [formControl]="studentIdCtrl" type="number">
                </mat-form-field>
                <button mat-raised-button color="primary" (click)="loadPayments()">View Payments</button>
              </mat-card-content>
            </mat-card>
          }

          @if (auth.hasRole('ADMIN', 'FINANCE_OFFICER', 'STUDENT') && studentIdCtrl.value) {
            <mat-card class="mb-16">
              <mat-card-header><mat-card-title>Record Payment</mat-card-title></mat-card-header>
              <mat-card-content>
                <form [formGroup]="paymentForm" (ngSubmit)="recordPayment()">
                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Amount (₹)</mat-label>
                      <input matInput formControlName="amount" type="number">
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Payment Method</mat-label>
                      <mat-select formControlName="method">
                        <mat-option value="CASH">Cash</mat-option>
                        <mat-option value="BANK_TRANSFER">Bank Transfer</mat-option>
                        <mat-option value="ONLINE">Online</mat-option>
                        <mat-option value="DD">Demand Draft</mat-option>
                      </mat-select>
                    </mat-form-field>
                    <button mat-raised-button color="primary" type="submit" [disabled]="paymentForm.invalid">Record Payment</button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          }

          <mat-card>
            <mat-card-content>
              @if (loadingPayments) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }
              <table mat-table [dataSource]="payments" class="full-width">
                <ng-container matColumnDef="receipt"><th mat-header-cell *matHeaderCellDef>Receipt No</th><td mat-cell *matCellDef="let p">{{ p.receiptNo ?? '—' }}</td></ng-container>
                <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef>Amount</th><td mat-cell *matCellDef="let p">₹{{ p.amount | number:'1.2-2' }}</td></ng-container>
                <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let p">{{ p.paymentDate }}</td></ng-container>
                <ng-container matColumnDef="method"><th mat-header-cell *matHeaderCellDef>Method</th><td mat-cell *matCellDef="let p">{{ p.method ?? '—' }}</td></ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let p"><span class="chip chip-{{ p.status.toLowerCase() }}">{{ p.status }}</span></td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="paymentCols"></tr>
                <tr mat-row *matRowDef="let r; columns: paymentCols;"></tr>
                <tr *matNoDataRow><td class="no-data" colspan="5">No payment records</td></tr>
              </table>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [`
    .page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
    .page-title{font-size:1.8rem;font-weight:600;margin:0;color:#1a237e}.subtitle{color:#666;margin:4px 0 0}
    .tab-body{padding:16px 0}
    .mb-16{margin-bottom:16px}
    .form-row{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start}
    .form-row mat-form-field{flex:1;min-width:160px}
    mat-card-content{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;padding:16px!important}
    .full-width{width:100%}
    .chip{padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:500}
    .chip-paid{background:#e8f5e9;color:#2e7d32}.chip-pending{background:#fff8e1;color:#f57f17}.chip-failed{background:#fce4ec;color:#c62828}
    .no-data{text-align:center;padding:40px;color:#999}
  `]
})
export class FeesComponent implements OnInit {
  feeStructures: FeeStructure[] = [];
  payments: Payment[] = [];
  departments: Department[] = [];
  feeStructureCols = ['department', 'semester', 'amount', 'description'];
  paymentCols = ['receipt', 'amount', 'date', 'method', 'status'];
  loadingStructure = false; loadingPayments = false;
  studentIdCtrl = new FormControl<number | null>(null);

  feeStructureForm = this.fb.group({ departmentId: [null as number | null], semester: ['', Validators.required], amount: [null as number | null, Validators.required], description: [''] });
  paymentForm = this.fb.group({ amount: [null as number | null, Validators.required], method: [''] });

  constructor(private fb: FormBuilder, private feeService: FeeService, private deptService: DepartmentService, public auth: AuthService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.deptService.getAll().subscribe(d => this.departments = d);
    this.loadingStructure = true;
    this.feeService.getFeeStructure().subscribe({ next: f => { this.feeStructures = f; this.loadingStructure = false; }, error: () => this.loadingStructure = false });
    if (this.auth.hasRole('STUDENT')) {
      const studentId = this.auth.currentUser()?.profileId;
      if (studentId) { this.studentIdCtrl.setValue(studentId); this.loadPayments(); }
    }
  }

  loadPayments(): void {
    const id = this.studentIdCtrl.value;
    if (!id) return;
    this.loadingPayments = true;
    this.feeService.getStudentPayments(id).subscribe({ next: p => { this.payments = p; this.loadingPayments = false; }, error: () => this.loadingPayments = false });
  }

  addFeeStructure(): void {
    this.feeService.createFeeStructure(this.feeStructureForm.value as any).subscribe({
      next: (f) => { this.feeStructures.unshift(f); this.feeStructureForm.reset(); this.snackBar.open('Fee structure added', 'Close', { duration: 3000 }); },
      error: e => this.snackBar.open(e.error?.message ?? 'Failed', 'Close', { duration: 3000 })
    });
  }

  recordPayment(): void {
    const studentId = this.studentIdCtrl.value;
    if (!studentId) return;
    const today = new Date().toISOString().split('T')[0];
    this.feeService.recordPayment({ ...this.paymentForm.value, studentId, paymentDate: today } as any).subscribe({
      next: (p) => { this.payments.unshift(p); this.paymentForm.reset(); this.snackBar.open(`Payment recorded. Receipt: ${p.receiptNo}`, 'Close', { duration: 5000 }); },
      error: e => this.snackBar.open(e.error?.message ?? 'Failed', 'Close', { duration: 3000 })
    });
  }
}
