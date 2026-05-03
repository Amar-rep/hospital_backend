package com.example_amar.central_athority.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
public class PatientRegistrationResponse {
    private String patientId;
    private String name;
    private String phone;
    private String publicKey;
    private OffsetDateTime registeredAt;
    private OffsetDateTime accessExpiresAt;
}
