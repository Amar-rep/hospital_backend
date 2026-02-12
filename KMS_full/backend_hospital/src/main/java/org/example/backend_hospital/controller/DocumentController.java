package org.example.backend_hospital.controller;

import org.example.backend_hospital.dto.kms.KmsUploadFileDTO;
import org.example.backend_hospital.dto.kms.KmsUploadResponseDTO;
import org.example.backend_hospital.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DocumentService documentService;

    @PostMapping
    public ResponseEntity<KmsUploadResponseDTO> createDocument(@RequestBody KmsUploadFileDTO documentDTO) {
        return ResponseEntity.ok(documentService.createDocument(documentDTO));
    }
}
