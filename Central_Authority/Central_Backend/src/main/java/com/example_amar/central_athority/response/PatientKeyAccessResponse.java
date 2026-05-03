package com.example_amar.central_athority.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
public class PatientKeyAccessResponse {
    private String patientId;
    private String name;
    private String publicKey;
    private String privateKey;
    private OffsetDateTime accessExpiresAt;
}
