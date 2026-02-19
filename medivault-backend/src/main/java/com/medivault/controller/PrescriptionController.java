package com.medivault.controller;

import com.medivault.dto.PrescriptionDto;
import com.medivault.service.PrescriptionService;
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
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    /**
     * POST /api/prescriptions — Doctor issues a new prescription
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<?> create(
            @Valid @RequestBody PrescriptionDto.CreateRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            PrescriptionDto.PrescriptionResponse rx = prescriptionService.create(req, userDetails.getUsername());
            return ResponseEntity.ok(rx);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/prescriptions/patient/{patientId} — Get all prescriptions for a
     * patient
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<List<PrescriptionDto.PrescriptionResponse>> getForPatient(
            @PathVariable("patientId") String patientId) {
        return ResponseEntity.ok(prescriptionService.getForPatient(patientId));
    }

    /**
     * GET /api/prescriptions/doctor/{doctorId} — Get all prescriptions issued by a
     * doctor
     */
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<List<PrescriptionDto.PrescriptionResponse>> getByDoctor(
            @PathVariable("doctorId") Long doctorId) {
        return ResponseEntity.ok(prescriptionService.getByDoctor(doctorId));
    }

    /**
     * GET /api/prescriptions/{id} — Get single prescription by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<?> getById(@PathVariable("id") String id) {
        try {
            return ResponseEntity.ok(prescriptionService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PATCH /api/prescriptions/{id}/status — Update prescription status
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<?> updateStatus(
            @PathVariable("id") String id,
            @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(prescriptionService.updateStatus(id, body.get("status")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
