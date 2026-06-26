import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Student, Faculty, Department, Course, Attendance,
  Grade, FeeStructure, Payment, Timetable, Notification, DashboardStats, Enrollment
} from '../models';

const API = environment.apiUrl;

// ============================================================
// Student Service
// ============================================================
@Injectable({ providedIn: 'root' })
export class StudentService {
  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20, search = ''): Observable<Student[]> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<Student[]>(`${API}/students`, { params });
  }

  getById(id: number): Observable<Student> {
    return this.http.get<Student>(`${API}/students/${id}`);
  }

  create(data: Partial<Student> & { password: string; username: string; email: string }): Observable<Student> {
    return this.http.post<Student>(`${API}/students`, data);
  }

  update(id: number, data: Partial<Student>): Observable<Student> {
    return this.http.put<Student>(`${API}/students/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/students/${id}`);
  }
}

// ============================================================
// Faculty Service
// ============================================================
@Injectable({ providedIn: 'root' })
export class FacultyService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Faculty[]> {
    return this.http.get<Faculty[]>(`${API}/faculty`);
  }

  getById(id: number): Observable<Faculty> {
    return this.http.get<Faculty>(`${API}/faculty/${id}`);
  }

  create(data: any): Observable<Faculty> {
    return this.http.post<Faculty>(`${API}/faculty`, data);
  }

  update(id: number, data: Partial<Faculty>): Observable<Faculty> {
    return this.http.put<Faculty>(`${API}/faculty/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/faculty/${id}`);
  }
}

// ============================================================
// Department Service
// ============================================================
@Injectable({ providedIn: 'root' })
export class DepartmentService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(`${API}/departments`);
  }

  getById(id: number): Observable<Department> {
    return this.http.get<Department>(`${API}/departments/${id}`);
  }

  create(data: Partial<Department>): Observable<Department> {
    return this.http.post<Department>(`${API}/departments`, data);
  }

  update(id: number, data: Partial<Department>): Observable<Department> {
    return this.http.put<Department>(`${API}/departments/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/departments/${id}`);
  }
}

// ============================================================
// Course Service
// ============================================================
@Injectable({ providedIn: 'root' })
export class CourseService {
  constructor(private http: HttpClient) {}

  getAll(departmentId?: number): Observable<Course[]> {
    let params = new HttpParams();
    if (departmentId) params = params.set('departmentId', departmentId);
    return this.http.get<Course[]>(`${API}/courses`, { params });
  }

  getById(id: number): Observable<Course> {
    return this.http.get<Course>(`${API}/courses/${id}`);
  }

  create(data: Partial<Course>): Observable<Course> {
    return this.http.post<Course>(`${API}/courses`, data);
  }

  update(id: number, data: Partial<Course>): Observable<Course> {
    return this.http.put<Course>(`${API}/courses/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/courses/${id}`);
  }
}

// ============================================================
// Attendance Service
// ============================================================
@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(private http: HttpClient) {}

  getByStudent(studentId: number, courseId?: number): Observable<Attendance[]> {
    let params = new HttpParams();
    if (courseId) params = params.set('courseId', courseId);
    return this.http.get<Attendance[]>(`${API}/attendance/student/${studentId}`, { params });
  }

  markAttendance(data: {
    courseId: number;
    date: string;
    entries: { studentId: number; status: string }[]
  }): Observable<any> {
    return this.http.post(`${API}/attendance`, data);
  }
}

// ============================================================
// Grade Service
// ============================================================
@Injectable({ providedIn: 'root' })
export class GradeService {
  constructor(private http: HttpClient) {}

  getByStudent(studentId: number): Observable<Grade[]> {
    return this.http.get<Grade[]>(`${API}/grades/student/${studentId}`);
  }

  getByCourse(courseId: number, semester?: string): Observable<Grade[]> {
    let params = new HttpParams();
    if (semester) params = params.set('semester', semester);
    return this.http.get<Grade[]>(`${API}/grades/course/${courseId}`, { params });
  }

  create(data: Partial<Grade>): Observable<Grade> {
    return this.http.post<Grade>(`${API}/grades`, data);
  }

  update(id: number, data: Partial<Grade>): Observable<Grade> {
    return this.http.put<Grade>(`${API}/grades/${id}`, data);
  }
}

// ============================================================
// Enrollment Service
// ============================================================
@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  constructor(private http: HttpClient) {}

  getRoster(courseId: number, semester?: string): Observable<Enrollment[]> {
    let params = new HttpParams();
    if (semester) params = params.set('semester', semester);
    return this.http.get<Enrollment[]>(`${API}/courses/${courseId}/students`, { params });
  }

  enroll(courseId: number, studentId: number, semester: string): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${API}/courses/${courseId}/students`, { studentId, semester });
  }

  unenroll(courseId: number, studentId: number, semester?: string): Observable<void> {
    let params = new HttpParams();
    if (semester) params = params.set('semester', semester);
    return this.http.delete<void>(`${API}/courses/${courseId}/students/${studentId}`, { params });
  }
}

// ============================================================
// Fee Service
// ============================================================
@Injectable({ providedIn: 'root' })
export class FeeService {
  constructor(private http: HttpClient) {}

  getFeeStructure(): Observable<FeeStructure[]> {
    return this.http.get<FeeStructure[]>(`${API}/fees/structure`);
  }

  createFeeStructure(data: Partial<FeeStructure>): Observable<FeeStructure> {
    return this.http.post<FeeStructure>(`${API}/fees/structure`, data);
  }

  getStudentPayments(studentId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${API}/fees/student/${studentId}`);
  }

  recordPayment(data: Partial<Payment> & { studentId: number }): Observable<Payment> {
    return this.http.post<Payment>(`${API}/fees/payments`, data);
  }
}

// ============================================================
// Timetable Service
// ============================================================
@Injectable({ providedIn: 'root' })
export class TimetableService {
  constructor(private http: HttpClient) {}

  getAll(semester?: string, facultyId?: number): Observable<Timetable[]> {
    let params = new HttpParams();
    if (semester) params = params.set('semester', semester);
    if (facultyId) params = params.set('facultyId', facultyId);
    return this.http.get<Timetable[]>(`${API}/timetable`, { params });
  }

  create(data: Partial<Timetable>): Observable<Timetable> {
    return this.http.post<Timetable>(`${API}/timetable`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/timetable/${id}`);
  }
}

// ============================================================
// Notification Service
// ============================================================
@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${API}/notifications`);
  }

  create(data: { title: string; message: string; targetRoleId?: number }): Observable<Notification> {
    return this.http.post<Notification>(`${API}/notifications`, data);
  }
}

// ============================================================
// Report Service
// ============================================================
@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${API}/reports/dashboard`);
  }

  getStudentReport(): Observable<any> {
    return this.http.get(`${API}/reports/students`);
  }

  getFeeReport(): Observable<any> {
    return this.http.get(`${API}/reports/fees`);
  }

  getAttendanceReport(studentId: number): Observable<any> {
    return this.http.get(`${API}/reports/attendance/${studentId}`);
  }
}
