package com.ums.dto;

import jakarta.validation.constraints.NotBlank;

// ============================================================
// Faculty DTOs
// ============================================================

public class FacultyDTO {

    public static class CreateRequest {
        @NotBlank public String username;
        @NotBlank public String email;
        @NotBlank public String password;
        @NotBlank public String name;
        public String qualification;
        public Integer departmentId;
        public String contact;
    }

    public static class UpdateRequest {
        public String name;
        public String qualification;
        public Integer departmentId;
        public String contact;
    }

    public static class Response {
        public Integer facultyId;
        public Integer userId;
        public String username;
        public String email;
        public String name;
        public String qualification;
        public String departmentName;
        public Integer departmentId;
        public String contact;
    }
}
