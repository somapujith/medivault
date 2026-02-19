package com.medivault.controller;

import com.medivault.entity.User;
import com.medivault.repository.DocumentRepository;
import com.medivault.repository.PrescriptionRepository;
import com.medivault.repository.UserRepository;
import com.medivault.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private PrescriptionRepository prescriptionRepository;
    @Autowired
    private DocumentRepository documentRepository;

    /**
     * GET /api/admin/users — List all users
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    /**
     * DELETE /api/admin/users/{id} — Delete a user
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable("id") Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    /**
     * GET /api/admin/stats — System overview stats
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalUsers = userRepository.count();
        long totalPatients = patientRepository.count();
        long totalPrescriptions = prescriptionRepository.count();
        long doctors = userRepository.countByRole(User.Role.DOCTOR);

        return ResponseEntity.ok(Map.of(
                "users", totalUsers,
                "patients", totalPatients,
                "prescriptions", totalPrescriptions,
                "documents", documentRepository.count(),
                "doctors", doctors));
    }
}
