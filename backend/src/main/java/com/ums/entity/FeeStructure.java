package com.ums.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fee_structure")
public class FeeStructure extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fee_id")
    public Integer feeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    public Department department;

    @Column(nullable = false, length = 20)
    public String semester;

    @Column(nullable = false, precision = 10, scale = 2)
    public BigDecimal amount;

    @Column(length = 255)
    public String description;

    @Column(name = "created_at")
    public LocalDateTime createdAt = LocalDateTime.now();
}
