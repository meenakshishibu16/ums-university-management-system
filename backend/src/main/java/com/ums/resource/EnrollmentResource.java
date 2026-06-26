package com.ums.resource;

import com.ums.dto.EnrollmentDTO;
import com.ums.entity.Course;
import com.ums.entity.CourseRegistration;
import com.ums.entity.Student;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.stream.Collectors;

@Path("/api/courses/{courseId}/students")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class EnrollmentResource {

    @GET
    @RolesAllowed({"ADMIN", "FACULTY", "ADMISSION_OFFICER"})
    @Transactional
    public Response getRoster(@PathParam("courseId") Integer courseId, @QueryParam("semester") String semester) {
        List<CourseRegistration> regs = semester != null
                ? CourseRegistration.list("course.courseId = ?1 AND semester = ?2 AND status = ?3",
                        courseId, semester, CourseRegistration.Status.ENROLLED)
                : CourseRegistration.list("course.courseId = ?1 AND status = ?2",
                        courseId, CourseRegistration.Status.ENROLLED);
        return Response.ok(regs.stream().map(this::toResponse).collect(Collectors.toList())).build();
    }

    @POST
    @RolesAllowed({"ADMIN", "ADMISSION_OFFICER"})
    @Transactional
    public Response enroll(@PathParam("courseId") Integer courseId, EnrollmentDTO.CreateRequest req) {
        Course course = Course.findById(courseId);
        if (course == null) return Response.status(404).build();
        Student student = Student.findById(req.studentId);
        if (student == null) return Response.status(404).build();

        CourseRegistration existing = CourseRegistration.find(
                "student.studentId = ?1 AND course.courseId = ?2 AND semester = ?3",
                req.studentId, courseId, req.semester).firstResult();

        if (existing != null) {
            if (existing.status == CourseRegistration.Status.ENROLLED)
                return Response.status(Response.Status.CONFLICT)
                        .entity("{\"message\":\"Student is already enrolled in this course\"}").build();
            existing.status = CourseRegistration.Status.ENROLLED;
            existing.persist();
            return Response.ok(toResponse(existing)).build();
        }

        CourseRegistration reg = new CourseRegistration();
        reg.student = student;
        reg.course = course;
        reg.semester = req.semester;
        reg.persist();
        return Response.status(201).entity(toResponse(reg)).build();
    }

    @DELETE
    @Path("/{studentId}")
    @RolesAllowed({"ADMIN", "ADMISSION_OFFICER"})
    @Transactional
    public Response unenroll(@PathParam("courseId") Integer courseId, @PathParam("studentId") Integer studentId,
                             @QueryParam("semester") String semester) {
        List<CourseRegistration> regs = semester != null
                ? CourseRegistration.list("student.studentId = ?1 AND course.courseId = ?2 AND semester = ?3",
                        studentId, courseId, semester)
                : CourseRegistration.list("student.studentId = ?1 AND course.courseId = ?2", studentId, courseId);
        if (regs.isEmpty()) return Response.status(404).build();
        regs.forEach(r -> { r.status = CourseRegistration.Status.DROPPED; r.persist(); });
        return Response.noContent().build();
    }

    private EnrollmentDTO.Response toResponse(CourseRegistration r) {
        EnrollmentDTO.Response dto = new EnrollmentDTO.Response();
        dto.id = r.id;
        dto.studentId = r.student.studentId;
        dto.studentName = r.student.name;
        dto.studentUsername = r.student.user.username;
        dto.courseId = r.course.courseId;
        dto.courseName = r.course.courseName;
        dto.semester = r.semester;
        dto.status = r.status.name();
        return dto;
    }
}
