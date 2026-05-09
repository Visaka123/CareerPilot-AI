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
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final AiService aiService;

    @PostMapping("/message")
    public ResponseEntity<ApiResponse<Map<String, String>>> sendMessage(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> req) {
        String message = req.getOrDefault("message", "");
        if (message.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Message cannot be empty"));
        }
        // Build user context for personalized responses
        String userContext = buildUserContext(user);
        String response = aiService.careerChat(message, userContext);
        return ResponseEntity.ok(ApiResponse.success(Map.of("response", response)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Object>> getHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/history")
    public ResponseEntity<ApiResponse<Void>> clearHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success("History cleared", null));
    }

    private String buildUserContext(User user) {
        StringBuilder ctx = new StringBuilder();
        if (user.getName() != null) ctx.append("Name: ").append(user.getName()).append(". ");
        if (user.getTitle() != null) ctx.append("Title: ").append(user.getTitle()).append(". ");
        if (user.getLocation() != null) ctx.append("Location: ").append(user.getLocation()).append(". ");
        if (user.getBio() != null && !user.getBio().isBlank()) ctx.append("Bio: ").append(user.getBio()).append(". ");
        return ctx.toString();
    }
}
