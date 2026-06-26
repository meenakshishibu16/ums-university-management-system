package com.ums.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_course_registration")
public class CourseRegistration extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    public Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    public Course course;

    @Column(nullable = false, length = 20)
    public String semester;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public Status status = Status.ENROLLED;

    @Column(name = "created_at")
    public LocalDateTime createdAt = LocalDateTime.now();

    public enum Status { ENROLLED, DROPPED, COMPLETED }
}
