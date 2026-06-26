package com.ums.dto;

import java.time.LocalDate;

public class AttendanceDTO {

    public static class Response {
        public Integer attendanceId;
        public String studentName;
        public Integer studentId;
        public String courseName;
        public LocalDate date;
        public String status;
    }
}
