package com.example_amar.central_athority.repository;

import com.example_amar.central_athority.model.Installer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InstallerRepository extends JpaRepository<Installer,Integer> {
    Optional<Installer> findByInstallerUuid(UUID uuid);

}
