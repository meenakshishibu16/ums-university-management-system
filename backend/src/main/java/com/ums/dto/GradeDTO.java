package com.ums.dto;

import java.math.BigDecimal;

public class GradeDTO {

    public static class Response {
        public Integer gradeId;
        public Integer studentId;
        public String studentName;
        public String courseName;
        public String semester;
        public BigDecimal marks;
        public String grade;
    }
}
