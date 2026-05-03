package com.example_amar.central_athority.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PatientKeyAccessRequest {
    private String patientId;
    private String password;
}
