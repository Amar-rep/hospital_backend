package com.example_amar.central_athority.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "patient_key_records")
public class PatientKeyRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "patient_id", nullable = false, unique = true, length = 40)
    private String patientId;

    @Column(name = "name", nullable = false, length = Integer.MAX_VALUE)
    private String name;

    @Column(name = "father_id", nullable = false, length = Integer.MAX_VALUE)
    private String fatherId;

    @Column(name = "father_name", nullable = false, length = Integer.MAX_VALUE)
    private String fatherName;

    @Column(name = "address", nullable = false, length = Integer.MAX_VALUE)
    private String address;

    @Column(name = "phone", nullable = false, length = Integer.MAX_VALUE)
    private String phone;

    @Column(name = "password_hash", nullable = false, length = Integer.MAX_VALUE)
    private String passwordHash;

    @Column(name = "public_key", nullable = false, length = Integer.MAX_VALUE)
    private String publicKey;

    @Column(name = "private_key", nullable = false, length = Integer.MAX_VALUE)
    private String privateKey;

    @Column(name = "registered_at", nullable = false)
    private OffsetDateTime registeredAt;

    @Column(name = "access_expires_at", nullable = false)
    private OffsetDateTime accessExpiresAt;
}
