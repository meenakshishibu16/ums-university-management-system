package com.ums.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
public class Department extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "department_id")
    public Integer departmentId;

    @Column(name = "department_name", nullable = false, unique = true, length = 100)
    public String departmentName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hod_id")
    public Faculty hod;

    @Column(name = "created_at")
    public LocalDateTime createdAt = LocalDateTime.now();
}
