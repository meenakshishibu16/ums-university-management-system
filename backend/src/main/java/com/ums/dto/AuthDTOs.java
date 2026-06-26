package com.ums.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// ============================================================
// Auth DTOs
// ============================================================

public class AuthDTOs {

    public static class LoginRequest {
        @NotBlank
        public String username;
        @NotBlank
        public String password;
    }

    public static class LoginResponse {
        public String token;
        public String username;
        public String role;
        public Integer userId;
        public Integer profileId;

        public LoginResponse(String token, String username, String role, Integer userId, Integer profileId) {
            this.token = token;
            this.username = username;
            this.role = role;
            this.userId = userId;
            this.profileId = profileId;
        }
    }

    public static class ForgotPasswordRequest {
        @Email @NotBlank
        public String email;
    }

    public static class ResetPasswordRequest {
        @NotBlank
        public String token;
        @NotBlank @Size(min = 8)
        public String newPassword;
    }

    public static class ChangePasswordRequest {
        @NotBlank
        public String currentPassword;
        @NotBlank @Size(min = 8)
        public String newPassword;
    }
}
