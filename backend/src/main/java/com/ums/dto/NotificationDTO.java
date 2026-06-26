package com.ums.dto;

import java.time.LocalDateTime;

public class NotificationDTO {

    public static class Response {
        public Integer notificationId;
        public String title;
        public String message;
        public String targetRole;
        public String createdBy;
        public LocalDateTime createdDate;
        public boolean read;
    }
}
