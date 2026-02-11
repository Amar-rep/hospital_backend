package org.example.backend_hospital.dto;

import lombok.Data;

@Data
public class CreateGroupDTO {
    private String groupId;
    private String name;
    private String userIdKeccak;
}
