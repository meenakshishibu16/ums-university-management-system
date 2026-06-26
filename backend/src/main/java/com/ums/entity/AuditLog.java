package com.ums.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    public Integer logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @Column(nullable = false, length = 255)
    public String action;

    @Column(length = 50)
    public String entity;

    @Column(name = "entity_id")
    public Integer entityId;

    @Column(nullable = false)
    public LocalDateTime timestamp = LocalDateTime.now();
}
