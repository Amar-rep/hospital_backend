package org.example.backend_hospital.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend_hospital.dto.kms.*;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Service
@Slf4j
@RequiredArgsConstructor
public class KmsClientService {

    private final RestClient restClient;

    public KmsAppUserDTO getUserByKeccak(String keccakId) {
        try {
            return restClient.get()
                    .uri("/api/kms/users/{keccakId}", keccakId)
                    .retrieve()
                    .body(KmsAppUserDTO.class);
        } catch (HttpClientErrorException.NotFound e) {
            return null; // Return null if 404 Not Found
        } catch (Exception e) {
            log.error("KMS call failed for keccakId {}: {}", keccakId, e.getMessage(), e);
            throw new RuntimeException("KMS Connection Failed", e);
        }
    }

    public KmsCreateGroupResponseDTO createGroup(KmsRegisterGroupDTO request) {
        try {
            return restClient.post()
                    .uri("/api/groups/create")
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        String errorBody = new String(res.getBody().readAllBytes());
                        throw new RuntimeException("Error creating group: " + errorBody);
                    })
                    .body(KmsCreateGroupResponseDTO.class);
        } catch (Exception e) {
            log.error("Failed to create group in KMS", e);
            throw new RuntimeException("KMS Group Creation Failed", e);
        }
    }

    public KmsUploadResponseDTO uploadFile(KmsUploadFileDTO request) {
        try {
            return restClient.post()
                    .uri("/api/files/upload")
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        String errorBody = new String(res.getBody().readAllBytes());
                        throw new RuntimeException("Error uploading file: " + errorBody);
                    })
                    .body(KmsUploadResponseDTO.class);
        } catch (Exception e) {
            log.error("Failed to upload file to KMS", e);
            throw new RuntimeException("KMS File Upload Failed", e);
        }
    }

    public byte[] downloadFile(KmsDownloadFileDTO request) {
        try {
            return restClient.post()
                    .uri("/api/files/download")
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        String errorBody = new String(res.getBody().readAllBytes());
                        throw new RuntimeException("Error downloading file: " + errorBody);
                    })
                    .body(byte[].class);
        } catch (Exception e) {
            // Log and rethrow
            log.error("Failed to download file from KMS", e);
            throw new RuntimeException("KMS File Download Failed", e);
        }
    }

    public KmsAllowAccessResponseDTO allowAccess(KmsAllowAccessDTO request) {
        try {
            return restClient.post()
                    .uri("/api/files/allow-access")
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        String errorBody = new String(res.getBody().readAllBytes());
                        throw new RuntimeException("Error allowing access: " + errorBody);
                    })
                    .body(KmsAllowAccessResponseDTO.class);
        } catch (Exception e) {
            log.error("Failed to allow access in KMS", e);
            throw new RuntimeException("KMS Allow Access Failed", e);
        }
    }

    public record KmsAppUser(
            Long id,
            String userIdKeccak,
            byte[] publicKey,
            String name,
            String physicalAddress,
            String phone) {
    }
}
