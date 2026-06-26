package com.ums.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "courses")
public class Course extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    public Integer courseId;

    @Column(name = "course_code", nullable = false, unique = true, length = 20)
    public String courseCode;

    @Column(name = "course_name", nullable = false, length = 100)
    public String courseName;

    @Column(nullable = false)
    public Integer credits = 3;

    @Column(length = 20)
    public String semester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    public Department department;

    @Column(name = "created_at")
    public LocalDateTime createdAt = LocalDateTime.now();
}
