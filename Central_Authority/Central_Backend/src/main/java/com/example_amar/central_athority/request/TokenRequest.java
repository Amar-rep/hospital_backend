package com.example_amar.central_athority.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TokenRequest {
    private String appId;
    private String deviceId;
    private String registrationId;
    private String challengeId;
    private String clientNonce;
    private String clientHash;
    private long timestamp;
    private String signature;
}
