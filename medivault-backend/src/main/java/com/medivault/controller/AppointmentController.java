package com.medivault.controller;

import com.medivault.dto.AppointmentDto;
import com.medivault.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    /**
     * POST /api/appointments — create a new appointment request
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody AppointmentDto.CreateRequest req,
                                    @AuthenticationPrincipal UserDetails userDetails) {
        try {
            AppointmentDto.AppointmentResponse appt =
                    appointmentService.create(req, userDetails != null ? userDetails.getUsername() : "");
            return ResponseEntity.ok(appt);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/appointments/patient/{patientId} — list appointments for a patient
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<List<AppointmentDto.AppointmentResponse>> getForPatient(
            @PathVariable("patientId") String patientId) {
        return ResponseEntity.ok(appointmentService.getForPatient(patientId));
    }

    /**
     * GET /api/appointments/doctor/{doctorId} — list appointments for a doctor
     */
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<List<AppointmentDto.AppointmentResponse>> getForDoctor(
            @PathVariable("doctorId") Long doctorId) {
        return ResponseEntity.ok(appointmentService.getForDoctor(doctorId));
    }

    /**
     * PATCH /api/appointments/{id}/status — update appointment status
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable("id") Long id,
                                          @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            return ResponseEntity.ok(appointmentService.updateStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

