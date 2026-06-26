package com.ums.security;

import com.ums.entity.User;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.Set;

@ApplicationScoped
public class TokenService {

    @ConfigProperty(name = "mp.jwt.verify.issuer")
    String issuer;

    public String generateToken(User user) {
        return Jwt.issuer(issuer)
                .subject(user.userId.toString())
                .groups(Set.of(user.role.roleName))
                .claim("username", user.username)
                .claim("email", user.email)
                .claim("role", user.role.roleName)
                .sign();
    }
}
