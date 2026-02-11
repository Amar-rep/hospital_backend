package org.example.backend_hospital.service;

import org.example.backend_hospital.dto.CreateRecordDTO;
import org.example.backend_hospital.entity.Group;
import org.example.backend_hospital.entity.Record;
import org.example.backend_hospital.exception.ResourceNotFoundException;
import org.example.backend_hospital.repository.GroupRepository;
import org.example.backend_hospital.repository.RecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecordService {

    private final RecordRepository recordRepository;
    private final GroupRepository groupRepository;

    public Record createRecord(CreateRecordDTO dto) {
        if (recordRepository.existsById(dto.getRecordId())) {
            throw new IllegalArgumentException("Record with ID " + dto.getRecordId() + " already exists");
        }

        Group group = groupRepository.findByGroupId(dto.getGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with group ID: " + dto.getGroupId()));

        Record record = new Record();
        record.setRecordId(dto.getRecordId());
        record.setGroup(group);
        record.setCid(dto.getCid());
        record.setMetadata(dto.getMetadata());
        return recordRepository.save(record);
    }

    public Record findById(String recordId) {
        return recordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Record not found with ID: " + recordId));
    }

    public List<Record> findByGroupId(String groupId) {
        return recordRepository.findByGroupGroupId(groupId);
    }
}
