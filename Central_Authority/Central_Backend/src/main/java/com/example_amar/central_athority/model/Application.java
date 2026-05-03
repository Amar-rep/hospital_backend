package com.example_amar.central_athority.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "applications")
public class Application {
    @Id
    @Column(name = "app_id", nullable = false, length = Integer.MAX_VALUE)
    private String appId;

    @Column(name = "name", nullable = false, length = Integer.MAX_VALUE)
    private String name;

    @Column(name = "current_version", nullable = false, length = Integer.MAX_VALUE)
    private String currentVersion;

    @Column(name = "code_hash", nullable = false, length = Integer.MAX_VALUE)
    private String codeHash;

    @ColumnDefault("now()")
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "app")
    private Set<Device> devices = new LinkedHashSet<>();

}