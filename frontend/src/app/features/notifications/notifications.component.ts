import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { Notification } from '../../core/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <div><h2 class="page-title">Notifications</h2><p class="subtitle">Announcements and messages</p></div>
    </div>

    @if (auth.hasRole('ADMIN', 'FACULTY')) {
      <mat-card class="mb-16">
        <mat-card-header><mat-card-title>Create Announcement</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Message</mat-label>
              <textarea matInput formControlName="message" rows="3"></textarea>
            </mat-form-field>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Target Audience</mat-label>
                <mat-select formControlName="targetRoleId">
                  <mat-option [value]="null">Everyone</mat-option>
                  <mat-option [value]="3">Faculty</mat-option>
                  <mat-option [value]="4">Students</mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || sending">
                {{ sending ? 'Sending...' : 'Send Notification' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }

    @if (loading) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }

    <div class="notifications-list">
      @for (n of notifications; track n.notificationId) {
        <mat-card class="notif-card">
          <mat-card-content>
            <div class="notif-header">
              <mat-icon class="notif-icon">campaign</mat-icon>
              <div class="notif-body">
                <div class="notif-title">{{ n.title }}</div>
                <div class="notif-message">{{ n.message }}</div>
                <div class="notif-meta">
                  <span>{{ n.createdBy }}</span>
                  <span>·</span>
                  <span>{{ n.createdDate | date:'medium' }}</span>
                  @if (n.targetRole) { <span>· For: {{ n.targetRole }}</span> }
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }
      @empty {
        <div class="empty-state">
          <mat-icon>notifications_none</mat-icon>
          <p>No notifications yet</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
    .page-title{font-size:1.8rem;font-weight:600;margin:0;color:#1a237e}.subtitle{color:#666;margin:4px 0 0}
    .mb-16{margin-bottom:16px}
    .full-width{width:100%;margin-bottom:8px}
    .form-row{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap}
    .form-row mat-form-field{flex:1;min-width:200px}
    .notifications-list{display:flex;flex-direction:column;gap:12px}
    .notif-card{border-left:4px solid #1a237e!important}
    mat-card-content{padding:16px!important}
    .notif-header{display:flex;gap:16px;align-items:flex-start}
    .notif-icon{color:#1a237e;font-size:2rem;width:2rem;height:2rem;margin-top:2px}
    .notif-title{font-weight:600;font-size:1rem;margin-bottom:4px}
    .notif-message{color:#444;line-height:1.5;margin-bottom:8px}
    .notif-meta{font-size:0.8rem;color:#888;display:flex;gap:8px}
    .empty-state{text-align:center;padding:60px;color:#aaa}
    .empty-state mat-icon{font-size:4rem;width:4rem;height:4rem;display:block;margin:0 auto 16px}
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = false;
  sending = false;

  form = this.fb.group({
    title: ['', Validators.required],
    message: ['', Validators.required],
    targetRoleId: [null as number | null]
  });

  constructor(private fb: FormBuilder, private notifService: NotificationService, public auth: AuthService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loading = true;
    this.notifService.getAll().subscribe({ next: n => { this.notifications = n.reverse(); this.loading = false; }, error: () => this.loading = false });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.sending = true;
    this.notifService.create(this.form.value as any).subscribe({
      next: (n) => { this.notifications.unshift(n); this.form.reset(); this.sending = false; this.snackBar.open('Notification sent', 'Close', { duration: 3000 }); },
      error: () => { this.sending = false; this.snackBar.open('Failed', 'Close', { duration: 3000 }); }
    });
  }
}
