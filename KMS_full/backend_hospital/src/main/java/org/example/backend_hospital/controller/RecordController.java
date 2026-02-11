package org.example.backend_hospital.controller;

import org.example.backend_hospital.dto.CreateRecordDTO;
import org.example.backend_hospital.entity.Record;
import org.example.backend_hospital.service.RecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospital/records")
@RequiredArgsConstructor
public class RecordController {

    private final RecordService recordService;

    @PostMapping
    public ResponseEntity<Record> createRecord(@RequestBody CreateRecordDTO dto) {
        return ResponseEntity.ok(recordService.createRecord(dto));
    }

    @GetMapping("/{recordId}")
    public ResponseEntity<Record> getRecordById(@PathVariable String recordId) {
        return ResponseEntity.ok(recordService.findById(recordId));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Record>> getRecordsByGroup(@PathVariable String groupId) {
        return ResponseEntity.ok(recordService.findByGroupId(groupId));
    }
}
