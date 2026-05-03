package com.example_amar.central_athority.service;

import com.example_amar.central_athority.model.PatientKeyRecord;
import com.example_amar.central_athority.repository.PatientKeyRecordRepository;
import com.example_amar.central_athority.request.PatientKeyAccessRequest;
import com.example_amar.central_athority.request.PatientRegistrationRequest;
import com.example_amar.central_athority.response.PatientKeyAccessResponse;
import com.example_amar.central_athority.response.PatientRegistrationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientKeyRecordService {
    private static final int ACCESS_DAYS = 5;

    private final PatientKeyRecordRepository patientKeyRecordRepository;
    private final KeyGenerationService keyGenerationService;

    public PatientRegistrationResponse register(PatientRegistrationRequest request) throws Exception {
        validateRegistration(request);

        Map<String, String> keys = keyGenerationService.generateSecp256k1HexKeyPair();
        OffsetDateTime now = OffsetDateTime.now();

        PatientKeyRecord record = new PatientKeyRecord();
        record.setPatientId(createPatientId());
        record.setName(request.getName().trim());
        record.setFatherId(request.getFatherId().trim());
        record.setFatherName(request.getFatherName().trim());
        record.setAddress(request.getAddress().trim());
        record.setPhone(request.getPhone().trim());
        record.setPasswordHash(hashPassword(request.getPassword()));
        record.setPublicKey(keys.get("publicKey"));
        record.setPrivateKey(keys.get("privateKey"));
        record.setRegisteredAt(now);
        record.setAccessExpiresAt(now.plusDays(ACCESS_DAYS));

        PatientKeyRecord savedRecord = patientKeyRecordRepository.save(record);
        return new PatientRegistrationResponse(
                savedRecord.getPatientId(),
                savedRecord.getName(),
                savedRecord.getPhone(),
                savedRecord.getPublicKey(),
                savedRecord.getRegisteredAt(),
                savedRecord.getAccessExpiresAt()
        );
    }

    public PatientKeyAccessResponse getKeyPair(PatientKeyAccessRequest request) {
        if (isBlank(request.getPatientId()) || isBlank(request.getPassword())) {
            throw new IllegalArgumentException("Patient ID and password are required.");
        }

        PatientKeyRecord record = patientKeyRecordRepository.findByPatientId(request.getPatientId().trim())
                .orElseThrow(() -> new SecurityException("Invalid patient ID or password."));

        if (!record.getPasswordHash().equals(hashPassword(request.getPassword()))) {
            throw new SecurityException("Invalid patient ID or password.");
        }

        if (OffsetDateTime.now().isAfter(record.getAccessExpiresAt())) {
            throw new SecurityException("Key pair access expired on " + record.getAccessExpiresAt() + ".");
        }

        return new PatientKeyAccessResponse(
                record.getPatientId(),
                record.getName(),
                record.getPublicKey(),
                record.getPrivateKey(),
                record.getAccessExpiresAt()
        );
    }

    private void validateRegistration(PatientRegistrationRequest request) {
        if (request == null ||
                isBlank(request.getName()) ||
                isBlank(request.getFatherId()) ||
                isBlank(request.getFatherName()) ||
                isBlank(request.getAddress()) ||
                isBlank(request.getPhone()) ||
                isBlank(request.getPassword())) {
            throw new IllegalArgumentException("All patient registration fields are required.");
        }
    }

    private String createPatientId() {
        return "PAT-" + OffsetDateTime.now().getYear() + "-" +
                UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(password.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to hash password.", exception);
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
