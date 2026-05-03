package com.example_amar.central_athority.request;

import lombok.Getter;

@Getter
public class ChallengeRequest {
     private String appId;
     private String deviceId;
     private String registrationId; //will be converted to uuid
}
