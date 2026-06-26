# 🎓 University Management System (UMS)

A full-stack web application built with **Angular 17**, **Quarkus 3.9**, and **MySQL 8**.

---

## 📁 Project Structure

```
ums/
├── backend/                    # Quarkus REST API
│   ├── src/main/java/com/ums/
│   │   ├── entity/             # JPA entities (User, Student, Faculty, etc.)
│   │   ├── resource/           # REST endpoints (Controllers)
│   │   ├── dto/                # Data Transfer Objects
│   │   ├── security/           # JWT token service
│   │   └── exception/          # Global exception handler
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── generate-keys.sh        # JWT RSA key generator
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                   # Angular 17 SPA
│   └── src/app/
│       ├── core/
│       │   ├── models/         # TypeScript interfaces
│       │   ├── services/       # API + Auth services
│       │   ├── guards/         # Auth + Role guards
│       │   └── interceptors/   # JWT interceptor
│       ├── shared/components/  # Layout (sidenav)
│       └── features/
│           ├── auth/           # Login
│           ├── dashboard/      # Stats overview
│           ├── students/       # CRUD + detail view
│           ├── faculty/        # CRUD
│           ├── departments/    # CRUD
│           ├── courses/        # CRUD + filter
│           ├── attendance/     # Mark + history
│           ├── grades/         # Enter + view grades
│           ├── fees/           # Fee structures + payments
│           ├── timetable/      # Schedule grid
│           ├── notifications/  # Announcements
│           └── reports/        # Analytics
│
├── database/
│   └── schema.sql              # Full MySQL schema + seed data
│
└── docker-compose.yml          # One-command deployment
```

---

## 🚀 Quick Start — Docker (Recommended)

### Prerequisites
- Docker Desktop installed and running

### Steps

```bash
# 1. Clone / extract the project
cd ums/

# 2. Generate JWT keys (one-time setup)
cd backend
chmod +x generate-keys.sh
./generate-keys.sh
cd ..

# 3. Start everything
docker-compose up --build

# 4. Open the app
open http://localhost:4200
```

Default login:
- **Username:** `admin`
- **Password:** `Admin@123`

---

## 🛠 Local Development Setup

### Prerequisites
| Tool | Version |
|------|---------|
| Java | 17+ |
| Maven | 3.9+ |
| Node.js | 20+ |
| Angular CLI | 17+ |
| MySQL | 8.0+ |

---

### Step 1 — Database

```sql
-- In MySQL Workbench or CLI:
mysql -u root -p < database/schema.sql
```

Or manually:
```bash
mysql -u root -p
> source /path/to/ums/database/schema.sql
```

This creates:
- `ums_db` database
- All 20 tables
- Seed roles and default admin user

---

### Step 2 — Backend (Quarkus)

```bash
cd backend

# Generate JWT RSA keys (one-time)
chmod +x generate-keys.sh
./generate-keys.sh

# Edit database credentials if needed
nano src/main/resources/application.properties
# Change: quarkus.datasource.username / password

# Start in dev mode (hot reload)
./mvnw quarkus:dev
# OR: mvn quarkus:dev
```

Backend runs at: **http://localhost:8080**
Swagger UI: **http://localhost:8080/swagger-ui**

---

### Step 3 — Frontend (Angular)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm start
# OR: ng serve
```

Frontend runs at: **http://localhost:4200**

---

## 🔐 Authentication

The system uses **JWT Bearer tokens** (RSA-signed via Quarkus SmallRye JWT).

**Login flow:**
1. POST `/api/auth/login` → returns `{ token, username, role, userId }`
2. All subsequent requests include: `Authorization: Bearer <token>`
3. Token expires after **8 hours** (configurable in `application.properties`)

---

## 👥 User Roles & Access

| Role | Access |
|------|--------|
| `ADMIN` | Full access to all modules |
| `ADMISSION_OFFICER` | Students, courses, reports |
| `FACULTY` | Courses, attendance, grades, timetable |
| `STUDENT` | Own profile, attendance, grades, fees, timetable |
| `FINANCE_OFFICER` | Fee structures, payments, fee reports |

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/change-password` | Change password |
| GET | `/api/auth/me` | Current user |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students?page=0&size=20&search=` | List students |
| GET | `/api/students/{id}` | Get student |
| POST | `/api/students` | Create student |
| PUT | `/api/students/{id}` | Update student |
| DELETE | `/api/students/{id}` | Delete student |

### Faculty
| GET/POST | `/api/faculty` | List / Create |
| GET/PUT/DELETE | `/api/faculty/{id}` | Get / Update / Delete |

### Departments
| GET/POST | `/api/departments` | List / Create |
| GET/PUT/DELETE | `/api/departments/{id}` | Operations |

### Courses
| GET/POST | `/api/courses?departmentId=` | List / Create |
| GET/PUT/DELETE | `/api/courses/{id}` | Operations |

### Attendance
| POST | `/api/attendance` | Mark attendance (batch) |
| GET | `/api/attendance/student/{id}?courseId=` | Get by student |

### Grades
| GET | `/api/grades/student/{id}` | Get grades |
| POST | `/api/grades` | Add grade |
| PUT | `/api/grades/{id}` | Update grade |

### Fees
| GET/POST | `/api/fees/structure` | Fee structures |
| GET | `/api/fees/student/{id}` | Student payments |
| POST | `/api/fees/payments` | Record payment |

### Timetable
| GET/POST | `/api/timetable?semester=&facultyId=` | List / Create |
| DELETE | `/api/timetable/{id}` | Delete |

### Notifications
| GET/POST | `/api/notifications` | List / Create |

### Reports
| GET | `/api/reports/dashboard` | Admin dashboard stats |
| GET | `/api/reports/students` | Student enrollment report |
| GET | `/api/reports/fees` | Fee payment report |
| GET | `/api/reports/attendance/{studentId}` | Attendance % report |

---

## 🗄 Database Schema

20 tables covering:

| Table | Description |
|-------|-------------|
| `users` | All user accounts |
| `roles` | 5 roles |
| `permissions` | Module-level permissions |
| `role_permissions` | Role-permission mapping |
| `students` | Student profiles |
| `student_documents` | Uploaded documents |
| `student_academic_history` | GPA/CGPA per semester |
| `faculty` | Faculty profiles |
| `departments` | University departments |
| `courses` | Course catalog |
| `course_prerequisites` | Course dependency graph |
| `student_course_registration` | Enrollments |
| `timetable` | Class schedules |
| `attendance` | Daily attendance records |
| `grades` | Student grades per course |
| `fee_structure` | Fee definitions |
| `payments` | Payment records |
| `notifications` | Announcements |
| `notification_reads` | Read receipts |
| `transcripts` | Generated transcript records |
| `audit_logs` | All user actions |

---

## 🔧 Configuration

### Backend (`application.properties`)
```properties
quarkus.datasource.jdbc.url=jdbc:mysql://localhost:3306/ums_db
quarkus.datasource.username=ums_user
quarkus.datasource.password=ums_password

# JWT token lifespan (seconds): 28800 = 8 hours
smallrye.jwt.new-token.lifespan=28800

# CORS allowed origins
quarkus.http.cors.origins=http://localhost:4200
```

### Frontend (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

---

## 🧪 Testing the API

With Swagger UI open at **http://localhost:8080/swagger-ui**:

1. POST `/api/auth/login` with `{ "username": "admin", "password": "Admin@123" }`
2. Copy the `token` from the response
3. Click **Authorize** → paste `Bearer <token>`
4. All endpoints are now accessible

---

## 🏗 Adding New Features

### Adding a new backend endpoint:
1. Create entity in `com.ums.entity/`
2. Add DTO in `com.ums.dto/`
3. Create resource class in `com.ums.resource/` with `@Path`, `@RolesAllowed`
4. Update `schema.sql` with the new table

### Adding a new frontend page:
1. Create component in `src/app/features/<module>/`
2. Add route to the feature's `.routes.ts`
3. Add nav item to `layout.component.ts`
4. Add API service method to `api.services.ts`

---

## 📦 Production Deployment

```bash
# Build everything
docker-compose -f docker-compose.yml build

# Run in background
docker-compose up -d

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop
docker-compose down
```

For cloud deployment, update:
- `nginx.conf` proxy_pass URL for the backend
- `application.properties` datasource URL
- Environment variables in `docker-compose.yml`

---

## 📋 Development Checklist

- [x] Database schema (20 tables)
- [x] JWT authentication (RSA-signed)
- [x] Role-based access control (5 roles)
- [x] Student CRUD + detail view
- [x] Faculty CRUD
- [x] Department CRUD
- [x] Course catalog + filtering
- [x] Attendance marking (batch) + history
- [x] Grade entry + GPA calculation
- [x] Fee structure + payment recording
- [x] Timetable grid + management
- [x] Notifications/Announcements
- [x] Reports (student, fee, attendance)
- [x] Dashboard with stats
- [x] Audit logging entity
- [x] Global exception handling
- [x] Docker Compose deployment
- [ ] Email notifications (extend `NotificationResource`)
- [ ] File upload for student documents
- [ ] PDF transcript generation
- [ ] Course registration workflow (student self-enrollment)
- [ ] Password reset via email token

---

## 🤝 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17 (Standalone), Angular Material, RxJS |
| Backend | Quarkus 3.9, Hibernate ORM + Panache, RESTEasy Reactive |
| Auth | SmallRye JWT (RS256) |
| Database | MySQL 8.0 |
| Containerization | Docker, Docker Compose, Nginx |
