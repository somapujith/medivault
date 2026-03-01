package com.medivault.controller;

import com.medivault.entity.Document;
import com.medivault.entity.Patient;
import com.medivault.repository.DocumentRepository;
import com.medivault.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@SuppressWarnings("null")
public class DocumentController {

    @Autowired
    private DocumentRepository documentRepository;
    @Autowired
    private PatientRepository patientRepository;

    /**
     * GET /api/documents/patient/{patientId}
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<List<Document>> getForPatient(@PathVariable("patientId") String patientId) {
        return ResponseEntity.ok(documentRepository.findByPatientIdOrderByDateDesc(patientId));
    }

    /**
     * POST /api/documents — Add a document record (metadata only for demo)
     * Patients can upload their own documents; doctors/admin can upload for any patient.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<?> addDocument(@RequestBody Map<String, String> body,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        String patientId = body.get("patientId");
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        boolean isPatientRole = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"));

        if (isPatientRole) {
            if (patient.getUser() == null || !patient.getUser().getEmail().equals(userDetails.getUsername())) {
                return ResponseEntity.status(403).build();
            }
        }

        Document doc = Document.builder()
                .id("DOC" + System.currentTimeMillis())
                .patient(patient)
                .name(body.get("name"))
                .type(body.get("type"))
                .date(LocalDate.now())
                .uploadedBy(body.get("uploadedBy"))
                .size(body.getOrDefault("size", "0 KB"))
                .fileUrl(body.get("fileUrl"))
                .build();

        return ResponseEntity.ok(documentRepository.save(doc));
    }

    /**
     * DELETE /api/documents/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable("id") String id) {
        documentRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Document deleted"));
    }
}
