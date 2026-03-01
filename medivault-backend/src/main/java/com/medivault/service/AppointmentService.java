package com.medivault.service;

import com.medivault.dto.AppointmentDto;
import com.medivault.entity.Appointment;
import com.medivault.entity.Patient;
import com.medivault.entity.User;
import com.medivault.repository.AppointmentRepository;
import com.medivault.repository.PatientRepository;
import com.medivault.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private UserRepository userRepository;

    @Transactional
    public AppointmentDto.AppointmentResponse create(AppointmentDto.CreateRequest req, String requesterEmail) {
        if (req.getPatientId() == null || req.getDoctorId() == null || req.getStartTime() == null) {
            throw new RuntimeException("patientId, doctorId and startTime are required");
        }

        final String patientId = req.getPatientId();
        final Long doctorId = req.getDoctorId();

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found: " + patientId));
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found: " + doctorId));

        // Basic guard: ensure doctor role
        if (doctor.getRole() != User.Role.DOCTOR) {
            throw new RuntimeException("Selected user is not a doctor");
        }

        // Optional: ensure requester is either that patient or a staff member
        userRepository.findByEmail(requesterEmail).ifPresent(requester -> {
            if (requester.getRole() == User.Role.PATIENT) {
                if (patient.getUser() == null || !patient.getUser().getId().equals(requester.getId())) {
                    throw new RuntimeException("Patients can only create appointments for themselves");
                }
            }
        });

        LocalDateTime start;
        LocalDateTime end = null;
        try {
            start = LocalDateTime.parse(req.getStartTime());
            if (req.getEndTime() != null) {
                end = LocalDateTime.parse(req.getEndTime());
            }
        } catch (DateTimeParseException e) {
            throw new RuntimeException("Invalid date format. Use ISO-8601, e.g. 2026-03-02T10:30");
        }

        if (end != null && end.isBefore(start)) {
            throw new RuntimeException("End time cannot be before start time");
        }

        Appointment appt = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .startTime(start)
                .endTime(end)
                .reason(req.getReason() != null ? req.getReason() : "Consultation")
                .status(Appointment.Status.REQUESTED)
                .build();

        Appointment saved = appointmentRepository.save(appt);
        return toResponse(saved);
    }

    public List<AppointmentDto.AppointmentResponse> getForPatient(String patientId) {
        return appointmentRepository.findByPatientIdOrderByStartTimeDesc(patientId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentDto.AppointmentResponse> getForDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByStartTimeAsc(doctorId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentDto.AppointmentResponse updateStatus(Long id, String status) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found: " + id));
        appt.setStatus(Appointment.Status.valueOf(status.toUpperCase()));
        Appointment saved = appointmentRepository.save(appt);
        return toResponse(saved);
    }

    private AppointmentDto.AppointmentResponse toResponse(Appointment appt) {
        AppointmentDto.AppointmentResponse dto = new AppointmentDto.AppointmentResponse();
        dto.setId(appt.getId());
        dto.setPatientId(appt.getPatient().getId());
        dto.setPatientName(appt.getPatient().getName());
        dto.setDoctorId(appt.getDoctor().getId());
        dto.setDoctorName(appt.getDoctor().getName());
        dto.setDoctorSpecialty(appt.getDoctor().getSpecialty());
        dto.setDoctorHospital(appt.getDoctor().getHospital());
        dto.setReason(appt.getReason());
        dto.setStatus(appt.getStatus().name().toLowerCase());
        dto.setStartTime(appt.getStartTime());
        dto.setEndTime(appt.getEndTime());
        dto.setCreatedAt(appt.getCreatedAt());
        return dto;
    }
}

