package org.example.backend_hospital.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend_hospital.dto.kms.*;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@RequiredArgsConstructor
public class KmsClientService {

    private final WebClient webClient;

    public void registerUser(KmsRegisterUserDTO request) {
        try {
            webClient.post()
                    .uri("/api/kms/users/register")
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, response -> response.bodyToMono(String.class).flatMap(
                            errorBody -> Mono.error(new RuntimeException("Error registering user: " + errorBody))))
                    .bodyToMono(String.class)
                    .block();
            log.info("Successfully registered user in KMS: {}", request.getName());
        } catch (Exception e) {
            log.error("Failed to register user in KMS", e);
            throw new RuntimeException("KMS User Registration Failed", e);
        }
    }

    public KmsAppUserDTO getUserByKeccak(String keccakId) {
        try {
            return webClient.get()
                    .uri("/api/kms/users/{keccakId}", keccakId)
                    .retrieve()
                    // 1. If 404, return an empty Mono (which results in null after .block())
                    .onStatus(status -> status.value() == 404, response -> Mono.empty())
                    // 2. For any other 4xx or 5xx error, extract the message and throw exception
                    .onStatus(HttpStatusCode::isError,
                            response -> response.bodyToMono(String.class).flatMap(
                                    errorBody -> Mono.error(new RuntimeException("KMS API Error: " + errorBody))))
                    .bodyToMono(KmsAppUserDTO.class)
                    .block(); // Returns null if status was 404

        } catch (RuntimeException e) {
            // This catches the error we threw in onStatus
            log.error("KMS API logic error for keccakId {}: {}", keccakId, e.getMessage());
            throw e;
        } catch (Exception e) {
            // This catches connection issues (Timeout, Connection Refused)
            log.error("KMS Server unreachable for keccakId: {}", keccakId, e);
            throw new RuntimeException("KMS Connection Failed", e);
        }
    }

    public KmsCreateGroupResponseDTO createGroup(KmsRegisterGroupDTO request) {
        try {
            return webClient.post()
                    .uri("/api/groups/create")
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, response -> response.bodyToMono(String.class).flatMap(
                            errorBody -> Mono.error(new RuntimeException("Error creating group: " + errorBody))))
                    .bodyToMono(KmsCreateGroupResponseDTO.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to create group in KMS", e);
            throw new RuntimeException("KMS Group Creation Failed", e);
        }
    }

    public KmsUploadResponseDTO uploadFile(KmsUploadFileDTO request) {
        try {
            return webClient.post()
                    .uri("/api/files/upload")
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, response -> response.bodyToMono(String.class).flatMap(
                            errorBody -> Mono.error(new RuntimeException("Error uploading file: " + errorBody))))
                    .bodyToMono(KmsUploadResponseDTO.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to upload file to KMS", e);
            throw new RuntimeException("KMS File Upload Failed", e);
        }
    }

    public byte[] downloadFile(KmsDownloadFileDTO request) {
        try {
            return webClient.post()
                    .uri("/api/files/download")
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, response -> response.bodyToMono(String.class).flatMap(
                            errorBody -> Mono.error(new RuntimeException("Error downloading file: " + errorBody))))
                    .bodyToMono(byte[].class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to download file from KMS", e);
            throw new RuntimeException("KMS File Download Failed", e);
        }
    }

    public KmsAllowAccessResponseDTO allowAccess(KmsAllowAccessDTO request) {
        try {
            return webClient.post()
                    .uri("/api/files/allow-access")
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, response -> response.bodyToMono(String.class).flatMap(
                            errorBody -> Mono.error(new RuntimeException("Error allowing access: " + errorBody))))
                    .bodyToMono(KmsAllowAccessResponseDTO.class)
                    .block();
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
