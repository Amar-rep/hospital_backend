package org.example.backend_hospital.dto;

import lombok.Data;

import java.util.Map;

@Data
public class CreateRecordDTO {
    private String recordId;
    private String groupId;
    private String cid;
    private Map<String, Object> metadata;
}
