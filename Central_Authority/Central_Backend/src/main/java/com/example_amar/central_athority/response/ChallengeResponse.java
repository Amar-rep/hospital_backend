package com.example_amar.central_athority.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class ChallengeResponse {
    private String challengeId;
    private String serverRandom;
    private long timeStamp;
    private int validForSeconds;
}
