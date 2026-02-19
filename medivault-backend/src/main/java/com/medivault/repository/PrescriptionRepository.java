package com.medivault.repository;

import com.medivault.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, String> {
    List<Prescription> findByPatientIdOrderByIssuedAtDesc(String patientId);
    List<Prescription> findByDoctorIdOrderByIssuedAtDesc(Long doctorId);
    List<Prescription> findByPatientIdAndStatus(String patientId, Prescription.Status status);
}
