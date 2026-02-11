package org.example.backend_hospital.controller;

import org.example.backend_hospital.dto.RegisterDoctorDTO;
import org.example.backend_hospital.entity.Doctor;
import org.example.backend_hospital.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospital/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping("/register")
    public ResponseEntity<Doctor> registerDoctor(@RequestBody RegisterDoctorDTO dto) {
        return ResponseEntity.ok(doctorService.registerDoctor(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.findById(id));
    }

    @GetMapping("/keccak/{doctorIdKeccak}")
    public ResponseEntity<Doctor> getDoctorByKeccakId(@PathVariable String doctorIdKeccak) {
        return ResponseEntity.ok(doctorService.findByKeccakId(doctorIdKeccak));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<Doctor>> getDoctorsByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(doctorService.findByDepartment(departmentId));
    }

    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }
}
