package com.ums.resource;

import com.ums.dto.AuthDTOs;
import com.ums.entity.Faculty;
import com.ums.entity.Student;
import com.ums.entity.User;
import com.ums.security.TokenService;
import at.favre.lib.crypto.bcrypt.BCrypt;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.eclipse.microprofile.jwt.JsonWebToken;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class AuthResource {

    @Inject TokenService tokenService;
    @Inject JsonWebToken jwt;

    @POST
    @Path("/login")
    @PermitAll
    @Transactional
    public Response login(@Valid AuthDTOs.LoginRequest req) {
        User user = User.findByUsername(req.username);
        if (user == null) user = User.findByEmail(req.username);

        if (user == null || !BCrypt.verifyer()
                .verify(req.password.toCharArray(), user.passwordHash).verified) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"message\":\"Invalid credentials\"}")
                    .build();
        }

        if (user.status != User.UserStatus.ACTIVE) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"message\":\"Account is not active\"}")
                    .build();
        }

        String token = tokenService.generateToken(user);
        Integer profileId = switch (user.role.roleName) {
            case "STUDENT" -> {
                Student s = Student.find("user.userId", user.userId).firstResult();
                yield s != null ? s.studentId : null;
            }
            case "FACULTY" -> {
                Faculty f = Faculty.find("user.userId", user.userId).firstResult();
                yield f != null ? f.facultyId : null;
            }
            default -> null;
        };
        return Response.ok(new AuthDTOs.LoginResponse(
                token, user.username, user.role.roleName, user.userId, profileId)).build();
    }

    @POST
    @Path("/change-password")
    @RolesAllowed({"ADMIN", "FACULTY", "STUDENT", "ADMISSION_OFFICER", "FINANCE_OFFICER"})
    @Transactional
    public Response changePassword(@Valid AuthDTOs.ChangePasswordRequest req,
                                   @Context SecurityContext ctx) {
        Integer userId = Integer.valueOf(jwt.getSubject());
        User user = User.findById(userId);

        if (!BCrypt.verifyer().verify(req.currentPassword.toCharArray(), user.passwordHash).verified) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"message\":\"Current password is incorrect\"}")
                    .build();
        }

        user.passwordHash = BCrypt.withDefaults().hashToString(12, req.newPassword.toCharArray());
        user.persist();
        return Response.ok("{\"message\":\"Password changed successfully\"}").build();
    }

    @GET
    @Path("/me")
    @RolesAllowed({"ADMIN", "FACULTY", "STUDENT", "ADMISSION_OFFICER", "FINANCE_OFFICER"})
    public Response getCurrentUser() {
        Integer userId = Integer.valueOf(jwt.getSubject());
        User user = User.findById(userId);
        if (user == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(user).build();
    }
}
