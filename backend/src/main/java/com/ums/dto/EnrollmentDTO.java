package com.ums.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class EnrollmentDTO {

    public static class CreateRequest {
        @NotNull public Integer studentId;
        @NotBlank public String semester;
    }

    public static class Response {
        public Integer id;
        public Integer studentId;
        public String studentName;
        public String studentUsername;
        public Integer courseId;
        public String courseName;
        public String semester;
        public String status;
    }
}
