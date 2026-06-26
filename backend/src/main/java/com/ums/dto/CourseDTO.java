package com.ums.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// ============================================================
// Course DTOs
// ============================================================

public class CourseDTO {

    public static class CreateRequest {
        @NotBlank public String courseCode;
        @NotBlank public String courseName;
        @NotNull  public Integer credits;
        public String semester;
        public Integer departmentId;
    }

    public static class Response {
        public Integer courseId;
        public String courseCode;
        public String courseName;
        public Integer credits;
        public String semester;
        public String departmentName;
        public Integer departmentId;
    }
}
