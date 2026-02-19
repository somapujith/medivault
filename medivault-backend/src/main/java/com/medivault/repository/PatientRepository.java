package com.medivault.repository;

import com.medivault.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, String> {
    Optional<Patient> findByUserId(Long userId);
    Optional<Patient> findByEmail(String email);
}
