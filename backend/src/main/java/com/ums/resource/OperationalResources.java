package com.ums.resource;

import com.ums.dto.AttendanceDTO;
import com.ums.dto.FeeDTO;
import com.ums.dto.GradeDTO;
import com.ums.dto.NotificationDTO;
import com.ums.dto.TimetableDTO;
import com.ums.entity.*;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

// ============================================================
// Attendance Resource
// ============================================================
@Path("/api/attendance")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
class AttendanceResource {

    @Inject JsonWebToken jwt;

    @GET
    @Path("/student/{studentId}")
    @RolesAllowed({"ADMIN", "FACULTY", "STUDENT"})
    @Transactional
    public Response getByStudent(@PathParam("studentId") Integer studentId,
                                 @QueryParam("courseId") Integer courseId) {
        List<Attendance> list = courseId != null
                ? Attendance.list("student.studentId = ?1 AND course.courseId = ?2", studentId, courseId)
                : Attendance.list("student.studentId", studentId);
        return Response.ok(list.stream().map(this::toResponse).collect(Collectors.toList())).build();
    }

    @POST
    @RolesAllowed({"FACULTY", "ADMIN"})
    @Transactional
    public Response markAttendance(AttendanceBatchReq req) {
        Course course = Course.findById(req.courseId);
        if (course == null) return Response.status(404).build();

        Faculty faculty = Faculty.find("user.userId", Integer.valueOf(jwt.getSubject())).firstResult();
        if (faculty == null) {
            Timetable scheduled = Timetable.find("course.courseId", req.courseId).firstResult();
            faculty = scheduled != null ? scheduled.faculty : Faculty.findAll().firstResult();
        }
        if (faculty == null)
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"message\":\"No faculty available to record attendance for this course\"}").build();

        for (AttendanceBatchReq.Entry e : req.entries) {
            Attendance existing = Attendance.find(
                "student.studentId = ?1 AND course.courseId = ?2 AND date = ?3",
                e.studentId, req.courseId, req.date).firstResult();

            if (existing != null) {
                existing.status = Attendance.AttendanceStatus.valueOf(e.status);
                existing.persist();
            } else {
                Attendance a = new Attendance();
                a.student = Student.findById(e.studentId);
                a.course = course;
                a.faculty = faculty;
                a.date = req.date;
                a.status = Attendance.AttendanceStatus.valueOf(e.status);
                a.persist();
            }
        }
        return Response.ok("{\"message\":\"Attendance marked\"}").build();
    }

    private AttendanceDTO.Response toResponse(Attendance a) {
        AttendanceDTO.Response r = new AttendanceDTO.Response();
        r.attendanceId = a.attendanceId;
        r.studentId = a.student.studentId;
        r.studentName = a.student.name;
        r.courseName = a.course.courseName;
        r.date = a.date;
        r.status = a.status.name();
        return r;
    }

    public static class AttendanceBatchReq {
        public Integer courseId;
        public LocalDate date;
        public List<Entry> entries;
        public static class Entry { public Integer studentId; public String status; }
    }
}

// ============================================================
// Grade Resource
// ============================================================
@Path("/api/grades")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
class GradeResource {

    @GET
    @Path("/student/{studentId}")
    @RolesAllowed({"ADMIN", "FACULTY", "STUDENT"})
    @Transactional
    public Response getByStudent(@PathParam("studentId") Integer studentId) {
        List<Grade> grades = Grade.list("student.studentId", studentId);
        return Response.ok(grades.stream().map(this::toResponse).collect(Collectors.toList())).build();
    }

    @GET
    @Path("/course/{courseId}")
    @RolesAllowed({"ADMIN", "FACULTY"})
    @Transactional
    public Response getByCourse(@PathParam("courseId") Integer courseId, @QueryParam("semester") String semester) {
        List<Grade> grades = semester != null
                ? Grade.list("course.courseId = ?1 AND semester = ?2", courseId, semester)
                : Grade.list("course.courseId", courseId);
        return Response.ok(grades.stream().map(this::toResponse).collect(Collectors.toList())).build();
    }

    @POST
    @RolesAllowed({"FACULTY", "ADMIN"})
    @Transactional
    public Response create(GradeReq req) {
        Grade g = new Grade();
        g.student = Student.findById(req.studentId);
        g.course = Course.findById(req.courseId);
        g.semester = req.semester;
        g.marks = req.marks;
        g.grade = req.grade;
        g.persist();
        return Response.status(201).entity(toResponse(g)).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"FACULTY", "ADMIN"})
    @Transactional
    public Response update(@PathParam("id") Integer id, GradeReq req) {
        Grade g = Grade.findById(id);
        if (g == null) return Response.status(404).build();
        if (req.marks != null) g.marks = req.marks;
        if (req.grade != null) g.grade = req.grade;
        g.persist();
        return Response.ok(toResponse(g)).build();
    }

    private GradeDTO.Response toResponse(Grade g) {
        GradeDTO.Response r = new GradeDTO.Response();
        r.gradeId = g.gradeId;
        r.studentId = g.student.studentId;
        r.studentName = g.student.name;
        r.courseName = g.course.courseName;
        r.semester = g.semester;
        r.marks = g.marks;
        r.grade = g.grade;
        return r;
    }

    public static class GradeReq {
        public Integer studentId;
        public Integer courseId;
        public String semester;
        public BigDecimal marks;
        public String grade;
    }
}

// ============================================================
// Fee Resource
// ============================================================
@Path("/api/fees")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
class FeeResource {

    @GET
    @Path("/structure")
    @RolesAllowed({"ADMIN", "FINANCE_OFFICER", "STUDENT"})
    @Transactional
    public Response getFeeStructure() {
        List<FeeStructure> structures = FeeStructure.listAll();
        return Response.ok(structures.stream().map(this::toResponse).collect(Collectors.toList())).build();
    }

    @POST
    @Path("/structure")
    @RolesAllowed({"ADMIN", "FINANCE_OFFICER"})
    @Transactional
    public Response createFeeStructure(FeeStructureReq req) {
        FeeStructure fs = new FeeStructure();
        fs.semester = req.semester;
        fs.amount = req.amount;
        fs.description = req.description;
        if (req.departmentId != null) fs.department = Department.findById(req.departmentId);
        fs.persist();
        return Response.status(201).entity(toResponse(fs)).build();
    }

    @GET
    @Path("/student/{studentId}")
    @RolesAllowed({"ADMIN", "FINANCE_OFFICER", "STUDENT"})
    @Transactional
    public Response getStudentPayments(@PathParam("studentId") Integer studentId) {
        List<Payment> payments = Payment.list("student.studentId", studentId);
        return Response.ok(payments.stream().map(this::toResponse).collect(Collectors.toList())).build();
    }

    @POST
    @Path("/payments")
    @RolesAllowed({"ADMIN", "FINANCE_OFFICER", "STUDENT"})
    @Transactional
    public Response recordPayment(PaymentReq req) {
        Payment p = new Payment();
        p.student = Student.findById(req.studentId);
        p.amount = req.amount;
        p.paymentDate = req.paymentDate != null ? req.paymentDate : LocalDate.now();
        p.method = req.method;
        p.status = Payment.PaymentStatus.PAID;
        p.receiptNo = "REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        if (req.feeId != null) p.feeStructure = FeeStructure.findById(req.feeId);
        p.persist();
        return Response.status(201).entity(toResponse(p)).build();
    }

    private FeeDTO.StructureResponse toResponse(FeeStructure fs) {
        FeeDTO.StructureResponse r = new FeeDTO.StructureResponse();
        r.feeId = fs.feeId;
        r.semester = fs.semester;
        r.amount = fs.amount;
        r.description = fs.description;
        if (fs.department != null) {
            r.departmentId = fs.department.departmentId;
            r.departmentName = fs.department.departmentName;
        }
        return r;
    }

    private FeeDTO.PaymentResponse toResponse(Payment p) {
        FeeDTO.PaymentResponse r = new FeeDTO.PaymentResponse();
        r.paymentId = p.paymentId;
        r.studentName = p.student.name;
        r.amount = p.amount;
        r.paymentDate = p.paymentDate;
        r.method = p.method;
        r.status = p.status.name();
        r.receiptNo = p.receiptNo;
        return r;
    }

    public static class FeeStructureReq {
        public Integer departmentId; public String semester;
        public BigDecimal amount; public String description;
    }
    public static class PaymentReq {
        public Integer studentId; public Integer feeId;
        public BigDecimal amount; public LocalDate paymentDate; public String method;
    }
}

// ============================================================
// Timetable Resource
// ============================================================
@Path("/api/timetable")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
class TimetableResource {

    @GET
    @RolesAllowed({"ADMIN", "FACULTY", "STUDENT"})
    @Transactional
    public Response getAll(@QueryParam("semester") String semester,
                           @QueryParam("facultyId") Integer facultyId,
                           @QueryParam("courseId") Integer courseId) {
        List<Timetable> list;
        if (semester != null) {
            list = Timetable.list("semester", semester);
        } else if (facultyId != null) {
            list = Timetable.list("faculty.facultyId", facultyId);
        } else {
            list = Timetable.listAll();
        }
        return Response.ok(list.stream().map(this::toResponse).collect(Collectors.toList())).build();
    }

    @POST
    @RolesAllowed({"ADMIN"})
    @Transactional
    public Response create(TimetableReq req) {
        Timetable t = new Timetable();
        t.course = Course.findById(req.courseId);
        t.faculty = Faculty.findById(req.facultyId);
        t.room = req.room;
        t.day = Timetable.DayOfWeek.valueOf(req.day);
        t.startTime = req.startTime;
        t.endTime = req.endTime;
        t.semester = req.semester;
        t.persist();
        return Response.status(201).entity(toResponse(t)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"ADMIN"})
    @Transactional
    public Response delete(@PathParam("id") Integer id) {
        Timetable t = Timetable.findById(id);
        if (t == null) return Response.status(404).build();
        t.delete();
        return Response.noContent().build();
    }

    private TimetableDTO.Response toResponse(Timetable t) {
        TimetableDTO.Response r = new TimetableDTO.Response();
        r.id = t.id;
        r.courseName = t.course.courseName;
        r.courseCode = t.course.courseCode;
        r.facultyName = t.faculty.name;
        r.room = t.room;
        r.day = t.day.name();
        r.startTime = t.startTime;
        r.endTime = t.endTime;
        r.semester = t.semester;
        return r;
    }

    public static class TimetableReq {
        public Integer courseId; public Integer facultyId; public String room;
        public String day; public LocalTime startTime; public LocalTime endTime; public String semester;
    }
}

// ============================================================
// Notification Resource
// ============================================================
@Path("/api/notifications")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
class NotificationResource {

    @Inject JsonWebToken jwt;

    @GET
    @RolesAllowed({"ADMIN", "FACULTY", "STUDENT", "ADMISSION_OFFICER", "FINANCE_OFFICER"})
    @Transactional
    public Response getAll() {
        List<Notification> notifications = Notification.listAll();
        return Response.ok(notifications.stream().map(this::toResponse).collect(Collectors.toList())).build();
    }

    @POST
    @RolesAllowed({"ADMIN", "FACULTY"})
    @Transactional
    public Response create(NotifReq req) {
        Notification n = new Notification();
        n.title = req.title;
        n.message = req.message;
        n.createdBy = User.findById(Integer.valueOf(jwt.getSubject()));
        if (req.targetRoleId != null) n.targetRole = Role.findById(req.targetRoleId);
        n.persist();
        return Response.status(201).entity(toResponse(n)).build();
    }

    private NotificationDTO.Response toResponse(Notification n) {
        NotificationDTO.Response r = new NotificationDTO.Response();
        r.notificationId = n.notificationId;
        r.title = n.title;
        r.message = n.message;
        r.targetRole = n.targetRole != null ? n.targetRole.roleName : null;
        r.createdBy = n.createdBy.username;
        r.createdDate = n.createdDate;
        r.read = false;
        return r;
    }

    public static class NotifReq { public String title; public String message; public Integer targetRoleId; }
}
