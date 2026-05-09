package com.careerpilot.controller;

import com.careerpilot.dto.ApiResponse;
import com.careerpilot.model.User;
import com.careerpilot.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/linkedin")
@RequiredArgsConstructor
public class LinkedInController {

    private final AiService aiService;

    @PostMapping("/generate-post")
    public ResponseEntity<ApiResponse<Map<String, String>>> generatePost(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> req) {
        String content = aiService.generateLinkedInPost(
                req.getOrDefault("topic", "career milestone"),
                req.getOrDefault("context", ""),
                user.getName());
        return ResponseEntity.ok(ApiResponse.success(Map.of("content", content)));
    }

    @PostMapping("/generate-message")
    public ResponseEntity<ApiResponse<Map<String, String>>> generateMessage(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> req) {
        String content = aiService.generateRecruiterMessage(
                req.getOrDefault("context", ""), user.getName());
        return ResponseEntity.ok(ApiResponse.success(Map.of("content", content)));
    }

    @PostMapping("/generate-email")
    public ResponseEntity<ApiResponse<Map<String, String>>> generateEmail(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> req) {
        String content = aiService.generateEmail(
                req.getOrDefault("context", ""), user.getName());
        return ResponseEntity.ok(ApiResponse.success(Map.of("content", content)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Object>> getHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
