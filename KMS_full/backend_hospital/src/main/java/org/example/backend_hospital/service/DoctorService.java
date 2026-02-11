package main.java.org.example.backend_hospital.service;

import main.java.org.example.backend_hospital.dto.RegisterDoctorDTO;
import main.java.org.example.backend_hospital.entity.Department;
import main.java.org.example.backend_hospital.entity.Doctor;
import main.java.org.example.backend_hospital.exception.ResourceNotFoundException;
import org.example.backend_hospital.repository.DepartmentRepository;
import org.example.backend_hospital.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;

    public Doctor registerDoctor(RegisterDoctorDTO dto) {
        if (doctorRepository.findByDoctorIdKeccak(dto.getDoctorIdKeccak()).isPresent()) {
            throw new IllegalArgumentException("Doctor with keccak ID " + dto.getDoctorIdKeccak() + " already exists");
        }

        Doctor doctor = new Doctor();
        doctor.setDoctorIdKeccak(dto.getDoctorIdKeccak());
        doctor.setName(dto.getName());
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setEmail(dto.getEmail());
        doctor.setPhone(dto.getPhone());

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Department not found with ID: " + dto.getDepartmentId()));
            doctor.setDepartment(department);
        }

        return doctorRepository.save(doctor);
    }

    public Doctor findById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + id));
    }

    public Doctor findByKeccakId(String doctorIdKeccak) {
        return doctorRepository.findByDoctorIdKeccak(doctorIdKeccak)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with keccak ID: " + doctorIdKeccak));
    }

    public List<Doctor> findByDepartment(Long departmentId) {
        return doctorRepository.findByDepartmentId(departmentId);
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }
}
