package com.medivault.controller;

import com.medivault.entity.Patient;
import com.medivault.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient")
public class PatientController {

    @Autowired
    private PatientService patientService;

    /**
     * GET /api/patient/all — Admin/Doctor: list all patients
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAll());
    }

    /**
     * GET /api/patient/{id} — Get patient by patient ID (e.g. P001)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<?> getPatient(@PathVariable("id") String id) {
        try {
            return ResponseEntity.ok(patientService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/patient/user/{userId} — Get patient by user ID (auth user)
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<?> getPatientByUserId(@PathVariable("userId") Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // Security check: patients can only access their own data
            // Note: In a production app, we'd use a custom UserDetails that includes the ID
            // but for this demo, we can verify by finding the user by email.

            // Allow DOCTOR and ADMIN by default
            boolean isStaff = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR") || a.getAuthority().equals("ROLE_ADMIN"));

            if (!isStaff) {
                // If patient, check if the email matches the requested userId's record
                // (This is a simplified check for demo purposes)
                Patient p = patientService.getByUserId(userId);
                if (!p.getUser().getEmail().equals(userDetails.getUsername())) {
                    return ResponseEntity.status(403).build();
                }
                return ResponseEntity.ok(p);
            }

            return ResponseEntity.ok(patientService.getByUserId(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/patient/qr/{patientId} — Doctor scans QR: returns patient summary
     */
    @GetMapping("/qr/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<?> getPatientByQr(@PathVariable("patientId") String patientId) {
        try {
            Patient p = patientService.getById(patientId);
            Map<String, Object> summary = new java.util.HashMap<>();
            summary.put("id", p.getId());
            summary.put("name", p.getName());
            summary.put("dob", p.getDob() != null ? p.getDob().toString() : "");
            summary.put("gender", p.getGender() != null ? p.getGender() : "");
            summary.put("bloodGroup", p.getBloodGroup() != null ? p.getBloodGroup() : "");
            summary.put("allergies", p.getAllergies() != null ? p.getAllergies() : List.of());
            summary.put("chronicConditions", p.getChronicConditions() != null ? p.getChronicConditions() : List.of());
            summary.put("emergencyContactName", p.getEmergencyContactName() != null ? p.getEmergencyContactName() : "");
            summary.put("emergencyContactRelation",
                    p.getEmergencyContactRelation() != null ? p.getEmergencyContactRelation() : "");
            summary.put("emergencyContactPhone",
                    p.getEmergencyContactPhone() != null ? p.getEmergencyContactPhone() : "");
            summary.put("phone", p.getPhone() != null ? p.getPhone() : "");
            summary.put("email", p.getEmail() != null ? p.getEmail() : "");
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
