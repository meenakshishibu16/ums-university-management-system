import { Component, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  roles: string[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="logo-area">
          <mat-icon>school</mat-icon>
          <span>UMS</span>
        </div>
        <mat-nav-list>
          @for (item of visibleNavItems(); track item.path) {
            <a mat-list-item [routerLink]="item.path" routerLinkActive="active-link">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          <span class="spacer"></span>
          <span class="user-name">{{ auth.currentUser()?.username }}</span>
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon> Profile
            </button>
            <button mat-menu-item (click)="auth.logout()">
              <mat-icon>logout</mat-icon> Logout
            </button>
          </mat-menu>
        </mat-toolbar>

        <div class="content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }
    .sidenav { width: 240px; background: #1a237e; color: white; }
    .logo-area {
      display: flex; align-items: center; gap: 12px;
      padding: 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.1);
      font-size: 1.3rem; font-weight: 700;
    }
    .logo-area mat-icon { font-size: 2rem; width: 2rem; height: 2rem; }
    mat-nav-list a { color: rgba(255,255,255,0.85) !important; border-radius: 8px; margin: 2px 8px; }
    mat-nav-list a:hover { background: rgba(255,255,255,0.1) !important; }
    .active-link { background: rgba(255,255,255,0.2) !important; color: white !important; }
    .toolbar { position: sticky; top: 0; z-index: 10; }
    .spacer { flex: 1; }
    .user-name { margin-right: 8px; font-size: 0.9rem; }
    .content { padding: 24px; background: #f5f7fa; min-height: calc(100vh - 64px); }
  `]
})
export class LayoutComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard',     icon: 'dashboard',      path: '/dashboard',     roles: ['ADMIN','FACULTY','STUDENT','ADMISSION_OFFICER','FINANCE_OFFICER'] },
    { label: 'Students',      icon: 'people',         path: '/students',      roles: ['ADMIN','ADMISSION_OFFICER','FACULTY'] },
    { label: 'Faculty',       icon: 'person_pin',     path: '/faculty',       roles: ['ADMIN'] },
    { label: 'Departments',   icon: 'business',       path: '/departments',   roles: ['ADMIN'] },
    { label: 'Courses',       icon: 'menu_book',      path: '/courses',       roles: ['ADMIN','FACULTY','STUDENT'] },
    { label: 'Attendance',    icon: 'fact_check',     path: '/attendance',    roles: ['ADMIN','FACULTY','STUDENT'] },
    { label: 'Grades',        icon: 'grade',          path: '/grades',        roles: ['ADMIN','FACULTY','STUDENT'] },
    { label: 'Fees',          icon: 'payments',       path: '/fees',          roles: ['ADMIN','FINANCE_OFFICER','STUDENT'] },
    { label: 'Timetable',     icon: 'schedule',       path: '/timetable',     roles: ['ADMIN','FACULTY','STUDENT'] },
    { label: 'Notifications', icon: 'notifications',  path: '/notifications', roles: ['ADMIN','FACULTY','STUDENT','ADMISSION_OFFICER','FINANCE_OFFICER'] },
    { label: 'Reports',       icon: 'assessment',     path: '/reports',       roles: ['ADMIN','ADMISSION_OFFICER','FINANCE_OFFICER'] },
  ];

  visibleNavItems = computed(() => {
    const role = this.auth.getRole();
    return this.navItems.filter(item => role && item.roles.includes(role));
  });

  constructor(public auth: AuthService) {}
}
