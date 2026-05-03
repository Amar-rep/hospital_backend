package com.example_amar.central_athority.controller;

import com.example_amar.central_athority.request.ChallengeRequest;
import com.example_amar.central_athority.request.RegisterRequest;
import com.example_amar.central_athority.request.TokenRequest;
import com.example_amar.central_athority.response.RegisterResponse;
import com.example_amar.central_athority.service.ChallengeService;
import com.example_amar.central_athority.service.RegistrationService;
import com.example_amar.central_athority.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequiredArgsConstructor
@RequestMapping("auth")
public class AuthController {
    private  final RegistrationService registrationService;
    private final ChallengeService ChallengeService;
    private final TokenService tokenService;
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {

            try {
                RegisterResponse response=registrationService.register(registerRequest);
                return ResponseEntity.status(200).body(response);
            }catch (IllegalArgumentException e)
            {
                return ResponseEntity.status(400).body(e.getMessage());
            }catch (SecurityException e)
            {
                return ResponseEntity.status(401).body(e.getMessage());
            }catch (Exception e)
            {
                return ResponseEntity.status(500).body("Internal server error");
            }


    }

    @PostMapping("/challenge")
    public ResponseEntity<?> challenge(@RequestBody ChallengeRequest challengeRequest) {
        try {
            return ResponseEntity.status(200).body(ChallengeService.generateChallenge(challengeRequest));
        }catch (IllegalArgumentException e)
        {
            return ResponseEntity.status(400).body(e.getMessage());
        }catch (SecurityException e)
        {
            return ResponseEntity.status(401).body(e.getMessage());
        }catch (Exception e)
        {
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    @PostMapping("/token")
    public ResponseEntity<?> token(@RequestBody TokenRequest tokenRequest) {
        try {
            tokenService.verifyToken(tokenRequest);
            return ResponseEntity.status(200).body(tokenService.generateTokenResponse(tokenRequest));
        }catch (IllegalArgumentException e)
        {
            return ResponseEntity.status(400).body(e.getMessage());
        }catch (SecurityException e)
        {
            return ResponseEntity.status(401).body(e.getMessage());
        }catch (Exception e)
        {
            return ResponseEntity.status(500).body("Internal server error");
        }
    }
}
