package com.medivault.service;

import com.medivault.dto.AuthDto;
import com.medivault.entity.User;
import com.medivault.repository.UserRepository;
import com.medivault.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtUtils jwtUtils;

    public AuthDto.AuthResponse login(AuthDto.LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );
        String token = jwtUtils.generateToken(auth);
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return buildResponse(token, user);
    }

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + req.getEmail());
        }
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(User.Role.valueOf(req.getRole().toUpperCase()))
                .specialty(req.getSpecialty())
                .license(req.getLicense())
                .hospital(req.getHospital())
                .phone(req.getPhone())
                .build();
        userRepository.save(user);
        String token = jwtUtils.generateTokenFromEmail(user.getEmail());
        return buildResponse(token, user);
    }

    private AuthDto.AuthResponse buildResponse(String token, User user) {
        return new AuthDto.AuthResponse(
                token, user.getId(), user.getName(), user.getEmail(),
                user.getRole().name(), user.getSpecialty(),
                user.getLicense(), user.getHospital(), user.getPhone()
        );
    }
}
