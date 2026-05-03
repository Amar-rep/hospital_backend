package com.example_amar.central_athority.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class RegisterResponse {
     private    String registrationId;
     private    String version;
     private    String appSecret;
}
