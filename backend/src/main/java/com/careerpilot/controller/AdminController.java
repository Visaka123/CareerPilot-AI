package com.careerpilot.controller;

import com.careerpilot.dto.ApiResponse;
import com.careerpilot.dto.AuthDto;
import com.careerpilot.model.User;
import com.careerpilot.repository.ApplicationRepository;
import com.careerpilot.repository.InterviewSessionRepository;
import com.careerpilot.repository.JobRepository;
import com.careerpilot.repository.ResumeRepository;
import com.careerpilot.repository.UserRepository;
import com.careerpilot.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final ResumeRepository resumeRepository;
    private final InterviewSessionRepository interviewSessionRepository;
    private final JobRepository jobRepository;
    private final AuthService authService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "totalUsers", userRepository.count(),
                "activeUsers", userRepository.countByActive(true),
                "totalApplications", applicationRepository.count(),
                "totalResumes", resumeRepository.count(),
                "totalInterviews", interviewSessionRepository.count(),
                "totalJobs", jobRepository.countByActive(true)
        )));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<AuthDto.UserDto>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuthDto.UserDto> users = userRepository
                .findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(authService::toDto);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AuthDto.UserDto>> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> req) {
        return userRepository.findById(id).map(user -> {
            if (req.containsKey("role")) {
                try { user.setRole(User.Role.valueOf(req.get("role"))); } catch (Exception ignored) {}
            }
            if (req.containsKey("plan")) {
                try { user.setPlan(User.Plan.valueOf(req.get("plan"))); } catch (Exception ignored) {}
            }
            if (req.containsKey("active")) {
                user.setActive(Boolean.parseBoolean(req.get("active")));
            }
            return ResponseEntity.ok(ApiResponse.success(authService.toDto(userRepository.save(user))));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        // Real counts per status
        long applied = applicationRepository.countByStatus(com.careerpilot.model.Application.Status.APPLIED);
        long interview = applicationRepository.countByStatus(com.careerpilot.model.Application.Status.INTERVIEW);
        long offer = applicationRepository.countByStatus(com.careerpilot.model.Application.Status.OFFER);
        long rejected = applicationRepository.countByStatus(com.careerpilot.model.Application.Status.REJECTED);

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "applicationsByStatus", Map.of(
                        "applied", applied, "interview", interview,
                        "offer", offer, "rejected", rejected
                ),
                "totalJobs", jobRepository.countByActive(true),
                "totalUsers", userRepository.count()
        )));
    }
}
