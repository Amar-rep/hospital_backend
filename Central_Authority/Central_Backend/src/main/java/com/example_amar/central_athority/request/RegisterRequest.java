package com.example_amar.central_athority.request;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RegisterRequest {
    private String appId;
    private String deviceId;
    private String installerId;
    private String installerSignature;
}
