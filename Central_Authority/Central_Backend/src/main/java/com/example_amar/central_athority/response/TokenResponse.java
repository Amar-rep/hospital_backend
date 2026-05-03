package com.example_amar.central_athority.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TokenResponse {
    private String accessToken;
    private String tokenId;
    private long expiresIn;
    private long issuedAt; // epoch
}
