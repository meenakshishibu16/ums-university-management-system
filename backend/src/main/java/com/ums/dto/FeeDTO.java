package com.ums.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FeeDTO {

    public static class StructureResponse {
        public Integer feeId;
        public Integer departmentId;
        public String departmentName;
        public String semester;
        public BigDecimal amount;
        public String description;
    }

    public static class PaymentResponse {
        public Integer paymentId;
        public String studentName;
        public BigDecimal amount;
        public LocalDate paymentDate;
        public String method;
        public String status;
        public String receiptNo;
    }
}
