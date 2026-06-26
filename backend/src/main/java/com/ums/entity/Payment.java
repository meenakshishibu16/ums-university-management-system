package com.ums.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    public Integer paymentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    public Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fee_id")
    public FeeStructure feeStructure;

    @Column(nullable = false, precision = 10, scale = 2)
    public BigDecimal amount;

    @Column(name = "payment_date", nullable = false)
    public LocalDate paymentDate;

    @Column(length = 50)
    public String method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "receipt_no", unique = true, length = 50)
    public String receiptNo;

    @Column(name = "created_at")
    public LocalDateTime createdAt = LocalDateTime.now();

    public enum PaymentStatus { PAID, PENDING, FAILED }
}
