package com.example_amar.central_athority.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "devices")
public class Device {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "registration_id", nullable = false)
    private UUID registrationId;

    @Column(name = "device_id", nullable = false, length = Integer.MAX_VALUE)
    private String deviceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_id")
    private Application app;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "installer_id")
    private Installer installer;

    @Column(name = "app_secret", nullable = false, length = Integer.MAX_VALUE)
    private String appSecret;

    @ColumnDefault("'ACTIVE'")
    @Column(name = "status", length = 20)
    private String status;

    @ColumnDefault("now()")
    @Column(name = "created_at")
    private OffsetDateTime createdAt;

}