package com.careerpilot.controller;

import com.careerpilot.dto.ApiResponse;
import com.careerpilot.model.Application;
import com.careerpilot.model.User;
import com.careerpilot.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Application>>> getAll(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("User not authenticated"));
        }
        return ResponseEntity.ok(ApiResponse.success(applicationService.getAll(user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Application>> create(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> req) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("User not authenticated"));
        }
        return ResponseEntity.ok(ApiResponse.success(applicationService.create(user, req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Application>> update(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> req) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("User not authenticated"));
        }
        return ResponseEntity.ok(ApiResponse.success(applicationService.update(id, user, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("User not authenticated"));
        }
        applicationService.delete(id, user);
        return ResponseEntity.ok(ApiResponse.success("Deleted", null));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("User not authenticated"));
        }
        return ResponseEntity.ok(ApiResponse.success(applicationService.getStats(user)));
    }

    // Auto apply endpoints
    @PostMapping("/apply/{jobId}")
    public ResponseEntity<ApiResponse<Application>> applyJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("User not authenticated"));
        }
        return ResponseEntity.ok(ApiResponse.success(applicationService.applyJob(user, jobId)));
    }

    @PostMapping("/apply-all")
    public ResponseEntity<ApiResponse<List<Application>>> applyAllJobs(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("User not authenticated"));
        }
        return ResponseEntity.ok(ApiResponse.success(applicationService.applyAllJobs(user)));
    }

    @GetMapping("/status/{id}")
    public ResponseEntity<ApiResponse<Application>> getApplicationStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("User not authenticated"));
        }

        Application app = applicationService.getAll(user).stream()
                .filter(a -> a.getId().equals(id))
                .findFirst()
                .orElse(null);

        if (app == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(ApiResponse.success(app));
    }
}
