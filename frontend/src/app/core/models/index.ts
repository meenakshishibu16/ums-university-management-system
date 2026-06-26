// ============================================================
// Core Models
// ============================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  userId: number;
  profileId?: number;
}

export interface User {
  userId: number;
  username: string;
  email: string;
  role: Role;
  status: string;
}

export interface Role {
  roleId: number;
  roleName: string;
}

export interface Student {
  studentId: number;
  userId: number;
  username: string;
  email: string;
  name: string;
  dob?: string;
  gender?: string;
  contact?: string;
  departmentId?: number;
  departmentName?: string;
  enrollmentYear?: number;
  academicStatus: string;
}

export interface Faculty {
  facultyId: number;
  userId: number;
  username: string;
  email: string;
  name: string;
  qualification?: string;
  departmentId?: number;
  departmentName?: string;
  contact?: string;
}

export interface Department {
  departmentId: number;
  departmentName: string;
  hodId?: number;
  hodName?: string;
}

export interface Course {
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  semester?: string;
  departmentId?: number;
  departmentName?: string;
}

export interface Attendance {
  attendanceId: number;
  studentId: number;
  studentName: string;
  courseId: number;
  courseName: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface Grade {
  gradeId: number;
  studentId: number;
  studentName: string;
  courseId: number;
  courseName: string;
  semester: string;
  marks?: number;
  grade?: string;
}

export interface Enrollment {
  id: number;
  studentId: number;
  studentName: string;
  studentUsername: string;
  courseId: number;
  courseName: string;
  semester: string;
  status: string;
}

export interface FeeStructure {
  feeId: number;
  departmentId?: number;
  departmentName?: string;
  semester: string;
  amount: number;
  description?: string;
}

export interface Payment {
  paymentId: number;
  studentId: number;
  studentName: string;
  amount: number;
  paymentDate: string;
  method?: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
  receiptNo?: string;
}

export interface Timetable {
  id: number;
  courseId: number;
  courseName: string;
  courseCode: string;
  facultyId: number;
  facultyName: string;
  room?: string;
  day: string;
  startTime: string;
  endTime: string;
  semester: string;
}

export interface Notification {
  notificationId: number;
  title: string;
  message: string;
  targetRole?: string;
  createdBy: string;
  createdDate: string;
  read?: boolean;
}

export interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  totalDepartments: number;
  totalPayments: number;
}

export interface ApiPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
