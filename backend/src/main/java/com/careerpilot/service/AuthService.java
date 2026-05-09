package com.careerpilot.service;

import com.careerpilot.dto.AuthDto;
import com.careerpilot.exception.AppException;
import com.careerpilot.model.User;
import com.careerpilot.repository.UserRepository;
import com.careerpilot.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail().toLowerCase().trim())) {
            throw new AppException("An account with this email already exists");
        }
        User user = User.builder()
                .name(req.getName().trim())
                .email(req.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(req.getPassword()))
                .build();
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthDto.AuthResponse(toDto(user), token);
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new AppException("Invalid email or password"));
        if (!user.isActive()) {
            throw new AppException("Account is deactivated. Please contact support.");
        }
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new AppException("Invalid email or password");
        }
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthDto.AuthResponse(toDto(user), token);
    }

    public AuthDto.UserDto getProfile(User user) {
        // Always fetch fresh from DB to ensure latest data
        return userRepository.findById(user.getId())
                .map(this::toDto)
                .orElseThrow(() -> new AppException("User not found"));
    }

    @Transactional
    public AuthDto.UserDto updateProfile(User user, AuthDto.UpdateProfileRequest req) {
        User fresh = userRepository.findById(user.getId())
                .orElseThrow(() -> new AppException("User not found"));
        if (req.getName() != null && !req.getName().isBlank()) fresh.setName(req.getName().trim());
        if (req.getTitle() != null) fresh.setTitle(req.getTitle().trim());
        if (req.getLocation() != null) fresh.setLocation(req.getLocation().trim());
        if (req.getBio() != null) fresh.setBio(req.getBio().trim());
        if (req.getLinkedin() != null) fresh.setLinkedin(req.getLinkedin().trim());
        if (req.getGithub() != null) fresh.setGithub(req.getGithub().trim());
        return toDto(userRepository.save(fresh));
    }

    @Transactional
    public void changePassword(User user, String currentPassword, String newPassword) {
        if (currentPassword == null || newPassword == null) {
            throw new AppException("Current and new password are required");
        }
        if (newPassword.length() < 8) {
            throw new AppException("New password must be at least 8 characters");
        }
        User fresh = userRepository.findById(user.getId())
                .orElseThrow(() -> new AppException("User not found"));
        if (!passwordEncoder.matches(currentPassword, fresh.getPassword())) {
            throw new AppException("Current password is incorrect");
        }
        fresh.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(fresh);
    }

    public AuthDto.UserDto toDto(User user) {
        AuthDto.UserDto dto = new AuthDto.UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setTitle(user.getTitle());
        dto.setLocation(user.getLocation());
        dto.setBio(user.getBio());
        dto.setLinkedin(user.getLinkedin());
        dto.setGithub(user.getGithub());
        dto.setRole(user.getRole().name());
        dto.setPlan(user.getPlan().name());
        return dto;
    }
}
