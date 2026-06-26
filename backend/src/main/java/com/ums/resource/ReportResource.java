package com.ums.resource;

import com.ums.entity.*;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.HashMap;
import java.util.Map;

@Path("/api/reports")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class ReportResource {

    @GET
    @Path("/students")
    @RolesAllowed({"ADMIN", "ADMISSION_OFFICER"})
    public Response studentReport() {
        Map<String, Object> report = new HashMap<>();
        report.put("total", Student.count());
        report.put("active", Student.count("academicStatus", Student.AcademicStatus.ACTIVE));
        report.put("graduated", Student.count("academicStatus", Student.AcademicStatus.GRADUATED));
        report.put("suspended", Student.count("academicStatus", Student.AcademicStatus.SUSPENDED));
        return Response.ok(report).build();
    }

    @GET
    @Path("/faculty")
    @RolesAllowed({"ADMIN"})
    public Response facultyReport() {
        Map<String, Object> report = new HashMap<>();
        report.put("total", Faculty.count());
        report.put("byDepartment", Department.listAll());
        return Response.ok(report).build();
    }

    @GET
    @Path("/fees")
    @RolesAllowed({"ADMIN", "FINANCE_OFFICER"})
    public Response feeReport() {
        Map<String, Object> report = new HashMap<>();
        report.put("totalPayments", Payment.count());
        report.put("paidPayments", Payment.count("status", Payment.PaymentStatus.PAID));
        report.put("pendingPayments", Payment.count("status", Payment.PaymentStatus.PENDING));
        return Response.ok(report).build();
    }

    @GET
    @Path("/attendance/{studentId}")
    @RolesAllowed({"ADMIN", "FACULTY", "STUDENT"})
    public Response attendanceReport(@PathParam("studentId") Integer studentId) {
        Map<String, Object> report = new HashMap<>();
        long total = Attendance.count("student.studentId", studentId);
        long present = Attendance.count("student.studentId = ?1 AND status = ?2",
                studentId, Attendance.AttendanceStatus.PRESENT);
        report.put("total", total);
        report.put("present", present);
        report.put("absent", total - present);
        report.put("percentage", total > 0 ? (present * 100.0 / total) : 0);
        return Response.ok(report).build();
    }

    @GET
    @Path("/dashboard")
    @RolesAllowed({"ADMIN"})
    public Response dashboard() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", Student.count());
        stats.put("totalFaculty", Faculty.count());
        stats.put("totalCourses", Course.count());
        stats.put("totalDepartments", Department.count());
        stats.put("totalPayments", Payment.count("status", Payment.PaymentStatus.PAID));
        return Response.ok(stats).build();
    }
}
