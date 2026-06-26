package com.ums.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "faculty")
public class Faculty extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "faculty_id")
    public Integer facultyId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    public User user;

    @Column(nullable = false, length = 100)
    public String name;

    @Column(length = 100)
    public String qualification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    public Department department;

    @Column(length = 20)
    public String contact;

    @Column(name = "created_at")
    public LocalDateTime createdAt = LocalDateTime.now();
}
