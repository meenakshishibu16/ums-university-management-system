package com.ums.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

// ============================================================
// Student DTOs
// ============================================================

public class StudentDTO {

    public static class CreateRequest {
        @NotBlank public String username;
        @NotBlank public String email;
        @NotBlank public String password;
        @NotBlank public String name;
        public LocalDate dob;
        public String gender;
        public String contact;
        public Integer departmentId;
        public Integer enrollmentYear;
    }

    public static class UpdateRequest {
        public String name;
        public LocalDate dob;
        public String gender;
        public String contact;
        public Integer departmentId;
        public String academicStatus;
    }

    public static class Response {
        public Integer studentId;
        public Integer userId;
        public String username;
        public String email;
        public String name;
        public LocalDate dob;
        public String gender;
        public String contact;
        public String departmentName;
        public Integer departmentId;
        public Integer enrollmentYear;
        public String academicStatus;
    }
}
