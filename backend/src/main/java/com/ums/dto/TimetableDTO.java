package com.ums.dto;

import java.time.LocalTime;

public class TimetableDTO {

    public static class Response {
        public Integer id;
        public String courseName;
        public String courseCode;
        public String facultyName;
        public String room;
        public String day;
        public LocalTime startTime;
        public LocalTime endTime;
        public String semester;
    }
}
