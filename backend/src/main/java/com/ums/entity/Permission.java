package com.ums.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

@Entity
@Table(name = "permissions")
public class Permission extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "permission_id")
    public Integer permissionId;

    @Column(nullable = false, length = 50)
    public String module;

    @Column(nullable = false, length = 50)
    public String action;
}
