package com.ums.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
public class Student extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    public Integer studentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    public User user;

    @Column(nullable = false, length = 100)
    public String name;

    public LocalDate dob;

    @Enumerated(EnumType.STRING)
    public Gender gender;

    @Column(length = 20)
    public String contact;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    public Department department;

    @Column(name = "enrollment_year")
    public Integer enrollmentYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "academic_status", nullable = false)
    public AcademicStatus academicStatus = AcademicStatus.ACTIVE;

    @Column(name = "created_at")
    public LocalDateTime createdAt = LocalDateTime.now();

    public enum Gender { MALE, FEMALE, OTHER }
    public enum AcademicStatus { ACTIVE, GRADUATED, SUSPENDED, DROPPED }
}
