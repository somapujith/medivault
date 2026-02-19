package com.medivault.service;

import com.medivault.dto.PrescriptionDto;
import com.medivault.entity.*;
import com.medivault.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private UserRepository userRepository;

    @Transactional
    public PrescriptionDto.PrescriptionResponse create(PrescriptionDto.CreateRequest req, String doctorEmail) {
        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found: " + req.getPatientId()));
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        String rxId = "RX" + System.currentTimeMillis();

        Prescription rx = Prescription.builder()
                .id(rxId)
                .patient(patient)
                .doctor(doctor)
                .doctorName(doctor.getName())
                .doctorSpecialty(doctor.getSpecialty())
                .doctorLicense(doctor.getLicense())
                .doctorHospital(doctor.getHospital())
                .doctorPhone(doctor.getPhone())
                .visitReason(req.getVisitReason())
                .symptoms(req.getSymptoms())
                .diagnosis(req.getDiagnosis())
                .notes(req.getNotes())
                .followUp(req.getFollowUp())
                .labTests(req.getLabTests())
                .status(Prescription.Status.ACTIVE)
                .build();

        // Map medications
        if (req.getMedications() != null) {
            List<Medication> meds = req.getMedications().stream().map(m -> Medication.builder()
                    .prescription(rx)
                    .name(m.getName())
                    .dose(m.getDose())
                    .frequency(m.getFrequency())
                    .duration(m.getDuration())
                    .instructions(m.getInstructions())
                    .build()).collect(Collectors.toList());
            rx.setMedications(meds);
        }

        prescriptionRepository.save(rx);
        return toResponse(rx);
    }

    public List<PrescriptionDto.PrescriptionResponse> getForPatient(String patientId) {
        return prescriptionRepository.findByPatientIdOrderByIssuedAtDesc(patientId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<PrescriptionDto.PrescriptionResponse> getByDoctor(Long doctorId) {
        return prescriptionRepository.findByDoctorIdOrderByIssuedAtDesc(doctorId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PrescriptionDto.PrescriptionResponse getById(String id) {
        return toResponse(prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found: " + id)));
    }

    @Transactional
    public PrescriptionDto.PrescriptionResponse updateStatus(String id, String status) {
        Prescription rx = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found: " + id));
        rx.setStatus(Prescription.Status.valueOf(status.toUpperCase()));
        return toResponse(prescriptionRepository.save(rx));
    }

    private PrescriptionDto.PrescriptionResponse toResponse(Prescription rx) {
        PrescriptionDto.PrescriptionResponse r = new PrescriptionDto.PrescriptionResponse();
        r.setId(rx.getId());
        r.setPatientId(rx.getPatient().getId());
        r.setPatientName(rx.getPatient().getName());
        r.setDoctorId(rx.getDoctor().getId());
        r.setDoctorName(rx.getDoctorName());
        r.setDoctorSpecialty(rx.getDoctorSpecialty());
        r.setDoctorLicense(rx.getDoctorLicense());
        r.setDoctorHospital(rx.getDoctorHospital());
        r.setDoctorPhone(rx.getDoctorPhone());
        r.setVisitReason(rx.getVisitReason());
        r.setSymptoms(rx.getSymptoms());
        r.setDiagnosis(rx.getDiagnosis());
        r.setNotes(rx.getNotes());
        r.setFollowUp(rx.getFollowUp());
        r.setStatus(rx.getStatus().name().toLowerCase());
        r.setIssuedAt(rx.getIssuedAt() != null ? rx.getIssuedAt().toString() : null);
        r.setLabTests(rx.getLabTests());
        if (rx.getMedications() != null) {
            r.setMedications(rx.getMedications().stream().map(m -> {
                PrescriptionDto.MedicationItem mi = new PrescriptionDto.MedicationItem();
                mi.setName(m.getName());
                mi.setDose(m.getDose());
                mi.setFrequency(m.getFrequency());
                mi.setDuration(m.getDuration());
                mi.setInstructions(m.getInstructions());
                return mi;
            }).collect(Collectors.toList()));
        }
        return r;
    }
}
