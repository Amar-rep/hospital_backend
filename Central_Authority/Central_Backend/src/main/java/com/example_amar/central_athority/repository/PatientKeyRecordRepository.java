package com.example_amar.central_athority.repository;

import com.example_amar.central_athority.model.PatientKeyRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientKeyRecordRepository extends JpaRepository<PatientKeyRecord, Long> {
    Optional<PatientKeyRecord> findByPatientId(String patientId);
}
