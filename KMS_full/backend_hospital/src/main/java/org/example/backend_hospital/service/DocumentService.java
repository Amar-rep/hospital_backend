package org.example.backend_hospital.service;

import org.example.backend_hospital.dto.kms.KmsUploadFileDTO;
import org.example.backend_hospital.dto.kms.KmsUploadResponseDTO;
import org.example.backend_hospital.repository.DoctorGroupRepository;
import org.example.backend_hospital.repository.DoctorRepository;
import org.example.backend_hospital.repository.GroupRepository;
import org.example.backend_hospital.service.KmsClientService;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final KmsClientService kmsClientService;
    private final DoctorRepository doctorRepository;
    private final GroupRepository groupRepository;
    private final DoctorGroupRepository doctorGroupRepository;

    public KmsUploadResponseDTO createDocument(KmsUploadFileDTO documentDTO) {
        // check if senderkeccak user exist in the hospital table as docter if not
        // exception
        System.out.println("Document Sender" + documentDTO.getSender_keccak());
        if (doctorRepository.findByDoctorIdKeccak(documentDTO.getSender_keccak()).isEmpty()) {
            throw new org.example.backend_hospital.exception.ResourceNotFoundException(
                    "Doctor not found with keccak id: " + documentDTO.getSender_keccak());
        }

        // check if group_id exist in the gropp table if not exception
        if (groupRepository.findByGroupId(documentDTO.getGroup_id()).isEmpty()) {
            throw new org.example.backend_hospital.exception.ResourceNotFoundException(
                    "Group not found with id: " + documentDTO.getGroup_id());
        }

        // check if groupid, dockterid pair exist in doctergroup entity if not exception
        if (doctorGroupRepository
                .findByGroupGroupIdAndDoctorDoctorIdKeccak(documentDTO.getGroup_id(), documentDTO.getSender_keccak())
                .isEmpty()) {
            throw new org.example.backend_hospital.exception.ResourceNotFoundException(
                    "Doctor is not part of the group");
        }

        // send document to kms using the kmsClientService uploadFile method
        return kmsClientService.uploadFile(documentDTO);
    }
}
