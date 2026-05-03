package com.example_amar.central_athority.controller;

import com.example_amar.central_athority.request.PatientKeyAccessRequest;
import com.example_amar.central_athority.request.PatientRegistrationRequest;
import com.example_amar.central_athority.response.PatientKeyAccessResponse;
import com.example_amar.central_athority.response.PatientRegistrationResponse;
import com.example_amar.central_athority.service.KeyGenerationService;
import com.example_amar.central_athority.service.PatientKeyRecordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/key")
@RequiredArgsConstructor
public class KeyController {

    private final KeyGenerationService keyGenerationService;
    private final PatientKeyRecordService patientKeyRecordService;

    @PostMapping("/patient/register")
    public ResponseEntity<?> registerPatient(@RequestBody PatientRegistrationRequest request) {
        try {
            PatientRegistrationResponse response = patientKeyRecordService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        } catch (Exception exception) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Unable to register patient."));
        }
    }

    @PostMapping("/patient/access")
    public ResponseEntity<?> accessPatientKeys(@RequestBody PatientKeyAccessRequest request) {
        try {
            PatientKeyAccessResponse response = patientKeyRecordService.getKeyPair(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        } catch (SecurityException exception) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", exception.getMessage()));
        }
    }

    @GetMapping("/generate")
    public Map<String, String> generateKeys() throws Exception {
        // directly get hex keys from service
        Map<String, String> keys = keyGenerationService.generateSecp256k1HexKeyPair();


        System.out.println("Private Key: " + keys.get("privateKey"));
        System.out.println("Public Key : " + keys.get("publicKey"));

        return keys; // returns Map<String,String> with hex keys
    }
    
    @GetMapping("/test")
    public String tester()
    {
        return "Success";
    }
}
