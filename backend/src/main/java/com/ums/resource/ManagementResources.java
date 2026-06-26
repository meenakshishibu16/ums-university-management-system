package com.ums.resource;

import com.ums.dto.CourseDTO;
import com.ums.dto.DepartmentDTO;
import com.ums.dto.FacultyDTO;
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

// ============================================================
// Faculty Resource
// ============================================================
@Path("/api/faculty")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
class FacultyResource {

    @GET
    @RolesAllowed({"ADMIN", "ADMISSION_OFFICER"})
    @Transactional
    public Response getAll() {
        List<FacultyDTO.Response> faculty = Faculty.<Faculty>listAll().stream()
                .map(this::toResponse).collect(java.util.stream.Collectors.toList());
        return Response.ok(faculty).build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"ADMIN", "ADMISSION_OFFICER", "FACULTY"})
    @Transactional
    public Response getById(@PathParam("id") Integer id) {
        Faculty f = Faculty.findById(id);
        return f == null ? Response.status(404).build() : Response.ok(toResponse(f)).build();
    }

    @POST
    @RolesAllowed({"ADMIN"})
    @Transactional
    public Response create(@Valid FacultyDTO.CreateRequest req) {
        if (User.findByUsername(req.username) != null)
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"message\":\"Username already exists\"}").build();

        Role role = Role.findByName("FACULTY");
        User user = new User();
        user.username = req.username;
        user.email = req.email;
        user.passwordHash = BCrypt.withDefaults().hashToString(12, req.password.toCharArray());
        user.role = role;
        user.persist();

        Faculty faculty = new Faculty();
        faculty.user = user;
        faculty.name = req.name;
        faculty.qualification = req.qualification;
        faculty.contact = req.contact;
        if (req.departmentId != null) faculty.department = Department.findById(req.departmentId);
        faculty.persist();

        return Response.status(Response.Status.CREATED).entity(toResponse(faculty)).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"ADMIN"})
    @Transactional
    public Response update(@PathParam("id") Integer id, FacultyDTO.UpdateRequest req) {
        Faculty f = Faculty.findById(id);
        if (f == null) return Response.status(404).build();

        if (req.name != null) f.name = req.name;
        if (req.qualification != null) f.qualification = req.qualification;
        if (req.contact != null) f.contact = req.contact;
        if (req.departmentId != null) f.department = Department.findById(req.departmentId);
        f.persist();

        return Response.ok(toResponse(f)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"ADMIN"})
    @Transactional
    public Response delete(@PathParam("id") Integer id) {
        Faculty f = Faculty.findById(id);
        if (f == null) return Response.status(404).build();
        f.delete();
        return Response.noContent().build();
    }

    private FacultyDTO.Response toResponse(Faculty f) {
        FacultyDTO.Response r = new FacultyDTO.Response();
        r.facultyId = f.facultyId;
        r.userId = f.user.userId;
        r.username = f.user.username;
        r.email = f.user.email;
        r.name = f.name;
        r.qualification = f.qualification;
        r.contact = f.contact;
        if (f.department != null) {
            r.departmentId = f.department.departmentId;
            r.departmentName = f.department.departmentName;
        }
        return r;
    }
}

// ============================================================
// Department Resource
// ============================================================
@Path("/api/departments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
class DepartmentResource {

    @GET
    @RolesAllowed({"ADMIN", "FACULTY", "STUDENT", "ADMISSION_OFFICER", "FINANCE_OFFICER"})
    @Transactional
    public Response getAll() {
        List<DepartmentDTO.Response> departments = Department.<Department>listAll().stream()
                .map(this::toResponse).collect(java.util.stream.Collectors.toList());
        return Response.ok(departments).build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"ADMIN", "FACULTY", "STUDENT", "ADMISSION_OFFICER"})
    @Transactional
    public Response getById(@PathParam("id") Integer id) {
        Department d = Department.findById(id);
        return d == null ? Response.status(404).build() : Response.ok(toResponse(d)).build();
    }

    @POST
    @RolesAllowed({"ADMIN"})
    @Transactional
    public Response create(DepartmentDTO.CreateRequest req) {
        Department d = new Department();
        d.departmentName = req.departmentName;
        if (req.hodId != null) d.hod = Faculty.findById(req.hodId);
        d.persist();
        return Response.status(201).entity(toResponse(d)).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"ADMIN"})
    @Transactional
    public Response update(@PathParam("id") Integer id, DepartmentDTO.CreateRequest req) {
        Department d = Department.findById(id);
        if (d == null) return Response.status(404).build();
        if (req.departmentName != null) d.departmentName = req.departmentName;
        if (req.hodId != null) d.hod = Faculty.findById(req.hodId);
        d.persist();
        return Response.ok(toResponse(d)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"ADMIN"})
    @Transactional
    public Response delete(@PathParam("id") Integer id) {
        Department d = Department.findById(id);
        if (d == null) return Response.status(404).build();
        d.delete();
        return Response.noContent().build();
    }

    private DepartmentDTO.Response toResponse(Department d) {
        DepartmentDTO.Response r = new DepartmentDTO.Response();
        r.departmentId = d.departmentId;
        r.departmentName = d.departmentName;
        if (d.hod != null) {
            r.hodId = d.hod.facultyId;
            r.hodName = d.hod.name;
        }
        return r;
    }
}

// ============================================================
// Course Resource
// ============================================================
@Path("/api/courses")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
class CourseResource {

    @GET
    @RolesAllowed({"ADMIN", "FACULTY", "STUDENT", "ADMISSION_OFFICER"})
    @Transactional
    public Response getAll(@QueryParam("departmentId") Integer deptId) {
        List<Course> courses = deptId != null
                ? Course.list("department.departmentId", deptId)
                : Course.listAll();
        return Response.ok(courses.stream().map(this::toResponse).collect(java.util.stream.Collectors.toList())).build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"ADMIN", "FACULTY", "STUDENT", "ADMISSION_OFFICER"})
    @Transactional
    public Response getById(@PathParam("id") Integer id) {
        Course c = Course.findById(id);
        return c == null ? Response.status(404).build() : Response.ok(toResponse(c)).build();
    }

    @POST
    @RolesAllowed({"ADMIN"})
    @Transactional
    public Response create(CourseDTO.CreateRequest req) {
        Course c = new Course();
        c.courseCode = req.courseCode;
        c.courseName = req.courseName;
        c.credits = req.credits != null ? req.credits : 3;
        c.semester = req.semester;
        if (req.departmentId != null) c.department = Department.findById(req.departmentId);
        c.persist();
        return Response.status(201).entity(toResponse(c)).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"ADMIN"})
    @Transactional
    public Response update(@PathParam("id") Integer id, CourseDTO.CreateRequest req) {
        Course c = Course.findById(id);
        if (c == null) return Response.status(404).build();
        if (req.courseCode != null) c.courseCode = req.courseCode;
        if (req.courseName != null) c.courseName = req.courseName;
        if (req.credits != null) c.credits = req.credits;
        if (req.semester != null) c.semester = req.semester;
        if (req.departmentId != null) c.department = Department.findById(req.departmentId);
        c.persist();
        return Response.ok(toResponse(c)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"ADMIN"})
    @Transactional
    public Response delete(@PathParam("id") Integer id) {
        Course c = Course.findById(id);
        if (c == null) return Response.status(404).build();
        c.delete();
        return Response.noContent().build();
    }

    private CourseDTO.Response toResponse(Course c) {
        CourseDTO.Response r = new CourseDTO.Response();
        r.courseId = c.courseId;
        r.courseCode = c.courseCode;
        r.courseName = c.courseName;
        r.credits = c.credits;
        r.semester = c.semester;
        if (c.department != null) {
            r.departmentId = c.department.departmentId;
            r.departmentName = c.department.departmentName;
        }
        return r;
    }
}
