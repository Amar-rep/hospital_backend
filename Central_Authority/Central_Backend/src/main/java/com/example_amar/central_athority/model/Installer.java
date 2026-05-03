package com.example_amar.central_athority.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "installers")
public class Installer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "installer_uuid", nullable = false)
    private UUID installerUuid;

    @Column(name = "installer_secret", nullable = false, length = Integer.MAX_VALUE)
    private String installerSecret;

    @Column(name = "name", nullable = false, length = Integer.MAX_VALUE)
    private String name;

    @ColumnDefault("true")
    @Column(name = "is_active")
    private Boolean isActive;

    @ColumnDefault("now()")
    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "installer")
    private Set<Device> devices = new LinkedHashSet<>();

}