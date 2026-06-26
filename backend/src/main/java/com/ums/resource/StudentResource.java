package com.ums.resource;

import com.ums.dto.StudentDTO;
import com.ums.entity.*;
import at.favre.lib.crypto.bcrypt.BCrypt;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.stream.Collectors;

@Path("/api/students")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class StudentResource {

    @GET
    @RolesAllowed({"ADMIN", "ADMISSION_OFFICER", "FACULTY"})
    public Response getAll(@QueryParam("page") @DefaultValue("0") int page,
                           @QueryParam("size") @DefaultValue("20") int size,
                           @QueryParam("search") String search) {
        List<Student> students;
        if (search != null && !search.isBlank()) {
            students = Student.find(
                "LOWER(name) LIKE ?1 OR LOWER(user.username) LIKE ?1 OR LOWER(user.email) LIKE ?1",
                "%" + search.toLowerCase() + "%").page(page, size).list();
        } else {
            students = Student.findAll().page(page, size).list();
        }
        return Response.ok(students.stream().map(this::toResponse).collect(Collectors.toList())).build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"ADMIN", "ADMISSION_OFFICER", "FACULTY", "STUDENT"})
    public Response getById(@PathParam("id") Integer id) {
        Student s = Student.findById(id);
        if (s == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(toResponse(s)).build();
    }

    @POST
    @RolesAllowed({"ADMIN", "ADMISSION_OFFICER"})
    @Transactional
    public Response create(@Valid StudentDTO.CreateRequest req) {
        if (User.findByUsername(req.username) != null)
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"message\":\"Username already exists\"}").build();

        Role role = Role.findByName("STUDENT");
        User user = new User();
        user.username = req.username;
        user.email = req.email;
        user.passwordHash = BCrypt.withDefaults().hashToString(12, req.password.toCharArray());
        user.role = role;
        user.persist();

        Student student = new Student();
        student.user = user;
        student.name = req.name;
        student.dob = req.dob;
        student.contact = req.contact;
        student.enrollmentYear = req.enrollmentYear;
        if (req.gender != null) student.gender = Student.Gender.valueOf(req.gender);
        if (req.departmentId != null) student.department = Department.findById(req.departmentId);
        student.persist();

        return Response.status(Response.Status.CREATED).entity(toResponse(student)).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"ADMIN", "ADMISSION_OFFICER"})
    @Transactional
    public Response update(@PathParam("id") Integer id, StudentDTO.UpdateRequest req) {
        Student s = Student.findById(id);
        if (s == null) return Response.status(Response.Status.NOT_FOUND).build();

        if (req.name != null) s.name = req.name;
        if (req.dob != null) s.dob = req.dob;
        if (req.contact != null) s.contact = req.contact;
        if (req.gender != null) s.gender = Student.Gender.valueOf(req.gender);
        if (req.departmentId != null) s.department = Department.findById(req.departmentId);
        if (req.academicStatus != null) s.academicStatus = Student.AcademicStatus.valueOf(req.academicStatus);
        s.persist();

        return Response.ok(toResponse(s)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"ADMIN"})
    @Transactional
    public Response delete(@PathParam("id") Integer id) {
        Student s = Student.findById(id);
        if (s == null) return Response.status(Response.Status.NOT_FOUND).build();
        s.delete();
        return Response.noContent().build();
    }

    private StudentDTO.Response toResponse(Student s) {
        StudentDTO.Response r = new StudentDTO.Response();
        r.studentId = s.studentId;
        r.userId = s.user.userId;
        r.username = s.user.username;
        r.email = s.user.email;
        r.name = s.name;
        r.dob = s.dob;
        r.gender = s.gender != null ? s.gender.name() : null;
        r.contact = s.contact;
        r.enrollmentYear = s.enrollmentYear;
        r.academicStatus = s.academicStatus.name();
        if (s.department != null) {
            r.departmentId = s.department.departmentId;
            r.departmentName = s.department.departmentName;
        }
        return r;
    }
}
