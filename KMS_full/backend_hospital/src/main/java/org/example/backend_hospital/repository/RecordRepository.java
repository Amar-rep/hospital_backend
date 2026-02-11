package org.example.backend_hospital.repository;

import org.example.backend_hospital.entity.Record;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecordRepository extends JpaRepository<Record, String> {
    List<Record> findByGroupGroupId(String groupId);
}
