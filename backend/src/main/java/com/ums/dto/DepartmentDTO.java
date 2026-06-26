package com.ums.dto;

import jakarta.validation.constraints.NotBlank;

// ============================================================
// Department DTOs
// ============================================================

public class DepartmentDTO {

    public static class CreateRequest {
        @NotBlank public String departmentName;
        public Integer hodId;
    }

    public static class Response {
        public Integer departmentId;
        public String departmentName;
        public String hodName;
        public Integer hodId;
    }
}
