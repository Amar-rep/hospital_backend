package com.example_amar.central_athority.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PatientRegistrationRequest {
    private String name;
    private String fatherId;
    private String fatherName;
    private String address;
    private String phone;
    private String password;
}
